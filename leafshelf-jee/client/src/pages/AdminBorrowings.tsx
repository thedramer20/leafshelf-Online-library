import { useEffect, useRef, useState } from 'react';
import { adminReturnLoan, getAdminLoans } from '../lib/api';
import type { AdminLoanRecord } from '../lib/api';
import { useAdminGuard } from '../hooks/useAdminGuard';

interface ExtLoan extends AdminLoanRecord {
  overdue: boolean;
}

function StatusBadge({ status, overdue }: { status: string; overdue: boolean }) {
  if (overdue && status !== 'returned') {
    return <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: '#FEF2F2', color: '#DC2626' }}>Overdue</span>;
  }
  const map: Record<string, { bg: string; color: string }> = {
    active:   { bg: '#F0FDF4', color: '#1B4332' },
    approved: { bg: '#F0FDF4', color: '#1B4332' },
    returned: { bg: '#F3F4F6', color: '#6B7280' },
    pending:  { bg: '#FFF3E0', color: '#F59E0B' },
  };
  const s = map[status.toLowerCase()] ?? { bg: '#F3F4F6', color: '#6B7280' };
  return <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#1B4332', '#065F46', '#0F766E', '#0369A1', '#6D28D9', '#BE185D'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function fmt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminBorrowings() {
  useAdminGuard();

  const [loans, setLoans] = useState<ExtLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  function toExtLoan(l: AdminLoanRecord): ExtLoan {
    const now = new Date();
    const overdue = l.status !== 'returned' && l.dueAt != null && new Date(l.dueAt) < now;
    return { ...l, overdue };
  }

  useEffect(() => {
    getAdminLoans()
      .then(data => setLoans(data.map(toExtLoan)))
      .catch(() => setLoans([]))
      .finally(() => setLoading(false));
  }, []);

  async function markReturned(id: number) {
    try {
      await adminReturnLoan(id);
      setLoans(prev => prev.map(l => l.id === id
        ? { ...l, status: 'returned', returnedAt: new Date().toISOString(), overdue: false }
        : l
      ));
      showToast('Book marked as returned.');
    } catch {
      showToast('Failed to mark as returned.');
    }
  }

  const filtered = loans.filter(l => {
    const q = search.toLowerCase();
    if (q && !l.userName.toLowerCase().includes(q) && !l.bookTitle.toLowerCase().includes(q)) return false;
    if (tab === 'active' && (l.status === 'returned' || l.overdue)) return false;
    if (tab === 'returned' && l.status !== 'returned') return false;
    if (tab === 'overdue' && !l.overdue) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeCount = loans.filter(l => l.status !== 'returned' && !l.overdue).length;
  const returnedCount = loans.filter(l => l.status === 'returned').length;
  const overdueCount = loans.filter(l => l.overdue).length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading borrowings…</div>
    </div>
  );

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#F9FAFB' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: '#1B4332', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1B4332', margin: 0 }}>Borrowings & Returns</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{loans.length} total loan records</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Loans', val: loans.length, color: '#2563EB', sub: 'All time' },
          { label: 'Active', val: activeCount, color: '#059669', sub: 'Currently borrowed' },
          { label: 'Returned', val: returnedCount, color: '#6B7280', sub: 'Successfully returned' },
          { label: 'Overdue', val: overdueCount, color: '#DC2626', sub: overdueCount > 0 ? 'Needs attention' : 'All on time' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 18px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#374151', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', marginBottom: 20 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'all', label: `All (${loans.length})` },
              { key: 'active', label: `Active (${activeCount})` },
              { key: 'returned', label: `Returned (${returnedCount})` },
              { key: 'overdue', label: `Overdue (${overdueCount})` },
            ] as { key: typeof tab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1); }}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: tab === t.key ? '#1B4332' : '#F3F4F6',
                  color: tab === t.key ? '#fff' : '#6B7280',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search user or book…"
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', width: 220 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                {['#', 'Member', 'Book', 'Borrowed On', 'Due Date', 'Returned On', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No records found</td></tr>
              ) : paged.map((l, idx) => (
                <tr
                  key={l.id}
                  style={{ borderBottom: '1px solid #F9FAFB', background: l.overdue ? '#FFFBEB' : '' }}
                  onMouseEnter={e => { if (!l.overdue) e.currentTarget.style.background = '#FAFAFA'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = l.overdue ? '#FFFBEB' : ''; }}
                >
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#9CA3AF' }}>{(page - 1) * PER_PAGE + idx + 1}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={l.userName} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{l.userName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', maxWidth: 180 }}>
                    <span title={l.bookTitle}>{l.bookTitle.length > 28 ? l.bookTitle.slice(0, 28) + '…' : l.bookTitle}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmt(l.borrowedAt)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, whiteSpace: 'nowrap', color: l.overdue ? '#DC2626' : '#6B7280', fontWeight: l.overdue ? 600 : 400 }}>
                    {fmt(l.dueAt)}
                    {l.overdue && <span style={{ marginLeft: 4, fontSize: 10 }}>⚠</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmt(l.returnedAt)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status={l.status} overdue={l.overdue} />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {l.status !== 'returned' && (
                      <button
                        onClick={() => markReturned(l.id)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #D1FAE5', background: '#ECFDF5', color: '#059669', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
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
    </div>
  );
}
