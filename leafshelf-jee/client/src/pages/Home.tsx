import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { borrow, listBooks, listCategories } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

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

function GoalRing({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1B4332" strokeWidth="8"
        strokeDasharray={`${pct * circ} ${circ - pct * circ}`} strokeLinecap="round" />
    </svg>
  );
}

const CAT_BG: Record<string, string> = {
  Classic: 'bg-amber-50 text-amber-700',
  Fantasy: 'bg-purple-50 text-purple-700',
  Dystopian: 'bg-gray-100 text-gray-700',
  Fiction: 'bg-blue-50 text-blue-700',
  'Science Fiction': 'bg-cyan-50 text-cyan-700',
  Romance: 'bg-pink-50 text-pink-700',
  Science: 'bg-teal-50 text-teal-700',
  'Self-Help': 'bg-orange-50 text-orange-700',
  'Historical Fiction': 'bg-yellow-50 text-yellow-700',
  Memoir: 'bg-rose-50 text-rose-700',
  'Non-Fiction': 'bg-lime-50 text-lime-700',
};
const CAT_EMOJI: Record<string, string> = {
  Classic: '📚', Fantasy: '✨', Dystopian: '⚠️', Fiction: '💡',
  'Science Fiction': '🚀', Romance: '💕', Science: '🔬',
  'Self-Help': '🌱', 'Historical Fiction': '🏛️', Memoir: '📝', 'Non-Fiction': '🧠',
};

