import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLocalBorrow, apiErrorMessage, borrow, listBooks, listCategories, readCached, writeCached } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getReadingStats, getReadingStatsDisplay } from '../lib/readingStats';
import type { Book } from '../lib/types';
import HeroOpenBook from '../components/HeroOpenBook';

const ANIMS = `
  @keyframes gradientFlow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes shimmerSweep {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes heroReveal {
    from { opacity: 0; transform: translateY(14px) skewY(0.6deg); }
    to   { opacity: 1; transform: translateY(0) skewY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideLeft {
    from { opacity: 0; transform: translateX(-14px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes sectionIn {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ringDraw {
    from { stroke-dasharray: 0 1000; }
  }
  @keyframes pulseDot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
    60%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  }
  @keyframes statsCountIn {
    from { opacity: 0; transform: scale(0.65); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes dotExpand {
    from { width: 8px; }
    to   { width: 20px; }
  }
`;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-gold' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20"
          style={{ animation: 'fadeSlideUp 0.3s ease both', animationDelay: `${i * 0.05}s` }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function GoalRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1B4332" strokeWidth="8"
        strokeDasharray={`${pct * circ} ${circ - pct * circ}`} strokeLinecap="round"
        style={{ animation: 'ringDraw 1.4s ease-out both', animationDelay: '0.3s' }} />
    </svg>
  );
}

const CAT_BG: Record<string, string> = {
  Classic: 'bg-amber-50 text-amber-700', Fantasy: 'bg-purple-50 text-purple-700',
  Dystopian: 'bg-gray-100 text-gray-700', Fiction: 'bg-blue-50 text-blue-700',
  'Science Fiction': 'bg-cyan-50 text-cyan-700', Romance: 'bg-pink-50 text-pink-700',
  Science: 'bg-teal-50 text-teal-700', 'Self-Help': 'bg-orange-50 text-orange-700',
  'Historical Fiction': 'bg-yellow-50 text-yellow-700', Memoir: 'bg-rose-50 text-rose-700',
  'Non-Fiction': 'bg-lime-50 text-lime-700',
};
const CAT_EMOJI: Record<string, string> = {
  Classic: '📚', Fantasy: '✨', Dystopian: '⚠️', Fiction: '💡',
  'Science Fiction': '🚀', Romance: '💕', Science: '🔬',
  'Self-Help': '🌱', 'Historical Fiction': '🏛️', Memoir: '📝', 'Non-Fiction': '🧠',
};

