import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { borrow, listBooks, listCategories } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';
import { VintageBookCover } from '../components/VintageBookCover';

const CAT_EMOJI: Record<string, string> = {
  Classic: '📚', Fantasy: '✨', Dystopian: '⚠️', Fiction: '💡',
  'Science Fiction': '🚀', Romance: '💕', Science: '🔬',
  'Self-Help': '🌱', 'Historical Fiction': '🏛️', Memoir: '📝', 'Non-Fiction': '🧠',
};

const HARDCODED_COUNTS: Record<string, number> = {
  Fiction: 12540,
  'Non-Fiction': 9876,
  Science: 7231,
  Business: 6342,
  History: 4307,
  Classic: 4100,
  Fantasy: 3890,
  Dystopian: 2450,
  Romance: 5678,
  Memoir: 2100,
  'Science Fiction': 4895,
  'Self-Help': 5231,
  'Historical Fiction': 3782,
};

const CAT_COLORS = [
  { bg: '#F0FDF4', border: '#D1FAE5', text: '#065F46' },
  { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' },
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { bg: '#FDF4FF', border: '#E9D5FF', text: '#6B21A8' },
  { bg: '#ECFEFF', border: '#A5F3FC', text: '#155E75' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239' },
  { bg: '#F0FDF4', border: '#D1FAE5', text: '#065F46' },
  { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  { bg: '#F5F3FF', border: '#DDD6FE', text: '#4C1D95' },
  { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' },
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
];

const FEATURED_BG: Record<string, string> = {
  'Award Winners': '#FFF8E7',
  'Books to Inspire You': '#F0FDF4',
  'Timeless Classics': '#F5F3FF',
  'New Releases': '#FFF1F2',
};

const FEATURED = [
  { emoji: '🏆', title: 'Award Winners', sub: 'Curated reads' },
  { emoji: '🌱', title: 'Books to Inspire You', sub: 'Handpicked favorites' },
  { emoji: '📜', title: 'Timeless Classics', sub: 'Enduring stories' },
  { emoji: '✨', title: 'New Releases', sub: 'Fresh books' },
];

const TOP_CATEGORIES = [
  { name: 'Fiction', reads: '12,450' },
  { name: 'Science Fiction', reads: '9,230' },
  { name: 'Fantasy', reads: '8,760' },
  { name: 'Classic', reads: '7,410' },
  { name: 'Self-Help', reads: '6,890' },
];

const TRENDING = [
  'Mindfulness', 'Artificial Intelligence', 'Climate Change',
  'Productivity', 'Biographies', 'Space Exploration',
  'Financial Freedom', 'Leadership',
];

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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-gold' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Categories() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [featured, setFeatured] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);
  const [borrowedId, setBorrowedId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([listCategories(), listBooks()]).then(([cats, bks]) => {
      setCategories(cats);
      setBooks(bks);
      setFeatured(bks[0] ?? null);
    }).finally(() => setLoading(false));
  }, []);

  async function handleBorrow(bookId: number) {
    if (!user) { navigate('/login'); return; }
    setBorrowingId(bookId);
    try { await borrow(bookId); setBorrowedId(bookId); } catch { /* ignore */ } finally { setBorrowingId(null); }
  }

  const catData = categories.map((cat, idx) => ({
    name: cat,
    count: HARDCODED_COUNTS[cat] ?? books.filter(b => b.category === cat).length,
    color: CAT_COLORS[idx % CAT_COLORS.length],
  }));

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="font-serif text-[32px] font-bold text-ink">Browse Categories</h1>
          <p className="mt-1" style={{ fontSize: '15px', color: '#6B7280' }}>Explore books by genre and topic. Find your next great read.</p>
        </div>

        {/* Category grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {catData.map(({ name, count, color }) => (
              <button key={name}
                onClick={() => navigate(`/books?category=${encodeURIComponent(name)}`)}
                className="text-left p-6 rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4"
                style={{ backgroundColor: color.bg, borderColor: color.border }}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ backgroundColor: color.bg }}>
                  {CAT_EMOJI[name] ?? '📖'}
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: color.text }}>{name}</p>
                  <p className="text-sm mt-0.5" style={{ color: color.text, opacity: 0.7 }}>{count.toLocaleString()} books</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Featured Collections */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[22px] font-bold text-ink">Featured Collections</h2>
            <button className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">View all →</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {FEATURED.map(({ emoji, title, sub }) => (
              <div key={title}
                className="flex-shrink-0 w-48 h-[120px] p-5 rounded-xl border border-border shadow-soft hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-between"
                style={{ backgroundColor: FEATURED_BG[title] ?? '#FFFFFF' }}>
                <div className="text-3xl">{emoji}</div>
                <div>
                  <p className="font-bold text-sm text-ink">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Categories + Trending side by side */}
        <div className="flex gap-6 mb-8">
          {/* Top Categories This Month */}
          <section className="flex-1">
            <h2 className="font-serif text-[20px] font-bold text-ink mb-4">Top Categories This Month</h2>
            <div className="bg-white rounded-card border border-border shadow-soft p-5 space-y-4">
              {TOP_CATEGORIES.map(({ name, reads }, idx) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-muted w-4">{idx + 1}</span>
                  <span className="text-sm font-semibold text-ink flex-1">{name}</span>
                  <div className="w-32 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                    <div className="bg-forest-dark rounded-full h-1.5" style={{ width: `${100 - idx * 15}%` }} />
                  </div>
                  <span className="text-xs text-muted w-20 text-right">{reads} books read</span>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Topics */}
          <section className="flex-1">
            <h2 className="font-serif text-[20px] font-bold text-ink mb-4">Trending Topics</h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(topic => (
                <button key={topic}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-border text-ink hover:border-forest-dark hover:text-forest-dark hover:bg-forest-dark/5 transition-colors">
                  {topic}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-[280px] flex-shrink-0 space-y-4">
        {/* Featured Book */}
        {featured && (
          <div className="bg-white rounded-card border border-border shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-forest-dark uppercase tracking-wider">Featured Book</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <div className="mb-3 flex justify-center cursor-pointer"
              onClick={() => navigate(`/books/${featured.id}`)}>
              <VintageBookCover
                title={featured.title}
                subtitle={featured.author}
                size="md"
              />
            </div>
            <h3 className="font-serif text-sm font-bold text-ink line-clamp-2">{featured.title}</h3>
            <p className="text-[11px] text-muted italic mt-0.5">by {featured.author}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Stars rating={featured.rating} />
              <span className="text-[11px] text-muted">{featured.rating.toFixed(1)}</span>
            </div>
            <button
              onClick={() => void handleBorrow(featured.id)}
              disabled={borrowingId === featured.id || borrowedId === featured.id || !featured.available}
              className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                borrowedId === featured.id ? 'bg-green-100 text-green-700' :
                !featured.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                'bg-forest-dark text-white hover:bg-forest'
              }`}>
              {borrowedId === featured.id ? '✓ Borrowed' : borrowingId === featured.id ? 'Adding…' : 'Read Now 📖'}
            </button>
          </div>
        )}

        {/* Reading stats */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-4">Your Reading Stats</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <GoalRing pct={0.72} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-forest-dark">72%</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-ink">12 <span className="text-sm font-normal text-muted">Books Read</span></p>
              <p className="text-xs text-muted">4h 35m Total</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
            <span>🔥</span><span className="text-xs font-semibold text-amber-700">5 Days in a row!</span>
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
      </aside>
    </div>
  );
}
