import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { borrow, listBooks } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

type FavTab = 'all' | 'books' | 'audiobooks' | 'collections' | 'recent';
const FAV_TABS: { id: FavTab; label: string; count: number }[] = [
  { id: 'all', label: 'All Favorites', count: 48 },
  { id: 'books', label: 'Books', count: 36 },
  { id: 'audiobooks', label: 'Audiobooks', count: 8 },
  { id: 'collections', label: 'Collections', count: 4 },
  { id: 'recent', label: 'Recently Added', count: 8 },
];

const STAT_CARDS = [
  { icon: '♡', label: 'Total Favorites', value: '48' },
  { icon: '📚', label: 'Want to Read', value: '27' },
  { icon: '✨', label: 'Recommended', value: '12' },
  { icon: '🕐', label: 'Recently Added', value: '8' },
];

const GENRES = [
  { name: 'Fiction', pct: 35, count: 17 },
  { name: 'Science Fiction', pct: 22, count: 11 },
  { name: 'Fantasy', pct: 18, count: 9 },
  { name: 'Classic', pct: 14, count: 7 },
  { name: 'Self-Help', pct: 11, count: 4 },
];

const MOODS = [
  { label: 'Cozy', emoji: '☕' },
  { label: 'Adventurous', emoji: '🏔️' },
  { label: 'Thought-Provoking', emoji: '💭' },
  { label: 'Light & Fun', emoji: '😄' },
  { label: 'Emotional', emoji: '❤️' },
];

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

function BookCard({ book, onBorrow, onRemove }: { book: Book; onBorrow: (id: number) => void; onRemove: (id: number) => void }) {
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);
  const [removed, setRemoved] = useState(false);

  async function handleBorrow(e: React.MouseEvent) {
    e.stopPropagation();
    setBorrowing(true);
    try { onBorrow(book.id); setBorrowed(true); } catch { /* ignore */ } finally { setBorrowing(false); }
  }

  if (removed) return null;

  return (
    <div className="bg-white rounded-card border border-border overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 group flex flex-col cursor-pointer"
      onClick={() => navigate(`/books/${book.id}`)}>
      <div className="relative overflow-hidden flex-shrink-0" style={{ paddingBottom: '150%' }}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          : <div className="absolute inset-0 bg-gradient-to-br from-forest-dark/20 to-forest-dark/40 flex items-end p-2"><span className="text-white text-xs leading-tight line-clamp-2">{book.title}</span></div>
        }
        <button onClick={e => { e.stopPropagation(); setRemoved(true); onRemove(book.id); }}
          className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ×
        </button>
        <div className="absolute top-2 right-2 text-red-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <span className={`absolute bottom-2 left-2 w-2 h-2 rounded-full border border-white ${book.available ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-muted truncate mb-0.5">{book.author}</p>
        <p className="text-xs font-semibold text-ink line-clamp-2 leading-tight flex-1">{book.title}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Stars rating={book.rating} />
          <span className="text-[10px] text-muted">{book.rating.toFixed(1)}</span>
        </div>
        <div className="flex gap-1 mt-2">
          <button onClick={handleBorrow} disabled={borrowing || borrowed || !book.available}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              borrowed ? 'bg-green-100 text-green-700' :
              !book.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              'bg-forest-dark text-white hover:bg-forest'
            }`}>
            {borrowed ? '✓' : borrowing ? '…' : 'Borrow'}
          </button>
          <button onClick={e => { e.stopPropagation(); setRemoved(true); onRemove(book.id); }}
            className="px-2 py-1.5 rounded-lg text-[11px] font-semibold border border-border text-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
            ♡
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [recBooks, setRecBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FavTab>('all');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    listBooks().then(b => {
      setBooks(b);
      setRecBooks(b.filter(bk => bk.available).slice(8, 11));
    }).finally(() => setLoading(false));
  }, []);

  async function handleBorrow(bookId: number) {
    if (!user) { navigate('/login'); return; }
    await borrow(bookId);
  }

  function handleRemove(id: number) {
    setRemovedIds(prev => new Set(prev).add(id));
  }

  const displayed = books.filter(b => !removedIds.has(b.id));

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-ink">Favorites</h1>
          <p className="text-sm text-muted mt-1">Books you love and want to read</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map(({ icon, label, value }) => (
            <div key={label} className="bg-white rounded-card border border-border shadow-soft p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-2xl font-bold text-ink">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-5 overflow-x-auto scrollbar-hide">
          {FAV_TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === t.id ? 'text-forest-dark border-forest-dark' : 'text-muted border-transparent hover:text-ink'
              }`}>
              {t.label} <span className="ml-1 text-[11px] text-muted">({t.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="rounded-card bg-gray-100 animate-pulse" style={{ paddingBottom: '200%' }} />)}
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {displayed.map(book => (
              <BookCard key={book.id} book={book} onBorrow={handleBorrow} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>

      {/* Right panel */}
      <aside className="w-60 flex-shrink-0 space-y-4">
        {/* Favorite genres */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-4">Favorite Genres</h3>
          <div className="space-y-3">
            {GENRES.map(({ name, pct, count }) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink font-medium">{name}</span>
                  <span className="text-muted">{count} books</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-forest-dark rounded-full h-1.5" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reading mood */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-3">Reading Mood</h3>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(({ label, emoji }) => (
              <button key={label} onClick={() => setSelectedMood(selectedMood === label ? null : label)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedMood === label
                    ? 'bg-forest-dark text-white'
                    : 'bg-gray-50 text-muted border border-gray-200 hover:border-forest-dark hover:text-forest-dark'
                }`}>
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended */}
        {recBooks.length > 0 && (
          <div className="bg-white rounded-card border border-border shadow-soft p-4">
            <h3 className="font-semibold text-sm text-ink mb-3">Recommended For You</h3>
            <div className="space-y-3">
              {recBooks.map(book => (
                <div key={book.id} className="flex gap-2 items-center cursor-pointer group"
                  onClick={() => navigate(`/books/${book.id}`)}>
                  <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                    {book.cover_url && <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink line-clamp-1 group-hover:text-forest-dark transition-colors">{book.title}</p>
                    <p className="text-[10px] text-muted truncate">{book.author}</p>
                    <button onClick={e => { e.stopPropagation(); void handleBorrow(book.id); }}
                      disabled={!book.available}
                      className="mt-1 text-[10px] px-2 py-0.5 bg-forest-dark text-white rounded font-semibold hover:bg-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Borrow
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
