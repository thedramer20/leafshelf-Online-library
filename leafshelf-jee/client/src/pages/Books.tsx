import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { borrow, listBooks, listCategories } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

const PER_PAGE = 12;

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

function BookCard({ book, onBorrow }: { book: Book; onBorrow: (id: number) => Promise<void> }) {
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  async function handleBorrow(e: React.MouseEvent) {
    e.stopPropagation();
    setBorrowing(true);
    try { await onBorrow(book.id); setBorrowed(true); } catch { /* ignore */ } finally { setBorrowing(false); }
  }

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="bg-white overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col"
    >
      <div className="relative overflow-hidden flex-shrink-0 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.12)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] group-hover:-translate-y-1 transition-all duration-200" style={{ paddingBottom: '150%' }}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-forest-dark/20 to-forest-dark/40 flex items-end p-2">
            <span className="text-white text-xs font-medium leading-tight line-clamp-3">{book.title}</span>
          </div>
        )}
        <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow ${book.available ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <p className="text-[11px] text-muted truncate mt-2">{book.author}</p>
      <p className="text-xs font-semibold text-ink line-clamp-2 leading-tight flex-1">{book.title}</p>
      <div className="flex items-center gap-1 mt-1.5">
        <Stars rating={book.rating} />
        <span className="text-[10px] text-muted">{book.rating.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`w-2 h-2 rounded-full ${book.available ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
        <span className="text-[11px] text-[#6B7280]">{book.available ? 'Available' : 'Checked Out'}</span>
      </div>
      <button
        onClick={handleBorrow}
        disabled={borrowing || borrowed || !book.available}
        className={`mt-2 w-full h-8 border border-[#E5E7EB] rounded-md text-xs font-medium transition-all ${
          borrowed ? 'bg-green-100 text-green-700 border-green-200' :
          !book.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' :
          'text-[#1B4332] hover:bg-[#1B4332] hover:text-white'
        }`}
      >
        {borrowed ? '✓ Borrowed' : borrowing ? '…' : 'Borrow'}
      </button>
    </div>
  );
}

function FilterCheckbox({ label, count, checked, onChange }: {
  label: string; count?: number; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-forest-dark accent-forest-dark" />
        <span className="text-sm text-ink group-hover:text-forest-dark transition-colors">{label}</span>
      </div>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </label>
  );
}

export default function Books() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    if (s) { params.search = s; setSearchInput(s); }
    if (c) { params.category = c; setActiveCategory(c); }
    Promise.all([listBooks(params), listCategories()]).then(([b, cats]) => {
      setBooks(b); setCategories(cats);
    }).finally(() => setLoading(false));
  }, [searchParams]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set('search', searchInput.trim());
    if (activeCategory) p.set('category', activeCategory);
    setSearchParams(p);
  }

  function selectCategory(cat: string) {
    setActiveCategory(cat);
    setPage(1);
    const p = new URLSearchParams();
    if (searchInput.trim()) p.set('search', searchInput.trim());
    if (cat) p.set('category', cat);
    setSearchParams(p);
  }

  function clearAll() {
    setSearchInput('');
    setActiveCategory('');
    setAvailableOnly(false);
    setMinRating(0);
    setPage(1);
    setSearchParams({});
  }

  async function handleBorrow(bookId: number) {
    if (!user) { navigate('/login'); return; }
    await borrow(bookId);
  }

  let filtered = [...books];
  if (availableOnly) filtered = filtered.filter(b => b.available);
  if (minRating > 0) filtered = filtered.filter(b => b.rating >= minRating);
  if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === 'author') filtered.sort((a, b) => a.author.localeCompare(b.author));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const availableCount = books.filter(b => b.available).length;
  const unavailableCount = books.length - availableCount;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-serif text-[32px] font-bold text-ink">Browse Books</h1>
        <p className="mt-1" style={{ fontSize: '15px', color: '#6B7280' }}>Explore our collection and find your next great read.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={applySearch} className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white border border-border rounded-xl px-4 h-11 focus-within:border-forest-dark focus-within:ring-2 focus-within:ring-forest-dark/10 transition-all">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search books, authors, topics..." className="flex-1 text-sm outline-none bg-transparent text-ink placeholder:text-gray-400 min-w-0" />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(''); setSearchParams({}); }}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button type="button" onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 h-11 px-4 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-gray-50 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filters
        </button>
        <button type="submit" className="px-5 h-11 bg-forest-dark text-white text-sm font-semibold rounded-xl hover:bg-forest transition-colors">
          Search
        </button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {['', ...categories].map(cat => (
          <button key={cat || '__all__'}
            onClick={() => selectCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-forest-dark text-white'
                : 'bg-white border border-border text-muted hover:text-forest-dark hover:border-forest-dark/30'
            }`}
          >
            {cat || 'All Books'}
          </button>
        ))}
      </div>

      {/* Two-column layout: filters + grid */}
      <div className="flex gap-6">
        {/* Filters panel */}
        {showFilters && (
          <aside className="w-[250px] flex-shrink-0">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-ink">Filters</h3>
                <button onClick={clearAll} className="text-xs text-forest-dark hover:text-forest font-medium transition-colors">Clear all</button>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Genre</p>
                <select className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:border-forest-dark">
                  <option>All Genres</option>
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Science Fiction</option>
                  <option>Fantasy</option>
                  <option>Classic</option>
                  <option>Romance</option>
                  <option>Self-Help</option>
                </select>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Author</p>
                <select className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:border-forest-dark">
                  <option>All Authors</option>
                  <option>George Orwell</option>
                  <option>Jane Austen</option>
                  <option>F. Scott Fitzgerald</option>
                  <option>Harper Lee</option>
                  <option>J.R.R. Tolkien</option>
                </select>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Format</p>
                <div className="space-y-2">
                  <FilterCheckbox label="eBook" count={books.length} checked={false} onChange={() => {}} />
                  <FilterCheckbox label="Audiobook" count={0} checked={false} onChange={() => {}} />
                  <FilterCheckbox label="ePub" count={books.length} checked={false} onChange={() => {}} />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Availability</p>
                <div className="space-y-2">
                  <FilterCheckbox label="Available Now" count={availableCount} checked={availableOnly} onChange={setAvailableOnly} />
                  <FilterCheckbox label="Checked Out" count={unavailableCount} checked={false} onChange={() => {}} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Rating</p>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(r => (
                    <FilterCheckbox key={r} label={`${r}★ & up`}
                      count={books.filter(b => b.rating >= r).length}
                      checked={minRating === r}
                      onChange={v => setMinRating(v ? r : 0)} />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Book grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">
              Showing <span className="font-medium text-ink">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)}</span> of <span className="font-medium text-ink">{filtered.length}</span> books
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Sort by:</span>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="text-sm border border-border rounded-lg px-2 py-1 bg-white text-ink focus:outline-none focus:border-forest-dark">
                <option value="newest">Newest Added</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Title A–Z</option>
                <option value="author">Author A–Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-card bg-gray-100 animate-pulse" style={{ paddingBottom: '200%' }} />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-ink mb-1">No books found</p>
              <p className="text-sm text-muted mb-4">Try adjusting your search or filters</p>
              <button onClick={clearAll} className="px-4 py-2 bg-forest-dark text-white text-sm rounded-lg hover:bg-forest transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {paged.map(book => <BookCard key={book.id} book={book} onBorrow={handleBorrow} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md text-sm border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 transition-colors">←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                    p === page ? 'bg-[#1B4332] text-white' : 'border border-[#E5E7EB] hover:bg-gray-50'
                  }`}>{p}</button>
              ))}
              {totalPages > 5 && <span className="px-2 text-muted">…</span>}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md text-sm border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 transition-colors">→</button>
            </div>
          )}

          {/* Curated banner */}
          <div className="mt-8 rounded-2xl overflow-hidden flex items-center gap-6 p-6"
            style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1 text-[#2D6A4F]">Curated Collection</p>
              <h3 className="font-serif text-xl font-bold mb-1 text-[#1B4332]">Books for a Cozy Weekend</h3>
              <p className="text-sm text-[#4B7A5F]">Hand-picked reads perfect for winding down</p>
            </div>
            <button onClick={() => navigate('/categories')}
              className="ml-auto flex-shrink-0 px-5 py-2.5 bg-[#1B4332] text-white text-sm font-semibold rounded-xl hover:bg-forest transition-colors whitespace-nowrap">
              Explore Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
