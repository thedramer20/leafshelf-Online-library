import { useEffect, useState } from 'react';
import { useAdminGuard } from '../hooks/useAdminGuard';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { getAdminStats } from '../lib/api';
import type { AdminStats } from '../lib/types';

const PIE_COLORS = ['#1B4332', '#4ADE80', '#A3E635', '#FCD34D', '#F87171', '#60A5FA', '#C084FC', '#FB923C'];

function generateMonthlyData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
    const base = 40 + Math.floor(Math.random() * 80);
    return {
      month: months[monthIdx],
      borrows: base,
      returns: Math.floor(base * (0.7 + Math.random() * 0.25)),
      newUsers: Math.floor(5 + Math.random() * 20),
    };
  });
}

function generateTopBooks() {
  return [
    { title: 'The Great Gatsby', borrows: 47 },
    { title: '1984', borrows: 41 },
    { title: 'To Kill a Mockingbird', borrows: 38 },
    { title: 'Dune', borrows: 35 },
    { title: 'The Hobbit', borrows: 29 },
    { title: 'Brave New World', borrows: 26 },
    { title: 'Animal Farm', borrows: 22 },
    { title: 'Fahrenheit 451', borrows: 19 },
  ];
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '18px 20px' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{sub}</div>
    </div>
  );
}

export default function AdminReports() {
  useAdminGuard();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [monthlyData] = useState(generateMonthlyData);
  const [topBooks] = useState(generateTopBooks);
  const [range, setRange] = useState<'3m' | '6m' | '12m'>('12m');

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {});
  }, []);

  const rangeSlice = range === '3m' ? 3 : range === '6m' ? 6 : 12;
  const chartData = monthlyData.slice(-rangeSlice);
  const pieData = stats?.categoryDistribution.map(c => ({ name: c.name, value: c.count })) ?? [];

  const totalBorrows = chartData.reduce((s, d) => s + d.borrows, 0);
  const totalReturns = chartData.reduce((s, d) => s + d.returns, 0);
  const totalNewUsers = chartData.reduce((s, d) => s + d.newUsers, 0);
  const returnRate = totalBorrows > 0 ? Math.round((totalReturns / totalBorrows) * 100) : 0;

  function handleExport() {
    const rows = [
      ['Month', 'Borrows', 'Returns', 'New Users'],
      ...chartData.map(d => [d.month, d.borrows, d.returns, d.newUsers]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `leafshelf-report-${range}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1B4332', margin: 0 }}>Reports & Analytics</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Library performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['3m', '6m', '12m'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: range === r ? '#fff' : 'transparent', color: range === r ? '#1B4332' : '#6B7280', boxShadow: range === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Books" value={stats?.totalBooks ?? '—'} sub={`${stats?.categoryDistribution.length ?? 0} categories`} color="#1B4332" />
        <StatCard label="Total Borrows" value={totalBorrows} sub={`Last ${range}`} color="#2563EB" />
        <StatCard label="Return Rate" value={`${returnRate}%`} sub="Books returned on time" color="#059669" />
        <StatCard label="New Members" value={totalNewUsers} sub={`Last ${range}`} color="#7C3AED" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginBottom: 16 }}>
        {/* Borrowing trend */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Borrowing Activity</h2>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Monthly borrows vs returns</p>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#6B7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B4332', display: 'inline-block' }} />Borrows</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />Returns</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="borrows" name="Borrows" stroke="#1B4332" strokeWidth={2.5} dot={{ fill: '#1B4332', r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="returns" name="Returns" stroke="#9CA3AF" strokeWidth={2} dot={{ fill: '#9CA3AF', r: 2 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category donut */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Category Distribution</h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>{pieData.length} categories</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={(v, n) => [`${v} books`, n]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>No data</div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top borrowed books */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Top Borrowed Books</h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Most popular titles</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topBooks} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="title" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={130} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={v => [`${v} borrows`, 'Count']} />
              <Bar dataKey="borrows" name="Borrows" fill="#1B4332" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New user registrations */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>New User Registrations</h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Monthly signups</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={v => [`${v} users`, 'New Users']} />
              <Bar dataKey="newUsers" name="New Users" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#1B4332' : '#4ADE80'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      {stats && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', marginTop: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Library Summary</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid #F3F4F6' }}>
            {[
              { label: 'Total Books', val: stats.totalBooks },
              { label: 'Total Members', val: stats.totalUsers },
              { label: 'Active Loans', val: stats.issuedBooks },
              { label: 'Overdue', val: stats.overdueBooks },
              { label: 'All-Time Loans', val: stats.totalLoans },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ padding: '16px 20px', borderRight: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1B4332' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
