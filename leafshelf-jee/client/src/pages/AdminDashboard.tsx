import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getAdminStats } from '../lib/api';
import { useAdminGuard } from '../hooks/useAdminGuard';
import type { AdminStats } from '../lib/types';

// ── Placeholder data ──────────────────────────────────────────────
const ACTIVITY_DATA = [
  { day: 'May 1', borrows: 45, returns: 32 },
  { day: 'May 6', borrows: 98, returns: 67 },
  { day: 'May 11', borrows: 145, returns: 89 },
  { day: 'May 16', borrows: 218, returns: 134 },
  { day: 'May 21', borrows: 176, returns: 112 },
  { day: 'May 26', borrows: 134, returns: 98 },
  { day: 'May 31', borrows: 87, returns: 65 },
];

const PIE_COLORS = ['#1B4332', '#4ADE80', '#A3E635', '#FCD34D', '#F87171', '#D1D5DB'];

// ── Sub-components ────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  iconBg,
  sub,
  subColor,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-[30px] font-bold text-[#1B4332] leading-none">{value}</div>
        <div className="text-sm text-[#6B7280] mt-1">{label}</div>
        {sub && (
          <div className={`text-[11px] mt-1 font-medium ${subColor ?? 'text-gray-400'}`}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-[#F0FDF4] text-[#1B4332]',
    active:   'bg-[#F0FDF4] text-[#1B4332]',
    pending:  'bg-[#FFF3E0] text-[#F59E0B]',
  };
  const key = status.toLowerCase();
  const cls = styles[key] ?? 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function fmt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Main component ────────────────────────────────────────────────
export default function AdminDashboard() {
  useAdminGuard();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setLoadErr('Failed to load dashboard data.'));
  }, []);

  if (!stats && !loadErr) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm animate-pulse">Loading dashboard…</div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600 text-sm">{loadErr}</div>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = stats.categoryDistribution.map(c => ({ name: c.name, value: c.count }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[28px] font-bold text-[#1B4332]">Welcome back, Admin 🌿</h1>
          <p className="text-sm text-[#6B7280] mt-1">Here's what's happening in your library today.</p>
        </div>
        <button
          onClick={() => {
            if (!stats) return;
            const lines = [
              'Metric,Value',
              `Total Books,${stats.totalBooks}`,
              `Total Users,${stats.totalUsers}`,
              `Issued Books,${stats.issuedBooks}`,
              `Overdue Books,${stats.overdueBooks}`,
              `Total Loans,${stats.totalLoans}`,
              '',
              'Category,Books',
              ...stats.categoryDistribution.map(c => `${c.name},${c.count}`),
              '',
              'User,Book,Borrowed Date,Due Date,Status',
              ...stats.recentLoans.map(l =>
                `"${l.userName}","${l.bookTitle}",${l.borrowedAt ? new Date(l.borrowedAt).toLocaleDateString() : ''},${l.dueAt ? new Date(l.dueAt).toLocaleDateString() : ''},${l.status}`
              ),
            ];
            const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leafshelf-report-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Export Report
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Books"
          value={stats.totalBooks}
          iconBg="bg-blue-50 text-blue-600"
          sub={`${stats.categoryDistribution.length} categories`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          }
        />
        <StatCard
          label="Active Users"
          value={stats.totalUsers}
          iconBg="bg-green-50 text-green-600"
          sub="Registered members"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          label="Issued Books"
          value={stats.issuedBooks}
          iconBg="bg-amber-50 text-amber-600"
          sub="Currently borrowed"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          }
        />
        <StatCard
          label="Overdue Books"
          value={stats.overdueBooks}
          iconBg="bg-red-50 text-red-600"
          sub={stats.overdueBooks > 0 ? 'Requires attention' : 'All on time'}
          subColor={stats.overdueBooks > 0 ? 'text-red-500' : 'text-green-500'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-[1fr_380px] gap-4">
        {/* Borrowing Activity — recharts LineChart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Borrowing Activity</h2>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Last 7 days · placeholder</span>
          </div>
          <div className="flex gap-4 text-xs text-[#6B7280] mb-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1B4332]"/>Issued</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9CA3AF]"/>Returned</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ACTIVITY_DATA} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                itemStyle={{ color: '#374151' }}
              />
              <Line
                type="monotone"
                dataKey="borrows"
                name="Borrows"
                stroke="#1B4332"
                strokeWidth={2}
                dot={{ fill: '#1B4332', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="returns"
                name="Returns"
                stroke="#9CA3AF"
                strokeWidth={2}
                dot={{ fill: '#9CA3AF', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution — recharts PieChart donut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Category Distribution</h2>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{stats.categoryDistribution.length} categories</span>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(val, name) => [String(val) + ' books', name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row: Recent Requests (left) + Quick Actions + System Overview (right) ── */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
      {/* LEFT: Recent Borrow Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Borrow Requests</h2>
          <button onClick={() => navigate('/admin/borrowings')} className="text-xs text-[#1B4332] hover:underline font-medium">View all →</button>
        </div>

        {stats.recentLoans.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No borrowing activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="pb-2.5 font-semibold pr-4">User</th>
                  <th className="pb-2.5 font-semibold pr-4">Book</th>
                  <th className="pb-2.5 font-semibold pr-4">Request Date</th>
                  <th className="pb-2.5 font-semibold pr-4">Due Date</th>
                  <th className="pb-2.5 font-semibold pr-4">Status</th>
                  <th className="pb-2.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {loan.userName?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-gray-900 truncate max-w-[100px]">{loan.userName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-gray-600 truncate max-w-[140px] block">{loan.bookTitle}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-gray-500 whitespace-nowrap">{fmt(loan.borrowedAt)}</td>
                    <td className="py-2.5 pr-4 text-xs text-gray-500 whitespace-nowrap">{fmt(loan.dueAt)}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="py-2.5">
                      <button onClick={() => navigate('/admin/borrowings')} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>{/* end left card */}

      {/* RIGHT: Quick Actions + System Overview stacked */}
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add New Book',  icon: '📚', path: '/admin/books' },
              { label: 'Add New User',  icon: '👤', path: '/admin/users' },
              { label: 'Issue Book',    icon: '📤', path: '/admin/borrowings' },
              { label: 'View Overdues', icon: '⚠️', path: '/admin/borrowings' },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="flex flex-col items-center gap-2 p-4 border border-[#E5E7EB] rounded-lg text-sm hover:bg-[#F9FAFB] transition-colors"
              >
                <span className="text-xl">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6]">
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                Total Members
              </span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6]">
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                Librarians
              </span>
              <span className="text-sm font-semibold text-gray-900">5</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6]">
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                Active Sessions
              </span>
              <span className="text-sm font-semibold text-green-600">12</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6]">
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                Total Borrowings
              </span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalLoans}</span>
            </div>
            {/* Storage */}
            <div className="pt-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>
                  Storage Used
                </span>
                <span className="text-xs font-semibold text-gray-900">68%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-amber-400 transition-all"
                  style={{ width: '68%' }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">6.8 GB of 10 GB used</p>
            </div>
          </div>
        </div>
      </div>{/* end right stacked column */}
      </div>{/* end bottom grid row */}
    </div>
  );
}
