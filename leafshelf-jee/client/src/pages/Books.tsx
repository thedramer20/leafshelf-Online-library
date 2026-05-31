import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addDownload, addLocalBorrow, apiErrorMessage, borrow, isFavorite, isDownloaded, listBooks, listCategories, readCached, toggleFavorite, writeCached } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

const PER_PAGE = 12;

const BOOKS_ANIMS = `
@keyframes bkHeroGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes bkCardIn{from{opacity:0;transform:translateY(22px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes bkFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes bkPillIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes bkFilterIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
@keyframes bkDotPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.55)}60%{box-shadow:0 0 0 7px rgba(34,197,94,0)}}
@keyframes bkStatIn{from{opacity:0;transform:translateY(10px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes bkLeafFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(8deg)}}
@keyframes bkBtnShimmer{0%{background-position:-300% center}100%{background-position:300% center}}
@keyframes bkOverlayIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes bkShimmerLoad{0%{background-position:-400px 0}100%{background-position:400px 0}}
`;

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={11} height={11} fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function BookCard({ book, onBorrow, index = 0 }: { book: Book; onBorrow: (book: Book) => Promise<boolean>; index?: number }) {
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);
  const [fav, setFav] = useState(() => isFavorite(book.id));
  const [downloaded, setDownloaded] = useState(() => isDownloaded(book.id));
  const [hovered, setHovered] = useState(false);

  async function handleBorrow(e: React.MouseEvent) {
    e.stopPropagation();
    if (borrowed || !book.available || borrowing) return;
    setBorrowing(true);
    const ok = await onBorrow(book);
    if (ok) setBorrowed(true);
    setBorrowing(false);
  }
  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    setFav(toggleFavorite(book.id));
    navigate('/favorites');
  }
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    addDownload({ id: book.id, title: book.title, author: book.author, cover_url: book.cover_url });
    setDownloaded(true);
    navigate('/downloads');
  }

  const canBorrow = book.available && !borrowed && !borrowing;

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        animation: `bkCardIn 0.45s ease both`,
        animationDelay: `${index * 0.055}s`,
        borderRadius: 18, overflow: 'hidden', background: '#fff',
        boxShadow: hovered ? '0 18px 44px rgba(27,67,50,0.18), 0 4px 16px rgba(0,0,0,0.07)' : '0 2px 12px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-7px) scale(1.025)' : 'translateY(0) scale(1)',
        transition: 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        border: hovered ? '1.5px solid #A7F3D0' : '1.5px solid #F1F5F9',
      }}
    >
      <div style={{ position: 'relative', paddingBottom: '148%', overflow: 'hidden' }}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} loading="lazy" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.45s ease',
          }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg,#1B4332,#2D6A4F)',
            display: 'flex', alignItems: 'flex-end', padding: 12,
          }}>
            <span style={{ color: '#D8F3DC', fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{book.title}</span>
          </div>
        )}

        {/* Availability dot */}
        <div style={{
          position: 'absolute', top: 9, right: 9,
          width: 11, height: 11, borderRadius: '50%',
          background: book.available ? '#22c55e' : '#ef4444',
          border: '2.5px solid #fff',
          animation: book.available ? 'bkDotPulse 2s ease-in-out infinite' : 'none',
        }} />

        {/* Category badge */}
        <div style={{
          position: 'absolute', bottom: 9, left: 9,
          background: 'rgba(27,67,50,0.82)', color: '#D8F3DC',
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
          backdropFilter: 'blur(4px)', letterSpacing: '0.05em', textTransform: 'uppercase',
          opacity: hovered ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: 'none',
        }}>{book.category}</div>

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top,rgba(7,26,15,0.95) 0%,rgba(7,26,15,0.55) 55%,transparent 100%)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.28s ease,transform 0.28s ease',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '10px 10px 12px',
        }}>
          <span style={{
            display: 'inline-block', marginBottom: 8,
            background: 'rgba(255,255,255,0.14)', color: '#D8F3DC',
            fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 5,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>{book.category}</span>

          <button onClick={handleBorrow} disabled={!canBorrow} style={{
            width: '100%', padding: '9px', borderRadius: 10, border: 'none', marginBottom: 7,
            background: borrowed ? 'rgba(74,222,128,0.22)' : !book.available ? 'rgba(255,255,255,0.09)'
              : 'linear-gradient(90deg,#1B4332 0%,#2D7A55 45%,#3A9E6E 50%,#2D7A55 55%,#1B4332 100%)',
            backgroundSize: canBorrow ? '300% 100%' : 'auto',
            animation: canBorrow ? 'bkBtnShimmer 2.5s linear infinite' : 'none',
            color: borrowed ? '#4ade80' : !book.available ? 'rgba(255,255,255,0.38)' : '#fff',
            fontSize: 12, fontWeight: 700,
            cursor: canBorrow ? 'pointer' : 'default',
            boxShadow: canBorrow ? '0 2px 14px rgba(27,67,50,0.45)' : 'none',
          }}>
            {borrowed ? '✓ Borrowed' : borrowing ? '…' : '📖 Borrow Now'}
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleFavorite} style={{
              flex: 1, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: fav ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.12)',
              color: fav ? '#f87171' : 'rgba(255,255,255,0.88)',
              fontSize: 13, fontWeight: 600, transition: 'background 0.2s',
            }}>{fav ? '❤️' : '♡'}</button>
            <button onClick={handleDownload} style={{
              flex: 1, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: downloaded ? 'rgba(74,222,128,0.22)' : 'rgba(255,255,255,0.12)',
              color: downloaded ? '#4ade80' : 'rgba(255,255,255,0.88)',
              fontSize: 13, fontWeight: 600, transition: 'background 0.2s',
            }}>{downloaded ? '✓' : '⬇'}</button>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div style={{ padding: '10px 12px 13px' }}>
        <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {book.author}
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1B4332', lineHeight: 1.35, overflow: 'hidden', maxHeight: 36, marginBottom: 7 }}>
          {book.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Stars rating={book.rating} />
          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{book.rating.toFixed(1)}</span>
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
            background: book.available ? '#F0FDF4' : '#FFF1F2',
            color: book.available ? '#059669' : '#E11D48',
            border: `1px solid ${book.available ? '#BBF7D0' : '#FECDD3'}`,
          }}>{book.available ? 'Available' : 'Out'}</span>
        </div>
      </div>
    </div>
  );
}

