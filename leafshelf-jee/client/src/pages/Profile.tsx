import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { myLoans } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Loan } from '../lib/types';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    if (user) myLoans().then(setLoans).catch(() => setLoans([]));
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const active  = loans.filter(l => l.active).length;
  const returned = loans.filter(l => !l.active).length;
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-ink"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Profile
        </h1>
        <p className="text-sm text-muted mt-1">Your account overview</p>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-card border border-border p-6 shadow-soft flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center text-paper text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink">{user.name}</h2>
            {user.is_admin && (
              <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                Admin
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-0.5">{user.email}</p>
          <p className="text-xs text-muted mt-1">Member since {memberSince}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/settings"
            className="px-4 py-2 border border-border text-xs font-semibold text-ink rounded-btn hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Reading stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Currently Reading', value: active,    bg: 'bg-blue-50',   text: 'text-blue-700',   icon: '📖' },
          { label: 'Books Completed',   value: returned,  bg: 'bg-green-50',  text: 'text-green-700',  icon: '✅' },
          { label: 'Days Active',       value: 7,         bg: 'bg-amber-50',  text: 'text-amber-700',  icon: '🔥' },
          { label: 'Genres Explored',   value: new Set(loans.map(l => l.category).filter(Boolean)).size, bg: 'bg-purple-50', text: 'text-purple-700', icon: '🎭' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-card border border-transparent p-4 text-center`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-[11px] text-muted mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-card border border-border p-5 shadow-soft">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/library"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-forest/5 hover:border-forest/20 border border-transparent transition-colors text-center"
          >
            <svg className="w-5 h-5 text-forest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <span className="text-xs font-semibold text-ink">My Library</span>
          </Link>
          <Link
            to="/settings"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-forest/5 hover:border-forest/20 border border-transparent transition-colors text-center"
          >
            <svg className="w-5 h-5 text-forest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-semibold text-ink">Settings</span>
          </Link>
          <button
            onClick={() => void signOut().then(() => navigate('/login'))}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-red-50 hover:border-red-100 border border-transparent transition-colors text-center"
          >
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="text-xs font-semibold text-red-500">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
