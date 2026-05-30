import { useState } from 'react';
import { useAdminGuard } from '../hooks/useAdminGuard';

interface AuditEntry {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  category: 'auth' | 'books' | 'users' | 'loans' | 'settings' | 'system';
  severity: 'info' | 'warning' | 'critical';
  ip: string;
}

const ACTION_ICONS: Record<string, string> = {
  auth: '🔐', books: '📚', users: '👤', loans: '📖', settings: '⚙️', system: '🖥',
};

const SEVERITY_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  info:     { bg: '#F0FDF4', color: '#1B4332', dot: '#4ADE80' },
  warning:  { bg: '#FFF3E0', color: '#F59E0B', dot: '#F59E0B' },
  critical: { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' },
};

function generateLog(): AuditEntry[] {
  const actors = ['Alice Johnson', 'Admin User', 'Bob Smith', 'System', 'Carol Williams', 'David Brown'];
  const events: Array<{ action: string; target: string; category: AuditEntry['category']; severity: AuditEntry['severity'] }> = [
    { action: 'User login', target: 'alice@example.com', category: 'auth', severity: 'info' },
    { action: 'Book added', target: '"The Midnight Library"', category: 'books', severity: 'info' },
    { action: 'Loan created', target: 'Book #12 → User #4', category: 'loans', severity: 'info' },
    { action: 'User suspended', target: 'bob@example.com', category: 'users', severity: 'warning' },
    { action: 'Settings changed', target: 'loanDurationDays = 21', category: 'settings', severity: 'warning' },
    { action: 'Book deleted', target: '"Old Yeller"', category: 'books', severity: 'critical' },
    { action: 'User role changed', target: 'carol@example.com → Admin', category: 'users', severity: 'warning' },
    { action: 'Maintenance mode ON', target: 'System', category: 'system', severity: 'critical' },
    { action: 'User logout', target: 'david@example.com', category: 'auth', severity: 'info' },
    { action: 'Loan returned', target: 'Book #7 by User #2', category: 'loans', severity: 'info' },
    { action: 'Category added', target: '"Graphic Novels"', category: 'books', severity: 'info' },
    { action: 'Failed login attempt', target: 'unknown@example.com', category: 'auth', severity: 'warning' },
    { action: 'Book edited', target: '"1984" — copies updated', category: 'books', severity: 'info' },
    { action: 'Overdue reminder sent', target: '3 users', category: 'system', severity: 'info' },
    { action: 'User account deleted', target: 'spam@example.com', category: 'users', severity: 'critical' },
    { action: 'Maintenance mode OFF', target: 'System', category: 'system', severity: 'info' },
    { action: 'Bulk import', target: '15 books imported', category: 'books', severity: 'info' },
    { action: 'Password reset', target: 'admin@leafshelf.com', category: 'auth', severity: 'warning' },
    { action: 'Max loans changed', target: '5 → 3', category: 'settings', severity: 'warning' },
    { action: 'Export generated', target: 'monthly-report.csv', category: 'system', severity: 'info' },
  ];

  const ips = ['192.168.1.1', '10.0.0.4', '172.16.0.8', '127.0.0.1', '203.0.113.5'];
  const now = Date.now();
  return Array.from({ length: 40 }, (_, i) => {
    const ev = events[i % events.length];
    return {
      id: 40 - i,
      timestamp: new Date(now - i * 7 * 60 * 1000 - Math.random() * 3 * 60 * 1000).toISOString(),
      actor: actors[i % actors.length],
      action: ev.action,
      target: ev.target,
      category: ev.category,
      severity: ev.severity,
      ip: ips[i % ips.length],
    };
  });
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAudit() {
  useAdminGuard();
  const [logs] = useState<AuditEntry[]>(generateLog);
  const [filter, setFilter] = useState<AuditEntry['category'] | 'all'>('all');
  const [severity, setSeverity] = useState<AuditEntry['severity'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.category !== filter) return false;
    if (severity !== 'all' && l.severity !== severity) return false;
    const q = search.toLowerCase();
    if (q && !l.action.toLowerCase().includes(q) && !l.actor.toLowerCase().includes(q) && !l.target.toLowerCase().includes(q)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const warningCount = logs.filter(l => l.severity === 'warning').length;

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#F9FAFB' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1B4332', margin: 0 }}>Audit Logs</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Complete trail of admin and system actions</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Events', val: logs.length, color: '#2563EB' },
          { label: 'Critical', val: criticalCount, color: '#DC2626' },
          { label: 'Warnings', val: warningCount, color: '#F59E0B' },
          { label: 'Info', val: logs.length - criticalCount - warningCount, color: '#059669' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 18px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', marginBottom: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search actions…" style={{ width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Category filter */}
          <select value={filter} onChange={e => { setFilter(e.target.value as typeof filter); setPage(1); }} style={{ padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff' }}>
            <option value="all">All Categories</option>
            {(['auth', 'books', 'users', 'loans', 'settings', 'system'] as const).map(c => (
              <option key={c} value={c}>{ACTION_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          {/* Severity filter */}
          <select value={severity} onChange={e => { setSeverity(e.target.value as typeof severity); setPage(1); }} style={{ padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff' }}>
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>{filtered.length} events</span>
        </div>

        {/* Log table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              {['Severity', 'Timestamp', 'Actor', 'Action', 'Target', 'Category', 'IP'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No events found</td></tr>
            ) : paged.map(log => {
              const sev = SEVERITY_STYLE[log.severity];
              return (
                <tr
                  key={log.id}
                  style={{ borderBottom: '1px solid #F9FAFB' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: sev.dot, display: 'inline-block' }} />
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmt(log.timestamp)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#111827' }}>{log.actor}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{log.action}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{log.target}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#F3F4F6', color: '#6B7280' }}>
                      {ACTION_ICONS[log.category]} {log.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{log.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12, color: page === 1 ? '#D1D5DB' : '#374151' }}>← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return <button type="button" key={pg} onClick={() => setPage(pg)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer', borderColor: pg === page ? '#1B4332' : '#E5E7EB', background: pg === page ? '#1B4332' : '#fff', color: pg === page ? '#fff' : '#374151' }}>{pg}</button>;
              })}
              <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12, color: page === totalPages ? '#D1D5DB' : '#374151' }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