function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  async function handleBorrow(e: React.MouseEvent) {
    e.stopPropagation();
    setBorrowing(true);
    try {
      if (user) await borrow(book.id);
      addLocalBorrow({ id: book.id, title: book.title, author: book.author, cover_url: book.cover_url, category: book.category, pages: book.pages });
      setBorrowed(true);
    } catch {
      // server rejected — button reverts to "Borrow"
    } finally {
      setBorrowing(false);
    }
  }

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="flex-shrink-0 w-36 cursor-pointer group"
      style={{ animation: 'fadeSlideUp 0.5s ease both', animationDelay: `${index * 0.09}s` }}
    >
      <div
        className="relative rounded-xl overflow-hidden shadow-soft group-hover:shadow-md group-hover:-translate-y-1.5 transition-all duration-300"
        style={{ aspectRatio: '2/3' }}
      >
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest-dark/20 to-forest-dark/40 flex items-end p-2">
            <span className="text-white text-xs font-medium leading-tight line-clamp-3">{book.title}</span>
          </div>
        )}
        <span
          className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow ${book.available ? 'bg-green-500' : 'bg-red-500'}`}
          style={book.available ? { animation: 'pulseDot 2.2s ease-in-out infinite' } : {}}
        />
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-xs font-semibold text-ink line-clamp-2 leading-tight">{book.title}</p>
        <p className="text-[11px] text-muted mt-0.5 truncate">{book.author}</p>
        <div className="flex items-center gap-1 mt-1"><Stars rating={book.rating} /><span className="text-[10px] text-muted">{book.rating.toFixed(1)}</span></div>
        <button
          onClick={handleBorrow}
          disabled={borrowing || borrowed || !book.available}
          className={`mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
            borrowed ? 'bg-green-100 text-green-700' :
            !book.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
            'border border-[#E5E7EB] text-[#1B4332] hover:bg-[#1B4332] hover:text-white hover:border-[#1B4332] hover:-translate-y-0.5'
          }`}
        >
          {borrowed ? '✓ Borrowed' : borrowing ? '…' : 'Borrow'}
        </button>
      </div>
    </div>
  );
}

function FeaturedBookCard({ book }: { book: Book }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  async function handleBorrow() {
    setBorrowing(true);
    try {
      if (user) await borrow(book.id);
      addLocalBorrow({ id: book.id, title: book.title, author: book.author, cover_url: book.cover_url, category: book.category, pages: book.pages });
      setBorrowed(true);
    } catch {
      // server rejected — button reverts
    } finally {
      setBorrowing(false);
    }
  }

  return (
    <div className="bg-white rounded-card border border-border shadow-soft p-4"
      style={{ animation: 'fadeSlideUp 0.6s ease both', animationDelay: '0.15s' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-forest-dark uppercase tracking-wider">Featured Book</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </div>
      <div className="rounded-lg overflow-hidden mb-3 group cursor-pointer"
        style={{ paddingBottom: '130%', position: 'relative' }}
        onClick={() => navigate(`/books/${book.id}`)}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="absolute inset-0 bg-gradient-to-br from-forest-dark to-forest-dark/60 flex items-center justify-center"><span className="text-4xl">📚</span></div>
        }
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_BG[book.category] ?? 'bg-gray-100 text-gray-600'}`}>{book.category}</span>
      <h3 className="font-serif text-sm font-bold text-ink mt-1.5 line-clamp-2 leading-snug">{book.title}</h3>
      <p className="text-[11px] text-muted italic mt-0.5">by {book.author}</p>
      <div className="flex items-center gap-1.5 mt-2"><Stars rating={book.rating} /><span className="text-[11px] text-muted">{book.rating.toFixed(1)}</span></div>
      <div className="mt-3 space-y-2 text-[11px] text-muted divide-y divide-gray-50">
        {book.pages && <div className="flex justify-between pt-1"><span>Pages</span><span className="text-ink font-medium">{book.pages}</span></div>}
        <div className="flex justify-between pt-1"><span>Genre</span><span className="text-ink font-medium">{book.category}</span></div>
        {book.published_year && <div className="flex justify-between pt-1"><span>Year</span><span className="text-ink font-medium">{book.published_year}</span></div>}
      </div>
      <button onClick={handleBorrow} disabled={borrowing || borrowed || !book.available}
        className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          borrowed ? 'bg-green-100 text-green-700' :
          !book.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
          'bg-forest-dark text-white hover:bg-forest hover:-translate-y-0.5 hover:shadow-md'
        }`}>
        {borrowed ? '✓ Added to Library' : borrowing ? 'Adding…' : 'Read Now 📖'}
      </button>
      <button onClick={() => navigate(`/books/${book.id}`)}
        className="mt-2 w-full py-2 rounded-lg text-sm font-medium text-forest-dark border border-[#E5E7EB] hover:bg-gray-50 hover:border-forest-dark/30 transition-all duration-200">
        + Add to My Library
      </button>
    </div>
  );
}

function ReadingStatsCard() {
  const navigate = useNavigate();
  const rs = getReadingStats();
  const { timeStr, pctStr } = getReadingStatsDisplay(rs);
  const totalBooks = rs.booksRead + rs.currentlyReading;
  return (
    <div className="bg-white rounded-card border border-border shadow-soft p-4"
      style={{ animation: 'fadeSlideUp 0.6s ease both', animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-ink">Your Reading Stats</h3>
        <button onClick={() => navigate('/library')} className="text-xs text-forest-dark hover:text-forest font-medium transition-colors">View all →</button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <GoalRing pct={rs.goalPct} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-forest-dark" style={{ animation: 'statsCountIn 0.5s ease both', animationDelay: '0.9s' }}>{pctStr}</span>
          </div>
        </div>
        <div style={{ animation: 'fadeSlideLeft 0.5s ease both', animationDelay: '0.5s' }}>
          <p className="text-lg font-bold text-ink">{totalBooks} <span className="text-sm font-normal text-muted">Books</span></p>
          <p className="text-xs text-muted">{timeStr || '0m'} Reading Time</p>
          {rs.favoriteGenre && <p className="text-xs text-forest-dark font-medium mt-0.5">Loves: {rs.favoriteGenre}</p>}
        </div>
      </div>
      {rs.streak > 0 ? (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-2 mb-3"
          style={{ animation: 'fadeSlideUp 0.4s ease both', animationDelay: '0.6s' }}>
          <span className="text-base">🔥</span>
          <span className="text-xs font-semibold text-amber-700">{rs.streak} day{rs.streak !== 1 ? 's' : ''} in a row!</span>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2 mb-3"
          style={{ animation: 'fadeSlideUp 0.4s ease both', animationDelay: '0.6s' }}>
          <span className="text-base">📚</span>
          <span className="text-xs font-semibold text-green-700">Borrow a book to start your streak!</span>
        </div>
      )}
      <div style={{ animation: 'fadeSlideUp 0.4s ease both', animationDelay: '0.7s' }}>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted">Goal: {rs.goalTarget} books</span>
          <span className="font-medium text-ink">{totalBooks}/{rs.goalTarget}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-forest-dark rounded-full h-1.5 transition-all duration-1000" style={{ width: `${Math.round(rs.goalPct * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>(() => readCached<Book[]>('home:books') ?? []);
  const [categories, setCategories] = useState<string[]>(() => readCached<string[]>('home:categories') ?? []);
  const [loading, setLoading] = useState(() => !readCached<Book[]>('home:books'));
  const [apiError, setApiError] = useState<string | null>(null);
  const [heroDot, setHeroDot] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([listBooks(), listCategories()])
      .then(([b, c]) => {
        if (!alive) return;
        const safeB = Array.isArray(b) ? b : [];
        const safeC = Array.isArray(c) ? c : [];
        setBooks(safeB); setCategories(safeC);
        writeCached('home:books', safeB); writeCached('home:categories', safeC);
      })
      .catch(e => { if (alive) setApiError(apiErrorMessage(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const rs = getReadingStats();
  const borrowedIds = new Set([...rs.recentCategories].length > 0
    ? (JSON.parse(localStorage.getItem('leafshelf:borrowed') ?? '[]') as {id:number}[]).map(b => b.id) : []);
  const genreRecs = rs.favoriteGenre
    ? books.filter(b => b.category === rs.favoriteGenre && !borrowedIds.has(b.id) && b.available) : [];
  const recommended = genreRecs.length >= 3
    ? [...genreRecs, ...books.filter(b => !borrowedIds.has(b.id) && b.category !== rs.favoriteGenre)].slice(0, 5)
    : books.filter(b => !borrowedIds.has(b.id)).slice(0, 5);
  const becauseYouRead = rs.favoriteGenre
    ? books.filter(b => b.category === rs.favoriteGenre && !borrowedIds.has(b.id)).slice(0, 5) : [];
  const featured = books[0] ?? null;
  const catBooks = categories.map(cat => ({ name: cat, count: books.filter(b => b.category === cat).length }));

  const catColors = [
    'bg-amber-50 border-amber-100 hover:border-amber-300 hover:bg-amber-100',
    'bg-purple-50 border-purple-100 hover:border-purple-300 hover:bg-purple-100',
    'bg-blue-50 border-blue-100 hover:border-blue-300 hover:bg-blue-100',
    'bg-pink-50 border-pink-100 hover:border-pink-300 hover:bg-pink-100',
    'bg-cyan-50 border-cyan-100 hover:border-cyan-300 hover:bg-cyan-100',
    'bg-orange-50 border-orange-100 hover:border-orange-300 hover:bg-orange-100',
    'bg-teal-50 border-teal-100 hover:border-teal-300 hover:bg-teal-100',
    'bg-lime-50 border-lime-100 hover:border-lime-300 hover:bg-lime-100',
    'bg-rose-50 border-rose-100 hover:border-rose-300 hover:bg-rose-100',
    'bg-yellow-50 border-yellow-100 hover:border-yellow-300 hover:bg-yellow-100',
    'bg-indigo-50 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100',
  ];

  return (
    <>
      <style>{ANIMS}</style>
      {apiError && (
        <div className="api-error-banner" role="alert" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '11px 20px',
          background: '#FEF2F2', borderBottom: '1px solid #FECACA',
          color: '#B91C1C', fontSize: 13, fontWeight: 500,
        }}>
          <span>⚠️ Couldn't load books — {apiError}. <button onClick={() => window.location.reload()} style={{ fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Retry</button></span>
          <button onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: 16, lineHeight: 1 }} aria-label="Dismiss">✕</button>
        </div>
      )}
      <div className="flex gap-6 p-6 min-h-full">

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Hero */}
          <div
            className="relative rounded-2xl overflow-hidden min-h-[220px] flex items-center"
            style={{
              background: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 25%, #E8F5E9 55%, #B2DFDB 80%, #C8E6C9 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradientFlow 10s ease infinite',
            }}
          >
            {/* Moving shimmer */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%)',
                backgroundSize: '200% 100%',
                animation: 'shimmerSweep 5s linear infinite',
              }} />
            <div className="p-8 flex-1 relative z-10">
              <span className="text-[10px] font-bold text-forest-dark uppercase tracking-[0.2em] bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm"
                style={{ animation: 'fadeSlideUp 0.5s ease both', animationDelay: '0.05s' }}>
                {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Discover'}
              </span>
              <h1 className="font-serif text-[42px] font-bold text-forest-dark mt-3 mb-2 leading-[1.15]"
                style={{ animation: 'heroReveal 0.7s ease both', animationDelay: '0.2s' }}>
                Discover your next<br />great read
              </h1>
              <p className="text-sm text-forest/80 mb-5 max-w-xs"
                style={{ animation: 'fadeSlideUp 0.5s ease both', animationDelay: '0.4s' }}>
                Explore thousands of books across genres.<br />Find stories that inspire, inform, and entertain.
              </p>
              <div className="flex gap-3" style={{ animation: 'fadeSlideUp 0.5s ease both', animationDelay: '0.55s' }}>
                <button onClick={() => navigate('/books')}
                  className="px-5 py-2.5 bg-forest-dark text-white text-sm font-semibold rounded-xl hover:bg-forest transition-all duration-200 shadow-soft hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                  Explore Books
                </button>
                <button onClick={() => navigate('/categories')}
                  className="px-5 py-2.5 bg-white/70 text-forest-dark text-sm font-semibold rounded-xl hover:bg-white transition-all duration-200 border border-forest-dark/20 hover:border-forest-dark/40 hover:-translate-y-0.5 active:translate-y-0">
                  Browse Categories
                </button>
              </div>
              <div className="flex gap-1.5 mt-5">
                {[0, 1, 2].map(i => (
                  <button key={i} onClick={() => setHeroDot(i)}
                    className="rounded-full bg-forest-dark/30 h-2 transition-all duration-300"
                    style={{ width: i === heroDot ? 20 : 8, background: i === heroDot ? '#1B4332' : undefined }} />
                ))}
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center h-full absolute right-0 top-0 bottom-0 pr-10 z-10">
              <HeroOpenBook userName={user?.name.split(' ')[0] ?? 'LeafShelf'} size="md" />
            </div>
          </div>

          {/* Recommended */}
          <section style={{ animation: 'sectionIn 0.6s ease both', animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[22px] font-bold text-ink">Recommended for You</h2>
              <button onClick={() => navigate('/books')} className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">View all →</button>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[1,2,3,4,5].map(i => <div key={i} className="flex-shrink-0 w-36 h-56 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {recommended.map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
              </div>
            )}
          </section>

          {/* Because You Read */}
          {becauseYouRead.length >= 3 && (
            <section style={{ animation: 'sectionIn 0.6s ease both', animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-[22px] font-bold text-ink">Because You Love {rs.favoriteGenre}</h2>
                  <p className="text-xs text-muted mt-0.5">More books in your favorite genre</p>
                </div>
                <button onClick={() => navigate(`/books?category=${encodeURIComponent(rs.favoriteGenre!)}`)}
                  className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">View all →</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {becauseYouRead.map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
              </div>
            </section>
          )}

          {/* Categories */}
          <section style={{ animation: 'sectionIn 0.6s ease both', animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[22px] font-bold text-ink">Popular Categories</h2>
              <button onClick={() => navigate('/categories')} className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">View all →</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {catBooks.map(({ name, count }, idx) => (
                <button key={name} onClick={() => navigate(`/books?category=${encodeURIComponent(name)}`)}
                  className={`flex-shrink-0 flex flex-col items-center p-4 rounded-xl border ${catColors[idx % catColors.length]} transition-all duration-250 min-w-[140px] group hover:-translate-y-1 hover:shadow-md`}
                  style={{ animation: 'fadeSlideUp 0.45s ease both', animationDelay: `${0.04 * idx}s` }}>
                  <span className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-200" style={{ display: 'inline-block' }}>
                    {CAT_EMOJI[name] ?? '📖'}
                  </span>
                  <span className="text-xs font-semibold text-ink text-center leading-tight">{name}</span>
                  <span className="text-[10px] text-muted mt-0.5">{count} books</span>
                </button>
              ))}
            </div>
          </section>

          {/* New Arrivals */}
          {books.length > 5 && (
            <section style={{ animation: 'sectionIn 0.6s ease both', animationDelay: '0.35s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-[22px] font-bold text-ink">New Arrivals</h2>
                <button onClick={() => navigate('/books')} className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">View all →</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {books.slice(5, 10).map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
              </div>
            </section>
          )}
        </div>

        {/* Right panel */}
        <aside className="w-[280px] flex-shrink-0 space-y-4">
          {featured && <FeaturedBookCard book={featured} />}
          <ReadingStatsCard />
        </aside>
      </div>
    </>
  );
}