export default function Books() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';
  const initialCategory = searchParams.get('category') ?? '';
  const initialCacheKey = `books:${initialSearch}:${initialCategory}`;

  const [books, setBooks] = useState<Book[]>(() => readCached<Book[]>(initialCacheKey) ?? []);
  const [categories, setCategories] = useState<string[]>(() => readCached<string[]>('books:categories') ?? []);
  const [loading, setLoading] = useState(() => !readCached<Book[]>(initialCacheKey));
  const [apiError, setApiError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const cacheKey = `books:${searchParams.get('search') ?? ''}:${searchParams.get('category') ?? ''}`;
    if (!readCached<Book[]>(cacheKey)) setLoading(true);
    const params: Record<string, string> = {};
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    if (s) { params.search = s; setSearchInput(s); }
    if (c) { params.category = c; setActiveCategory(c); }
    let alive = true;
    Promise.all([listBooks(params), listCategories()])
      .then(([b, cats]) => {
        if (!alive) return;
        setBooks(Array.isArray(b) ? b : []); setCategories(Array.isArray(cats) ? cats : []);
        writeCached(cacheKey, b);
        writeCached('books:categories', cats);
        setApiError(null);
      })
      .catch(e => { if (alive) setApiError(apiErrorMessage(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
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
    setSearchInput(''); setActiveCategory(''); setAvailableOnly(false);
    setMinRating(0); setSelectedGenre(''); setSelectedAuthor('');
    setPage(1); setSearchParams({});
  }

  async function handleBorrow(b: Book): Promise<boolean> {
    try {
      if (user) await borrow(b.id);
      addLocalBorrow({ id: b.id, title: b.title, author: b.author, cover_url: b.cover_url, category: b.category, pages: b.pages });
      return true;
    } catch {
      return false;
    }
  }

  const authorOptions = [...new Set(books.map(b => b.author))].sort();

  let filtered = [...books];
  if (availableOnly) filtered = filtered.filter(b => b.available);
  if (minRating > 0) filtered = filtered.filter(b => b.rating >= minRating);
  if (selectedGenre) filtered = filtered.filter(b => b.category === selectedGenre);
  if (selectedAuthor) filtered = filtered.filter(b => b.author === selectedAuthor);
  if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'title') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === 'author') filtered.sort((a, b) => a.author.localeCompare(b.author));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const availableCount = books.filter(b => b.available).length;
  const unavailableCount = books.length - availableCount;
  const avgRating = books.length ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1) : '0';

  const CATEGORY_ICONS: Record<string, string> = {
    Classic: '🏛', Dystopian: '🌆', Fantasy: '🧙', Fiction: '📖',
    Horror: '👁', Romance: '🌹', Mystery: '🔍', Biography: '👤',
  };

  return (
    <div style={{ minHeight: '100%', background: '#F6FAF8' }}>
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
      <style>{BOOKS_ANIMS}</style>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg,#071a0f 0%,#0e2318 15%,#1B4332 40%,#2D6A4F 65%,#1B4332 85%,#071a0f 100%)',
        backgroundSize: '200% 200%', animation: 'bkHeroGrad 10s ease infinite',
        padding: '36px 32px 88px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Floating leaves */}
        {['🍃','🌿','📚','☘️','🌱','📖'].map((l, i) => (
          <span key={i} style={{
            position: 'absolute', fontSize: 20 + i * 4, opacity: 0.07,
            top: ['8%','55%','25%','72%','15%','60%'][i],
            left: ['4%','8%','90%','85%','48%','72%'][i],
            animation: `bkLeafFloat ${4 + i * 0.7}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
            userSelect: 'none', pointerEvents: 'none',
          }}>{l}</span>
        ))}

        {/* Title */}
        <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'bkFadeUp 0.55s ease both' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14,
            background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 14px',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', animation: 'bkDotPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {loading ? 'Loading…' : `${books.length} Books in Collection`}
            </span>
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 900, color: 'white', margin: '0 0 8px', fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
            Browse Books
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 28px' }}>
            Explore our collection and find your next great read
          </p>

          {/* Hero search */}
          <form onSubmit={applySearch} style={{ display: 'flex', gap: 10, maxWidth: 640, animation: 'bkFadeUp 0.55s ease 0.1s both' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: searchFocused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              border: searchFocused ? '1.5px solid rgba(82,183,136,0.7)' : '1.5px solid rgba(255,255,255,0.2)',
              borderRadius: 12, padding: '0 14px', height: 48,
              transition: 'all 0.2s',
              boxShadow: searchFocused ? '0 0 0 3px rgba(82,183,136,0.18)' : 'none',
            }}>
              <svg width={16} height={16} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={searchInput} onChange={e => setSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                placeholder="Search books, authors, topics…"
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: 14, color: 'white', fontFamily: 'inherit',
                }}
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearchParams({}); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>
            <button type="submit" style={{
              padding: '0 22px', height: 48,
              background: 'linear-gradient(135deg,#52B788,#2D6A4F)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(27,67,50,0.4)', whiteSpace: 'nowrap',
            }}>Search</button>
          </form>

          {/* Stats chips */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', animation: 'bkFadeUp 0.55s ease 0.2s both' }}>
            {[
              { label: 'Total Books', value: loading ? '…' : String(books.length), icon: '📚' },
              { label: 'Available Now', value: loading ? '…' : String(availableCount), icon: '✅' },
              { label: 'Genres', value: loading ? '…' : String(categories.length), icon: '🏷' },
              { label: 'Avg Rating', value: loading ? '…' : `⭐ ${avgRating}`, icon: '' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
                padding: '10px 18px', animation: 'bkStatIn 0.5s ease both',
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>
                  {icon && icon + ' '}{value}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category pill bar ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E8F5E9',
        boxShadow: '0 2px 8px rgba(27,67,50,0.06)', position: 'sticky', top: 0, zIndex: 10,
        marginTop: -2,
      }}>
        <div style={{ maxWidth: 1100 + 64, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center' }}>
          {/* Filter toggle */}
          <button type="button" onClick={() => setShowFilters(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '12px 14px',
            background: showFilters ? '#D1FAE5' : 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: showFilters ? '#065F46' : '#6B7280',
            borderRadius: 8, transition: 'all 0.18s', flexShrink: 0,
          }}>
            <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filters
          </button>
          <div style={{ width: 1, height: 20, background: '#E8F5E9', flexShrink: 0 }} />

          {['', ...categories].map((cat, i) => (
            <button key={cat || '__all__'} onClick={() => selectCategory(cat)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: activeCategory === cat ? 700 : 500,
                color: activeCategory === cat ? '#1B4332' : '#6B7280',
                borderBottom: activeCategory === cat ? '2.5px solid #1B4332' : '2.5px solid transparent',
                transition: 'all 0.18s', whiteSpace: 'nowrap', flexShrink: 0,
                animation: `bkPillIn 0.35s ease both`, animationDelay: `${i * 0.04}s`,
              }}>
              {cat ? (CATEGORY_ICONS[cat] ?? '📂') : '📚'} {cat || 'All Books'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100 + 64, margin: '0 auto', padding: '24px 32px', display: 'flex', gap: 24 }}>

        {/* Filter sidebar */}
        {showFilters && (
          <aside style={{ width: 224, flexShrink: 0, animation: 'bkFilterIn 0.38s ease both' }}>
            <div style={{
              background: 'white', borderRadius: 16, border: '1px solid #E8F5E9',
              boxShadow: '0 1px 8px rgba(27,67,50,0.06)', padding: 20,
              position: 'sticky', top: 57,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1B4332', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔧 Filters</h3>
                <button onClick={clearAll} style={{ fontSize: 11, color: '#52B788', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Clear all</button>
              </div>

              {/* Genre */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Genre</p>
                <select value={selectedGenre} onChange={e => { setSelectedGenre(e.target.value); setPage(1); }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13, border: '1.5px solid #E8F5E9', background: 'white', color: '#1a2e1a', outline: 'none' }}>
                  <option value="">All Genres</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Author */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Author</p>
                <select value={selectedAuthor} onChange={e => { setSelectedAuthor(e.target.value); setPage(1); }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13, border: '1.5px solid #E8F5E9', background: 'white', color: '#1a2e1a', outline: 'none' }}>
                  <option value="">All Authors</option>
                  {authorOptions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Availability */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Availability</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Available Now', count: availableCount, checked: availableOnly, fn: () => setAvailableOnly(v => !v) },
                    { label: 'Checked Out', count: unavailableCount, checked: false, fn: () => {} },
                  ].map(({ label, count, checked, fn }) => (
                    <label key={label} onClick={fn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                          background: checked ? '#1B4332' : 'white',
                          border: checked ? '2px solid #1B4332' : '2px solid #CBD5E1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {checked && <svg width={10} height={10} fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Min Rating</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[4, 3, 2, 1].map(r => (
                    <label key={r} onClick={() => setMinRating(minRating === r ? 0 : r)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                          background: minRating === r ? '#1B4332' : 'white',
                          border: minRating === r ? '2px solid #1B4332' : '2px solid #CBD5E1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {minRating === r && <svg width={10} height={10} fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span style={{ fontSize: 13, color: '#374151' }}>{r}★ & up</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{books.filter(b => b.rating >= r).length}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Book grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              {loading ? 'Loading…' : (
                <>Showing <strong style={{ color: '#1B4332' }}>{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)}</strong> of <strong style={{ color: '#1B4332' }}>{filtered.length}</strong> books</>
              )}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Sort by:</span>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #E8F5E9', background: 'white', color: '#1a2e1a', outline: 'none' }}>
                <option value="newest">Newest Added</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Title A–Z</option>
                <option value="author">Author A–Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  borderRadius: 18, paddingBottom: '200%',
                  background: 'linear-gradient(90deg,#E8F5E9 25%,#D1FAE5 50%,#E8F5E9 75%)',
                  backgroundSize: '400px 100%',
                  animation: 'bkShimmerLoad 1.4s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1B4332', marginBottom: 8 }}>No books found</p>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Try adjusting your search or filters</p>
              <button onClick={clearAll} style={{
                padding: '11px 24px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>Clear filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
              {paged.map((book, i) => <BookCard key={book.id} book={book} onBorrow={handleBorrow} index={i} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, border: '1.5px solid #E8F5E9', background: 'white', cursor: page === 1 ? 'default' : 'pointer',
                fontSize: 14, opacity: page === 1 ? 0.4 : 1, transition: 'all 0.15s',
              }}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: p === page ? 'none' : '1.5px solid #E8F5E9',
                  background: p === page ? 'linear-gradient(135deg,#1B4332,#2D6A4F)' : 'white',
                  color: p === page ? 'white' : '#374151',
                  boxShadow: p === page ? '0 3px 10px rgba(27,67,50,0.25)' : 'none',
                  transition: 'all 0.15s',
                }}>{p}</button>
              ))}
              {totalPages > 7 && <span style={{ padding: '0 8px', color: '#9CA3AF' }}>…</span>}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, border: '1.5px solid #E8F5E9', background: 'white', cursor: page === totalPages ? 'default' : 'pointer',
                fontSize: 14, opacity: page === totalPages ? 0.4 : 1, transition: 'all 0.15s',
              }}>→</button>
            </div>
          )}

          {/* Curated banner */}
          <div style={{
            marginTop: 32, borderRadius: 18, overflow: 'hidden', padding: '24px 28px',
            background: 'linear-gradient(135deg,#071a0f,#1B4332 40%,#2D6A4F)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
            boxShadow: '0 8px 30px rgba(27,67,50,0.2)',
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A7F3D0', marginBottom: 6 }}>📖 Curated Collection</p>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 6px', fontFamily: 'Fraunces, serif' }}>Books for a Cozy Weekend</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Hand-picked reads perfect for winding down</p>
            </div>
            <button onClick={() => navigate('/categories')} style={{
              padding: '12px 24px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              color: 'white', border: '1.5px solid rgba(255,255,255,0.22)', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s', flexShrink: 0,
            }}>Explore Collection →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
