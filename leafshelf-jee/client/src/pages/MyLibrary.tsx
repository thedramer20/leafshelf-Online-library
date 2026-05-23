import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage, borrow, listBooks, myLoans, returnLoan } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book, Loan } from '../lib/types';

type Tab = 'reading' | 'saved' | 'history' | 'list';
const TABS: { id: Tab; label: string; count?: number }[] = [
  { id: 'reading', label: '📖 Currently Reading' },
  { id: 'saved', label: '🔖 Saved Books' },
  { id: 'history', label: '🕐 Borrow History' },
  { id: 'list', label: '≡ Reading List' },
];

const PROGRESS = [72, 45, 30, 15, 60, 20];

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysLeft(due: string) {
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function DueBadge({ due }: { due: string }) {
  const d = daysLeft(due);
  if (d < 0) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">Overdue</span>;
  if (d <= 3) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">{d}d left</span>;
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">{d}d left</span>;
}

function GoalRing({ pct }: { pct: number }) {
  const r = 28; const circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1B4332" strokeWidth="8"
        strokeDasharray={`${pct * circ} ${circ - pct * circ}`} strokeLinecap="round" />
    </svg>
  );
}

export default function MyLibrary() {
  const navigate = useNavigate();
  const { } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recBooks, setRecBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('reading');
  const [returning, setReturning] = useState<number | null>(null);
  const [returnMsg, setReturnMsg] = useState<string | null>(null);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, b] = await Promise.all([myLoans(), listBooks()]);
      setLoans(l);
      setRecBooks(b.filter(bk => bk.available).slice(0, 2));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleReturn(loanId: number) {
    setReturning(loanId);
    try {
      await returnLoan(loanId);
      setReturnMsg('Book returned successfully!');
      await load();
      setTimeout(() => setReturnMsg(null), 3000);
    } catch (err) {
      setReturnMsg(apiErrorMessage(err));
    } finally {
      setReturning(null);
    }
  }

  async function handleBorrow(bookId: number) {
    setBorrowingId(bookId);
    try { await borrow(bookId); await load(); } catch { /* ignore */ } finally { setBorrowingId(null); }
  }

  const activeLoans = loans.filter(l => l.active);
  const returnedLoans = loans.filter(l => !l.active);
  const dueSoon = activeLoans.filter(l => { const d = daysLeft(l.due_at); return d >= 0 && d <= 7; });

  const statCards = [
    { icon: '📖', label: 'Currently Reading', value: activeLoans.length, sub: null, iconBg: 'bg-[#E8F5E9]' },
    { icon: '🔖', label: 'Borrowed', value: activeLoans.length, sub: dueSoon.length > 0 ? `${dueSoon.length} due soon` : null, iconBg: 'bg-[#FFF3E0]' },
    { icon: '♡', label: 'Saved', value: 12, sub: null, iconBg: 'bg-[#FCE4EC]' },
    { icon: '✓', label: 'Completed', value: returnedLoans.length, sub: null, iconBg: 'bg-[#F0FDF4]' },
  ];

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="font-serif text-[32px] font-bold text-ink">My Library</h1>
          <p className="text-sm text-muted mt-1">Your personal space to manage and track your reading journey.</p>
        </div>

        {returnMsg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${returnMsg.includes('success') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {returnMsg}
          </div>
        )}

        {/* 4 stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map(({ icon, label, value, sub, iconBg }) => (
            <div key={label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <span className="text-xl">{icon}</span>
              </div>
              <div>
                <p className="font-serif text-[28px] font-bold text-[#1B4332] leading-none">{value}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
                {sub && <p className="text-[10px] text-amber-600 font-medium mt-0.5">{sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'text-forest-dark border-forest-dark' : 'text-muted border-transparent hover:text-ink'
              }`}>
              {t.label}
              {t.id === 'reading' && activeLoans.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-forest-dark text-white px-1.5 py-0.5 rounded-full">{activeLoans.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : tab === 'reading' ? (
          activeLoans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📖</p>
              <p className="font-semibold text-ink mb-1">No active loans</p>
              <p className="text-sm text-muted mb-4">Browse our collection and borrow a book to get started</p>
              <button onClick={() => navigate('/books')} className="px-5 py-2.5 bg-forest-dark text-white text-sm font-semibold rounded-xl hover:bg-forest transition-colors">
                Browse Books
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-base font-semibold text-[#1B4332] mb-2">Continue where you left off</p>
              {activeLoans.map((loan, idx) => {
                const progress = PROGRESS[idx % PROGRESS.length];
                return (
                  <div key={loan.id} className="bg-white rounded-card border border-border shadow-soft p-4 flex gap-4">
                    <div className="w-14 flex-shrink-0 rounded-lg overflow-hidden" style={{ height: '84px' }}>
                      {loan.cover_url
                        ? <img src={loan.cover_url} alt={loan.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-forest-dark/20 to-forest-dark/40 flex items-center justify-center"><span className="text-lg">📚</span></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-ink line-clamp-1">{loan.title ?? 'Untitled'}</p>
                          <p className="text-xs text-muted italic">{loan.author}</p>
                        </div>
                        <DueBadge due={loan.due_at} />
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted">{loan.pages ? `${loan.category ?? ''} • ${loan.pages} pages` : loan.category ?? ''}</span>
                          <span className="font-medium text-ink">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-[4px]">
                          <div className="bg-forest-dark rounded-full h-[4px] transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <p className="text-[11px] text-muted flex-1">Due: {formatDate(loan.due_at)}</p>
                        <button onClick={() => navigate(`/books/${loan.book_id}`)}
                          className="px-3 py-1.5 text-xs font-semibold border border-forest-dark/20 text-forest-dark rounded-lg hover:bg-forest-dark/5 transition-colors">
                          Continue Reading
                        </button>
                        <button onClick={() => void handleReturn(loan.id)} disabled={returning === loan.id}
                          className="px-3 py-1.5 text-xs font-semibold border border-border text-muted rounded-lg hover:bg-gray-50 hover:text-ink transition-colors">
                          {returning === loan.id ? 'Returning…' : 'Return'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => navigate('/books')}
                className="w-full py-3 rounded-xl text-sm font-medium text-forest-dark border border-forest-dark/20 hover:bg-forest-dark/5 transition-colors mt-2">
                View All Currently Reading
              </button>
            </div>
          )
        ) : tab === 'history' ? (
          returnedLoans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold text-ink">No borrow history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {returnedLoans.map(loan => (
                <div key={loan.id} className="bg-white rounded-card border border-border shadow-soft p-4 flex gap-4 items-center">
                  <div className="w-12 flex-shrink-0 rounded-lg overflow-hidden" style={{ height: '72px' }}>
                    {loan.cover_url
                      ? <img src={loan.cover_url} alt={loan.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><span>📚</span></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink">{loan.title ?? 'Untitled'}</p>
                    <p className="text-xs text-muted">{loan.author}</p>
                    <p className="text-xs text-muted mt-1">Borrowed {formatDate(loan.borrowed_at)} · Returned {formatDate(loan.returned_at)}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Returned</span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔖</p>
            <p className="font-semibold text-ink mb-1">Coming soon</p>
            <p className="text-sm text-muted">This feature is under development</p>
          </div>
        )}
      </div>

      {/* Right panel */}
      <aside className="w-64 flex-shrink-0 space-y-4">
        {/* Reading Goal */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-4">Your Reading Goal</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <GoalRing pct={0.75} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-forest-dark">75%</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-ink">12 <span className="text-sm font-normal text-muted">Books</span></p>
              <p className="text-xs text-muted">4h 35m Reading Time</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
            <span>🔥</span>
            <span className="text-xs font-semibold text-amber-700">5 Days in a row!</span>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">Goal: 16 books / month</span>
              <span className="font-medium">12/16</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-forest-dark rounded-full h-1.5" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        {/* Due soon */}
        {dueSoon.length > 0 && (
          <div className="bg-white rounded-card border border-border shadow-soft p-4">
            <h3 className="font-semibold text-sm text-ink mb-3">Due Soon</h3>
            <div className="space-y-3">
              {dueSoon.slice(0, 3).map(loan => (
                <div key={loan.id} className="flex gap-2 items-center">
                  <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                    {loan.cover_url && <img src={loan.cover_url} alt={loan.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink line-clamp-1">{loan.title}</p>
                    <p className="text-[10px] text-red-600 font-medium mt-0.5">Due {formatDate(loan.due_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        {recBooks.length > 0 && (
          <div className="bg-white rounded-card border border-border shadow-soft p-4">
            <h3 className="font-semibold text-sm text-ink mb-3">Recommended For You</h3>
            <div className="space-y-3">
              {recBooks.map(book => (
                <div key={book.id} className="flex gap-2 items-center">
                  <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/books/${book.id}`)}>
                    {book.cover_url && <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink line-clamp-1 cursor-pointer hover:text-forest-dark"
                      onClick={() => navigate(`/books/${book.id}`)}>
                      {book.title}
                    </p>
                    <p className="text-[10px] text-muted truncate">{book.author}</p>
                    <button onClick={() => void handleBorrow(book.id)} disabled={borrowingId === book.id}
                      className="mt-1 text-[10px] px-2 py-0.5 bg-forest-dark text-white rounded font-semibold hover:bg-forest transition-colors">
                      {borrowingId === book.id ? '…' : 'Borrow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
