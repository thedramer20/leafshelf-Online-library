import { useEffect, useRef, useState } from 'react';
import { getAdminUsers, createAdminUser, updateAdminUser, type AdminUserRecord } from '../lib/api';
import { useAdminGuard } from '../hooks/useAdminGuard';

// Status is a frontend-only concept stored in localStorage
const STATUS_KEY = 'leafshelf:admin:user-status';
function loadStatusMap(): Record<number, 'active' | 'suspended'> {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) ?? '{}'); } catch { return {}; }
}
function saveStatusMap(m: Record<number, 'active' | 'suspended'>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(m));
}

interface AdminUser extends AdminUserRecord {
  status: 'active' | 'suspended';
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#1B4332', '#065F46', '#0F766E', '#0369A1', '#6D28D9', '#BE185D'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function AdminUsers() {
  useAdminGuard();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'email' | 'created_at'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', is_admin: false });
  const [saving, setSaving] = useState(false);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  function mergeStatus(records: AdminUserRecord[]): AdminUser[] {
    const statusMap = loadStatusMap();
    return records.map(u => ({
      ...u,
      status: statusMap[u.id] ?? 'active',
    }));
  }

  useEffect(() => {
    getAdminUsers()
      .then(records => setUsers(mergeStatus(records)))
      .catch(() => setLoadErr('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleAdmin(u: AdminUser) {
    if (u.id === 1) { showToast("Cannot change the primary admin's role."); return; }
    const newVal = !u.is_admin;
    updateAdminUser(u.id, { is_admin: newVal })
      .then(updated => {
        const upd: AdminUser = { ...updated, status: u.status };
        setUsers(prev => prev.map(x => x.id === u.id ? upd : x));
        if (selectedUser?.id === u.id) setSelectedUser(upd);
        showToast(`${u.name} is now ${newVal ? 'an Admin' : 'a Member'}.`);
      })
      .catch(() => showToast('Failed to update role.'));
  }

  function toggleStatus(u: AdminUser) {
    if (u.id === 1) { showToast("Cannot suspend the primary admin."); return; }
    const newStatus: 'active' | 'suspended' = u.status === 'active' ? 'suspended' : 'active';
    const statusMap = loadStatusMap();
    statusMap[u.id] = newStatus;
    saveStatusMap(statusMap);
    const upd: AdminUser = { ...u, status: newStatus };
    setUsers(prev => prev.map(x => x.id === u.id ? upd : x));
    if (selectedUser?.id === u.id) setSelectedUser(upd);
    showToast(`${u.name} has been ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}.`);
  }

  function handleAddUser() {
    if (!newUser.name.trim() || !newUser.email.trim()) { showToast('Name and email required.'); return; }
    setSaving(true);
    createAdminUser({ name: newUser.name, email: newUser.email, password: newUser.password, is_admin: newUser.is_admin })
      .then(record => {
        const u: AdminUser = { ...record, status: 'active' };
        setUsers(prev => [u, ...prev]);
        setAddModal(false);
        setNewUser({ name: '', email: '', password: '', is_admin: false });
        showToast(`${u.name} added successfully.`);
      })
      .catch(err => showToast(err?.response?.data?.error ?? 'Failed to add user.'))
      .finally(() => setSaving(false));
  }

  function handleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    if (filterRole === 'admin' && !u.is_admin) return false;
    if (filterRole === 'member' && u.is_admin) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => {
    const va = String(a[sortKey]).toLowerCase();
    const vb = String(b[sortKey]).toLowerCase();
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const adminCount     = users.filter(u => u.is_admin).length;
  const activeCount    = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading users…</div>
    </div>
  );

  if (loadErr) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '16px 24px', color: '#DC2626', fontSize: 13 }}>{loadErr}</div>
    </div>
  );

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#F9FAFB' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: '#1B4332', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1B4332', margin: 0 }}>Users Management</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{users.length} registered members</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1B4332', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add User
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Users', val: users.length, color: '#2563EB' },
          { label: 'Admins', val: adminCount, color: '#7C3AED' },
          { label: 'Active', val: activeCount, color: '#059669' },
          { label: 'Suspended', val: suspendedCount, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff' }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Layout: table + detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 300px' : '1fr', gap: 16 }}>
        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                {[
                  { key: 'name', label: 'User', sortable: true },
                  { key: 'email', label: 'Email', sortable: true },
                  { key: 'role', label: 'Role', sortable: false },
                  { key: 'status', label: 'Status', sortable: false },
                  { key: 'created_at', label: 'Joined', sortable: true },
                  { key: 'actions', label: 'Actions', sortable: false },
                ].map(col => (
                  <th key={col.key} onClick={col.sortable ? () => handleSort(col.key as typeof sortKey) : undefined}
                    style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}>
                    {col.label}
                    {sortKey === col.key && <span style={{ marginLeft: 4, fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No users found</td></tr>
              ) : paged.map(u => (
                <tr key={u.id} onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                  style={{ borderBottom: '1px solid #F9FAFB', cursor: 'pointer', background: selectedUser?.id === u.id ? '#F0FDF4' : '' }}
                  onMouseEnter={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = '#FAFAFA'; }}
                  onMouseLeave={e => { if (selectedUser?.id !== u.id) e.currentTarget.style.background = ''; }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: u.is_admin ? '#F5F3FF' : '#F3F4F6', color: u.is_admin ? '#7C3AED' : '#6B7280' }}>
                      {u.is_admin ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: u.status === 'active' ? '#F0FDF4' : '#FEF2F2', color: u.status === 'active' ? '#059669' : '#DC2626' }}>
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmt(u.created_at)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleAdmin(u)} title={u.is_admin ? 'Remove admin' : 'Make admin'}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid', borderColor: u.is_admin ? '#DDD6FE' : '#E5E7EB', background: u.is_admin ? '#F5F3FF' : '#fff', cursor: 'pointer', fontSize: 11, color: u.is_admin ? '#7C3AED' : '#374151' }}>
                        {u.is_admin ? '⬇ Member' : '⬆ Admin'}
                      </button>
                      <button onClick={() => toggleStatus(u)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid', borderColor: u.status === 'active' ? '#FEE2E2' : '#D1FAE5', background: u.status === 'active' ? '#FEF2F2' : '#ECFDF5', cursor: 'pointer', fontSize: 11, color: u.status === 'active' ? '#DC2626' : '#059669' }}>
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ padding: '14px 18px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12, color: page === 1 ? '#D1D5DB' : '#374151' }}>← Prev</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return <button key={pg} onClick={() => setPage(pg)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer', borderColor: pg === page ? '#1B4332' : '#E5E7EB', background: pg === page ? '#1B4332' : '#fff', color: pg === page ? '#fff' : '#374151' }}>{pg}</button>;
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12, color: page === totalPages ? '#D1D5DB' : '#374151' }}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedUser && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 22, height: 'fit-content', position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1B4332' }}>User Details</span>
              <button onClick={() => setSelectedUser(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Avatar name={selectedUser.name} size={56} />
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginTop: 10 }}>{selectedUser.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{selectedUser.email}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: selectedUser.is_admin ? '#F5F3FF' : '#F3F4F6', color: selectedUser.is_admin ? '#7C3AED' : '#6B7280' }}>
                {selectedUser.is_admin ? 'Admin' : 'Member'}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: selectedUser.status === 'active' ? '#F0FDF4' : '#FEF2F2', color: selectedUser.status === 'active' ? '#059669' : '#DC2626' }}>
                {selectedUser.status === 'active' ? 'Active' : 'Suspended'}
              </span>
            </div>
            {[
              { label: 'User ID', val: `#${selectedUser.id}` },
              { label: 'Joined', val: fmt(selectedUser.created_at) },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => toggleAdmin(selectedUser)} style={{ padding: '9px 0', border: '1px solid #DDD6FE', borderRadius: 8, background: '#F5F3FF', color: '#7C3AED', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {selectedUser.is_admin ? 'Remove Admin Role' : 'Promote to Admin'}
              </button>
              <button onClick={() => toggleStatus(selectedUser)} style={{ padding: '9px 0', border: '1px solid', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', borderColor: selectedUser.status === 'active' ? '#FEE2E2' : '#D1FAE5', background: selectedUser.status === 'active' ? '#FEF2F2' : '#ECFDF5', color: selectedUser.status === 'active' ? '#DC2626' : '#059669' }}>
                {selectedUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1B4332', margin: 0 }}>Add New User</h2>
              <button onClick={() => setAddModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([['name', 'Full Name', 'text'], ['email', 'Email Address', 'email'], ['password', 'Password (optional)', 'password']] as [keyof typeof newUser, string, string][]).map(([f, label, type]) => (
                <div key={f}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                  <input
                    type={type}
                    value={newUser[f] as string}
                    onChange={e => setNewUser(u => ({ ...u, [f]: e.target.value }))}
                    placeholder={f === 'password' ? 'Leave blank for default' : ''}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="isAdminCheck" checked={newUser.is_admin} onChange={e => setNewUser(u => ({ ...u, is_admin: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#1B4332' }} />
                <label htmlFor="isAdminCheck" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>Grant admin privileges</label>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setAddModal(false)} style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}>Cancel</button>
              <button onClick={handleAddUser} disabled={saving} style={{ padding: '9px 18px', background: '#1B4332', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', color: '#fff' }}>
                {saving ? 'Adding…' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