function BookCard({ book }: { book: Book }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  async function handleBorrow(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setBorrowing(true);
    try { await borrow(book.id); setBorrowed(true); } catch { /* ignore */ } finally { setBorrowing(false); }
  }

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="flex-shrink-0 w-36 cursor-pointer group"
    >
      <div className="relative rounded-xl overflow-hidden shadow-soft group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-200"
        style={{ aspectRatio: '2/3' }}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest-dark/20 to-forest-dark/40 flex items-end p-2">
            <span className="text-white text-xs font-medium leading-tight line-clamp-3">{book.title}</span>
          </div>
        )}
        <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow ${book.available ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-xs font-semibold text-ink line-clamp-2 leading-tight">{book.title}</p>
        <p className="text-[11px] text-muted mt-0.5 truncate">{book.author}</p>
        <div className="flex items-center gap-1 mt-1">
          <Stars rating={book.rating} />
          <span className="text-[10px] text-muted">{book.rating.toFixed(1)}</span>
        </div>
        <button
          onClick={handleBorrow}
          disabled={borrowing || borrowed || !book.available}
          className={`mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
            borrowed ? 'bg-green-100 text-green-700' :
            !book.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
            'border border-[#E5E7EB] rounded-md text-[#1B4332] hover:bg-[#F0FDF4]'
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
    if (!user) { navigate('/login'); return; }
    setBorrowing(true);
    try { await borrow(book.id); setBorrowed(true); } catch { /* ignore */ } finally { setBorrowing(false); }
  }

  return (
    <div className="bg-white rounded-card border border-border shadow-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-forest-dark uppercase tracking-wider">Featured Book</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </div>
      <div className="rounded-lg overflow-hidden mb-3" style={{ paddingBottom: '130%', position: 'relative' }}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            onClick={() => navigate(`/books/${book.id}`)} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-forest-dark to-forest-dark/60 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        )}
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_BG[book.category] ?? 'bg-gray-100 text-gray-600'}`}>
        {book.category}
      </span>
      <h3 className="font-serif text-sm font-bold text-ink mt-1.5 line-clamp-2 leading-snug">{book.title}</h3>
      <p className="text-[11px] text-muted italic mt-0.5">by {book.author}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <Stars rating={book.rating} />
        <span className="text-[11px] text-muted">{book.rating.toFixed(1)}</span>
      </div>
      <div className="mt-3 space-y-2 text-[11px] text-muted divide-y divide-gray-50">
        {book.pages && <div className="flex justify-between pt-1"><span>Pages</span><span className="text-ink font-medium">{book.pages}</span></div>}
        <div className="flex justify-between pt-1"><span>Genre</span><span className="text-ink font-medium">{book.category}</span></div>
        {book.published_year && <div className="flex justify-between pt-1"><span>Year</span><span className="text-ink font-medium">{book.published_year}</span></div>}
      </div>
      <button
        onClick={handleBorrow}
        disabled={borrowing || borrowed || !book.available}
        className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
          borrowed ? 'bg-green-100 text-green-700' :
          !book.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
          'bg-forest-dark text-white hover:bg-forest'
        }`}
      >
        {borrowed ? '✓ Added to Library' : borrowing ? 'Adding…' : 'Read Now 📖'}
      </button>
      <button
        onClick={() => navigate(`/books/${book.id}`)}
        className="mt-2 w-full py-2 rounded-lg text-sm font-medium text-forest-dark border border-[#E5E7EB] hover:bg-gray-50 transition-colors">
        + Add to My Library
      </button>
    </div>
  );
}

function ReadingStatsCard() {
  const navigate = useNavigate();
  const pct = 0.72;
  return (
    <div className="bg-white rounded-card border border-border shadow-soft p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-ink">Your Reading Stats</h3>
        <button onClick={() => navigate('/profile')} className="text-xs text-forest-dark hover:text-forest font-medium transition-colors">
          View all →
        </button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <GoalRing pct={pct} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-forest-dark">{Math.round(pct * 100)}%</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-ink">12 <span className="text-sm font-normal text-muted">Books Read</span></p>
          <p className="text-xs text-muted">4h 35m Total Reading Time</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
        <span className="text-base">🔥</span>
        <span className="text-xs font-semibold text-amber-700">5 Days in a row!</span>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted">Goal: 16 books this month</span>
          <span className="font-medium text-ink">12/16</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-forest-dark rounded-full h-1.5" style={{ width: '75%' }} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroDot, setHeroDot] = useState(0);

  useEffect(() => {
    Promise.all([listBooks(), listCategories()]).then(([b, c]) => {
      setBooks(b);
      setCategories(c);
    }).finally(() => setLoading(false));
  }, []);

  const recommended = books.slice(0, 5);
  const featured = books[0] ?? null;
  const catBooks = categories.map(cat => ({
    name: cat,
    count: books.filter(b => b.category === cat).length,
  }));

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden min-h-[220px] flex items-center"
          style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 60%, #A5D6A7 100%)' }}>
          <div className="p-8 flex-1">
            <span className="text-[10px] font-bold text-forest-dark uppercase tracking-[0.2em] bg-white/60 px-3 py-1 rounded-full">
              {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Discover'}
            </span>
            <h1 className="font-serif text-[42px] font-bold text-forest-dark mt-3 mb-2 leading-[1.15]">
              Discover your next<br />great read
            </h1>
            <p className="text-sm text-forest/80 mb-5 max-w-xs">
              Explore thousands of books across genres.<br />
              Find stories that inspire, inform, and entertain.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/books')}
                className="px-5 py-2.5 bg-forest-dark text-white text-sm font-semibold rounded-xl hover:bg-forest transition-colors shadow-soft">
                Explore Books
              </button>
              <button onClick={() => navigate('/categories')}
                className="px-5 py-2.5 bg-white/70 text-forest-dark text-sm font-semibold rounded-xl hover:bg-white transition-colors border border-forest-dark/20">
                Browse Categories
              </button>
            </div>
            <div className="flex gap-1.5 mt-5">
              {[0, 1, 2].map(i => (
                <button key={i} onClick={() => setHeroDot(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === heroDot ? 'bg-forest-dark' : 'bg-forest-dark/30'}`} />
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center w-64 h-full absolute right-0 top-0 bottom-0 pr-6">
            <div className="relative">
              <div className="w-28 h-40 bg-forest-dark/20 rounded-xl rotate-[-8deg] absolute -left-4 top-2" />
              <div className="w-28 h-40 bg-gold/40 rounded-xl rotate-[4deg] absolute left-4 top-0" />
              <div className="w-28 h-40 bg-white/60 rounded-xl relative z-10 flex items-center justify-center shadow-soft">
                <span className="text-4xl">📚</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended for You */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[22px] font-bold text-ink">Recommended for You</h2>
            <button onClick={() => navigate('/books')} className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">
              View all →
            </button>
          </div>
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1,2,3,4,5].map(i => <div key={i} className="flex-shrink-0 w-36 h-56 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {recommended.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </section>

        {/* Popular Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[22px] font-bold text-ink">Popular Categories</h2>
            <button onClick={() => navigate('/categories')} className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {catBooks.map(({ name, count }, idx) => {
              const colors = ['bg-amber-50 border-amber-100', 'bg-purple-50 border-purple-100', 'bg-blue-50 border-blue-100', 'bg-pink-50 border-pink-100', 'bg-cyan-50 border-cyan-100', 'bg-orange-50 border-orange-100', 'bg-teal-50 border-teal-100', 'bg-lime-50 border-lime-100', 'bg-rose-50 border-rose-100', 'bg-yellow-50 border-yellow-100', 'bg-indigo-50 border-indigo-100'];
              return (
                <button key={name} onClick={() => navigate(`/books?category=${encodeURIComponent(name)}`)}
                  className={`flex-shrink-0 flex flex-col items-center p-4 rounded-xl border ${colors[idx % colors.length]} hover:shadow-soft hover:scale-[1.03] transition-all min-w-[140px]`}>
                  <span className="text-3xl mb-1">{CAT_EMOJI[name] ?? '📖'}</span>
                  <span className="text-xs font-semibold text-ink text-center leading-tight">{name}</span>
                  <span className="text-[10px] text-muted mt-0.5">{count} books</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* New arrivals strip */}
        {books.length > 5 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[22px] font-bold text-ink">New Arrivals</h2>
              <button onClick={() => navigate('/books')} className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">View all →</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {books.slice(5, 10).map(book => <BookCard key={book.id} book={book} />)}
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
  );
}
