import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useT } from '../hooks/useT';
import { getFavoriteIds, getLocalBorrowed, getLocalReturned } from '../lib/api';

type Notif = { icon: string; text: string; time: string };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function buildNotifications(): Notif[] {
  const borrowed = getLocalBorrowed();
  const returned = getLocalReturned();
  const favs = getFavoriteIds();
  const out: Notif[] = [];

  borrowed.slice(0, 3).forEach(b => {
    const due = new Date(b.dueAt);
    const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
    out.push({
      icon: '📖',
      text: days < 0
        ? `"${b.title}" is overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`
        : days <= 3
          ? `"${b.title}" is due in ${days} day${days === 1 ? '' : 's'}`
          : `You borrowed "${b.title}"`,
      time: b.borrowedAt,
    });
  });

  returned.slice(0, 2).forEach(b => {
    out.push({ icon: '✅', text: `You returned "${b.title}"`, time: b.returnedAt });
  });

  if (favs.length > 0) {
    out.push({ icon: '❤️', text: `You have ${favs.length} favorite${favs.length === 1 ? '' : 's'} saved`, time: 'today' });
  }

  if (out.length === 0) {
    out.push(
      { icon: '🌱', text: 'Welcome to LeafShelf — browse books to get started', time: 'just now' },
      { icon: '✨', text: 'Tip: tap the heart on any book to save it to Favorites', time: '1m ago' },
    );
  }

  return out;
}

export default function Topbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();
  const [query, setQuery] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [allRead, setAllRead] = useState(false);
  const prevNotifsKey = useRef('');

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    if (dropOpen || notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen, notifOpen]);

  const notifs = useMemo(() => buildNotifications(), [notifOpen, refreshTick]);

  useEffect(() => {
    const key = notifs.map(n => n.text).join('|');
    if (key !== prevNotifsKey.current) {
      prevNotifsKey.current = key;
      setAllRead(false);
    }
  }, [notifs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/books?search=${encodeURIComponent(query.trim())}`);
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="h-16 border-b border-border bg-white flex items-center px-6 gap-4 flex-shrink-0 z-10 shadow-soft sticky top-0">
      {/* Search + Categories (center, flexible) */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 flex-1 min-w-0">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('topbar.search')}
              className="bg-transparent flex-1 text-sm text-ink outline-none placeholder:text-gray-400 min-w-0"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#374151] flex items-center gap-1.5 flex-shrink-0 hover:bg-gray-50 transition-colors"
          >
            <span>{t('topbar.allCategories')}</span>
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </form>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => { setNotifOpen(v => !v); setRefreshTick(n => n + 1); }}
            className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {notifs.length > 0 && !allRead && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#1B4332] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {notifs.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-border rounded-xl shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-ink">{t('topbar.notifications')}</span>
                <button type="button" onClick={() => setAllRead(true)} className="text-xs text-forest-dark hover:underline font-medium">{t('topbar.markRead')}</button>
              </div>
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {notifs.map((n, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="text-xl flex-shrink-0 mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ink leading-relaxed">{n.text}</p>
                      <p className="text-[11px] text-muted mt-1">{/^\d{4}-\d{2}-\d{2}T/.test(n.time) ? timeAgo(n.time) : n.time}</p>
                    </div>
                    {!allRead && <span className="w-2 h-2 rounded-full bg-forest-dark flex-shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button type="button" onClick={() => { setNotifOpen(false); navigate('/library'); }}
                  className="text-xs text-forest-dark hover:underline font-medium w-full text-center">
                  {t('topbar.viewAll')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar + dropdown */}
        {user ? (
          <div ref={dropRef} className="relative">
            <button
              type="button"
              onClick={() => setDropOpen(v => !v)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-forest-dark flex items-center justify-center text-paper text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-ink font-medium">{t('topbar.greeting')}, {user.name.split(' ')[0]}</span>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${dropOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                <button
                  type="button"
                  onClick={() => { navigate('/profile'); setDropOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                >
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {t('topbar.profile')}
                </button>
                <button
                  type="button"
                  onClick={() => { navigate('/settings'); setDropOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                >
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('topbar.settings')}
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  onClick={() => { void signOut().then(() => navigate('/login')); setDropOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  {t('topbar.logout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-forest-dark font-medium hover:underline px-2"
          >
            {t('topbar.signIn')}
          </button>
        )}
      </div>
    </header>
  );
}
