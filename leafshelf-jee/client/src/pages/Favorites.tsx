import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLocalBorrow, borrow, getFavoriteIds, listBooks, toggleFavorite } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

const FAV_ANIMS = `
@keyframes favHeroGrad {
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
@keyframes favHeartBeat {
  0%,100%{transform:scale(1)}
  14%{transform:scale(1.28)}
  28%{transform:scale(0.96)}
  42%{transform:scale(1.15)}
  70%{transform:scale(1)}
}
@keyframes favFloat {
  0%{transform:translateY(0) rotate(0deg) scale(1);opacity:0.7}
  100%{transform:translateY(-70px) rotate(25deg) scale(0.5);opacity:0}
}
@keyframes favScan {
  0%{transform:translateX(-100%);opacity:0}
  40%{opacity:1}
  60%{opacity:1}
  100%{transform:translateX(200%);opacity:0}
}
@keyframes favCardIn {
  0%{opacity:0;transform:translateY(22px) scale(0.94)}
  100%{opacity:1;transform:translateY(0) scale(1)}
}
@keyframes favStatIn {
  0%{opacity:0;transform:translateY(20px) scale(0.9)}
  60%{transform:translateY(-3px) scale(1.03)}
  100%{opacity:1;transform:translateY(0) scale(1)}
}
@keyframes favSideIn {
  0%{opacity:0;transform:translateX(22px)}
  100%{opacity:1;transform:translateX(0)}
}
@keyframes favHeaderIn {
  0%{opacity:0;transform:translateY(-14px)}
  100%{opacity:1;transform:translateY(0)}
}
@keyframes favBarFill {
  0%{width:0%}
}
@keyframes favShimmer {
  0%{transform:translateX(-100%)}
  100%{transform:translateX(200%)}
}
@keyframes favEmptyIn {
  0%{opacity:0;transform:scale(0.88)}
  60%{transform:scale(1.04)}
  100%{opacity:1;transform:scale(1)}
}
@keyframes favMoodPop {
  0%{opacity:0;transform:scale(0.8) translateX(-6px)}
  70%{transform:scale(1.03)}
  100%{opacity:1;transform:scale(1) translateX(0)}
}
@keyframes favHeroBadge {
  0%{opacity:0;transform:scale(0.8) translateY(6px)}
  70%{transform:scale(1.05)}
  100%{opacity:1;transform:scale(1) translateY(0)}
}
@keyframes favPulseRing {
  0%{box-shadow:0 0 0 0 rgba(27,67,50,0.4)}
  70%{box-shadow:0 0 0 12px rgba(27,67,50,0)}
  100%{box-shadow:0 0 0 0 rgba(27,67,50,0)}
}
`;

type FavTab = 'all' | 'books' | 'recent';

const GENRE_COLORS: Record<string, { color: string; bg: string; bar: string }> = {
  Classic:    { color: '#059669', bg: '#ecfdf5', bar: 'linear-gradient(90deg,#34d399,#059669)' },
  Fiction:    { color: '#2563eb', bg: '#eff6ff', bar: 'linear-gradient(90deg,#60a5fa,#2563eb)' },
  Fantasy:    { color: '#7c3aed', bg: '#f5f3ff', bar: 'linear-gradient(90deg,#a78bfa,#7c3aed)' },
  Dystopian:  { color: '#e11d48', bg: '#fff1f2', bar: 'linear-gradient(90deg,#fb7185,#e11d48)' },
  Romance:    { color: '#db2777', bg: '#fdf2f8', bar: 'linear-gradient(90deg,#f472b6,#db2777)' },
  Science:    { color: '#0891b2', bg: '#ecfeff', bar: 'linear-gradient(90deg,#22d3ee,#0891b2)' },
  Horror:     { color: '#c2410c', bg: '#fff7ed', bar: 'linear-gradient(90deg,#fb923c,#c2410c)' },
  Memoir:     { color: '#d97706', bg: '#fffbeb', bar: 'linear-gradient(90deg,#fbbf24,#d97706)' },
  Historical: { color: '#6d28d9', bg: '#f5f3ff', bar: 'linear-gradient(90deg,#c084fc,#6d28d9)' },
};
const DEFAULT_GENRE = { color: '#2563eb', bg: '#eff6ff', bar: 'linear-gradient(90deg,#60a5fa,#2563eb)' };

const MOODS = [
  { label: 'Cozy',             emoji: '☕', color: '#d97706', bg: '#fffbeb', border: '#fde68a', glow: 'rgba(217,119,6,0.2)' },
  { label: 'Adventurous',      emoji: '🏔️', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', glow: 'rgba(5,150,105,0.2)' },
  { label: 'Thought-Provoking',emoji: '💭', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', glow: 'rgba(124,58,237,0.2)' },
  { label: 'Light & Fun',      emoji: '😄', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', glow: 'rgba(234,88,12,0.2)' },
  { label: 'Emotional',        emoji: '❤️', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', glow: 'rgba(225,29,72,0.2)' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} style={{ width: 11, height: 11, color: i <= Math.round(rating) ? '#f59e0b' : '#e5e7eb' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FloatingLeafs() {
  const items = ['🌿', '☘️', '🍃', '🌱', '🌿', '🍃', '☘️', '🌱'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {items.map((h, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${5 + i * 12}%`,
          bottom: 0,
          fontSize: `${10 + (i % 4) * 5}px`,
          animation: `favFloat ${2.2 + i * 0.35}s ease-out ${i * 0.45}s infinite`,
          opacity: 0.35,
          userSelect: 'none',
          pointerEvents: 'none',
        }}>{h}</span>
      ))}
    </div>
  );
}

function BookCard({
  book, onBorrow, onRemove, index = 0,
}: {
  book: Book; onBorrow: (id: number) => void; onRemove: (id: number) => void; index?: number;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  async function handleBorrow(e: React.MouseEvent) {
    e.stopPropagation();
    setBorrowing(true);
    try { onBorrow(book.id); setBorrowed(true); } catch { /* ignore */ } finally { setBorrowing(false); }
  }

  function handleUnfavorite(e: React.MouseEvent) {
    e.stopPropagation();
    toggleFavorite(book.id);
    onRemove(book.id);
  }

  return (
    <div style={{ animation: 'favCardIn 0.42s ease both', animationDelay: `${index * 0.055}s` }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => navigate(`/books/${book.id}`)}
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: hovered
            ? '0 24px 48px rgba(27,67,50,0.16), 0 8px 24px rgba(0,0,0,0.10)'
            : '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
          transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          transition: 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'pointer',
          position: 'relative' as const,
          display: 'flex',
          flexDirection: 'column' as const,
          border: hovered ? '1.5px solid #A7F3D0' : '1.5px solid #f1f5f9',
        }}
      >
        {/* Shimmer on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
            background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.18) 50%,transparent 100%)',
            animation: 'favShimmer 1.2s ease infinite',
            pointerEvents: 'none',
          }} />
        )}

        {/* Cover area */}
        <div style={{ position: 'relative', paddingBottom: '148%', flexShrink: 0 }}>
          {book.cover_url
            ? (
              <img
                src={book.cover_url}
                alt={book.title}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                  transform: hovered ? 'scale(1.08)' : 'scale(1)',
                }}
                loading="lazy"
              />
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg,#1B4332,#2D6A4F)',
                display: 'flex', alignItems: 'flex-end', padding: 10,
              }}>
                <span style={{ color: '#D8F3DC', fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{book.title}</span>
              </div>
            )}

          {/* Dark overlay on hover */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,4,20,0.92) 0%, rgba(10,4,20,0.35) 55%, rgba(0,0,0,0.1) 100%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 10, gap: 7,
          }}>
            <button
              onClick={handleBorrow}
              disabled={borrowing || borrowed || !book.available}
              style={{
                width: '100%', padding: '8px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.2px',
                background: borrowed
                  ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                  : !book.available
                    ? 'rgba(255,255,255,0.18)'
                    : 'linear-gradient(135deg,#1B4332,#2D6A4F)',
                color: !book.available ? 'rgba(255,255,255,0.45)' : '#fff',
                transition: 'transform 0.15s',
                boxShadow: !borrowed && book.available ? '0 4px 12px rgba(27,67,50,0.45)' : 'none',
              }}
            >
              {borrowed ? '✓ Borrowed' : borrowing ? '…' : '📖 Borrow'}
            </button>
            <button
              onClick={handleUnfavorite}
              style={{
                width: '100%', padding: '7px 0', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.28)', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(4px)',
              }}
            >
              ♡ Remove
            </button>
          </div>

          {/* Available dot */}
          <span style={{
            position: 'absolute', top: 9, left: 9, width: 9, height: 9, borderRadius: '50%',
            background: book.available ? '#22c55e' : '#ef4444',
            border: '2px solid white',
            boxShadow: `0 1px 4px ${book.available ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
          }} />

          {/* Heart badge */}
          <div style={{
            position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
            animation: 'favHeartBeat 2.6s ease-in-out infinite',
          }}>❤️</div>

          {/* Category badge */}
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            padding: '3px 9px', borderRadius: 20,
            background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(6px)',
            fontSize: 10, color: '#fff', fontWeight: 700, letterSpacing: '0.2px',
          }}>{book.category}</div>
        </div>

        {/* Info panel */}
        <div style={{ padding: '10px 12px 13px' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.35, margin: '0 0 7px', overflow: 'hidden', maxHeight: 36 }}>{book.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Stars rating={book.rating} />
            <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{book.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [recBooks, setRecBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FavTab>('all');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<Set<number>>(() => new Set(getFavoriteIds()));

  useEffect(() => {
    listBooks().then(b => {
      setAllBooks(b);
      setRecBooks(b.filter(bk => bk.available).slice(8, 11));
    }).finally(() => setLoading(false));
  }, []);

  async function handleBorrow(bookId: number) {
    const b = allBooks.find(x => x.id === bookId);
    if (b) addLocalBorrow({ id: b.id, title: b.title, author: b.author, cover_url: b.cover_url, category: b.category, pages: b.pages });
    if (user) { try { await borrow(bookId); } catch { /* keep local borrow */ } }
  }

  function handleRemove(id: number) {
    setFavIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  }

  const favBooks = allBooks.filter(b => favIds.has(b.id));
  const displayed = activeTab === 'recent' ? favBooks.slice(0, 5) : favBooks;

  // Genre distribution from real data
  const genreCounts: Record<string, number> = {};
  favBooks.forEach(b => { genreCounts[b.category] = (genreCounts[b.category] || 0) + 1; });
  const totalFav = favBooks.length || 1;
  const genres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / totalFav) * 100) }));

  const tabs: { id: FavTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Favorites', count: favBooks.length },
    { id: 'books', label: 'Books', count: favBooks.length },
    { id: 'recent', label: 'Recently Added', count: Math.min(5, favBooks.length) },
  ];

  const statCards = [
    { icon: '🌿', label: 'Total Favorites',  value: favBooks.length,                              color: '#1B4332', bg: 'linear-gradient(135deg,#D1FAE5,#ECFDF5)', border: '#6EE7B7', glow: 'rgba(27,67,50,0.14)' },
    { icon: '📚', label: 'Available Now',     value: favBooks.filter(b => b.available).length,     color: '#065F46', bg: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border: '#A7F3D0', glow: 'rgba(5,150,105,0.14)' },
    { icon: '✨', label: 'Genres',            value: new Set(favBooks.map(b => b.category)).size,  color: '#2D6A4F', bg: 'linear-gradient(135deg,#F0FDF4,#D1FAE5)', border: '#6EE7B7', glow: 'rgba(45,106,79,0.14)' },
    { icon: '🕐', label: 'Recently Added',   value: Math.min(5, favBooks.length),                 color: '#1B4332', bg: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '#A7F3D0', glow: 'rgba(27,67,50,0.10)' },
  ];

  return (
    <>
      <style>{FAV_ANIMS}</style>
      <div style={{ background: '#F6FAF8', minHeight: '100%' }}>

        {/* ── Hero ── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg,#071a0f 0%,#0e2318 15%,#1B4332 38%,#2D6A4F 62%,#1B4332 82%,#071a0f 100%)',
          backgroundSize: '300% 300%',
          animation: 'favHeroGrad 10s ease infinite',
          padding: '32px 24px 28px',
          overflow: 'hidden',
          borderBottom: '1px solid #0e2318',
        }}>
          <FloatingLeafs />

          {/* Scan shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 120,
            background: 'linear-gradient(90deg,transparent,rgba(82,183,136,0.10),transparent)',
            animation: 'favScan 4s ease-in-out 1s infinite',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(82,183,136,0.12),transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, animation: 'favHeaderIn 0.5s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#1B4332,#2D6A4F)',
                border: '2px solid rgba(82,183,136,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
                animation: 'favHeartBeat 1.8s ease-in-out infinite, favPulseRing 2s ease-out 0.5s infinite',
                boxShadow: '0 4px 16px rgba(27,67,50,0.35)',
                flexShrink: 0,
              }}>🌿</div>

              <div>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-0.6px', margin: 0, lineHeight: 1.1, fontFamily: 'Georgia,serif' }}>
                  My Favorites
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', margin: '5px 0 0', fontWeight: 500 }}>
                  Your personal book collection
                </p>
              </div>
            </div>

            {/* Hero quick-stat pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { v: favBooks.length,                              l: 'Books Saved' },
                { v: favBooks.filter(b => b.available).length,     l: 'Available' },
                { v: new Set(favBooks.map(b => b.category)).size,  l: 'Genres' },
              ].map(({ v, l }, i) => (
                <div key={l} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px', borderRadius: 24,
                  background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                  animation: 'favHeroBadge 0.4s ease both',
                  animationDelay: `${i * 0.07}s`,
                  backdropFilter: 'blur(8px)',
                }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1 }}>{v}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ display: 'flex', gap: 20, padding: '20px 24px 32px', alignItems: 'flex-start' }}>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {statCards.map(({ icon, label, value, color, bg, border, glow }, idx) => (
                <div key={label} style={{
                  background: bg, border: `1.5px solid ${border}`,
                  borderRadius: 18, padding: '16px 18px',
                  animation: 'favStatIn 0.45s ease both',
                  animationDelay: `${idx * 0.07}s`,
                  boxShadow: `0 4px 20px ${glow}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.55) 50%,transparent 100%)',
                    animation: 'favShimmer 3s ease infinite',
                    animationDelay: `${idx * 0.5}s`,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    fontSize: 26, marginBottom: 10, display: 'inline-block',
                    animation: idx === 0 ? 'favHeartBeat 1.8s ease-in-out 0.5s infinite' : 'none',
                  }}>{icon}</div>
                  <p style={{ fontSize: 30, fontWeight: 800, color, margin: '0 0 3px', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0, fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Pill tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#E8F5E9', borderRadius: 14, padding: 5, width: 'fit-content' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: activeTab === t.id ? '#fff' : 'transparent',
                  color: activeTab === t.id ? '#1B4332' : '#64748b',
                  boxShadow: activeTab === t.id ? '0 2px 10px rgba(27,67,50,0.12)' : 'none',
                  transition: 'all 0.22s ease',
                  whiteSpace: 'nowrap',
                }}>
                  {t.label}
                  <span style={{
                    marginLeft: 7, fontSize: 11, padding: '2px 7px', borderRadius: 8,
                    background: activeTab === t.id ? '#D1FAE5' : 'rgba(0,0,0,0.07)',
                    color: activeTab === t.id ? '#1B4332' : '#94a3b8',
                    fontWeight: 700,
                  }}>{t.count}</span>
                </button>
              ))}
            </div>

            {/* Book grid / states */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 14 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 18, background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', aspectRatio: '0.67', animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'favEmptyIn 0.5s ease both' }}>
                <div style={{ fontSize: 72, marginBottom: 16, display: 'inline-block', animation: 'favHeartBeat 1.8s ease-in-out infinite' }}>♡</div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No favorites yet</p>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Click the heart on any book to save it here</p>
                <button onClick={() => navigate('/books')} style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg,#1B4332,#2D6A4F)',
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(27,67,50,0.35)',
                }}>Browse Books</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 14 }}>
                {displayed.map((book, i) => (
                  <BookCard key={book.id} book={book} onBorrow={handleBorrow} onRemove={handleRemove} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <aside style={{ width: 242, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, animation: 'favSideIn 0.5s ease both', animationDelay: '0.15s' }}>

            {/* Genre distribution */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 17 }}>📊</span> Favorite Genres
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(genres.length > 0 ? genres : [
                  { name: 'Classic', count: 9, pct: 38 },
                  { name: 'Fiction', count: 4, pct: 17 },
                  { name: 'Fantasy', count: 3, pct: 13 },
                ]).map(({ name, count, pct }) => {
                  const cfg = GENRE_COLORS[name] ?? DEFAULT_GENRE;
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{name}</span>
                        <span style={{ fontSize: 10, background: cfg.bg, color: cfg.color, padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{count} books</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 999, height: 7, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 999,
                          background: cfg.bar,
                          width: `${pct}%`,
                          animation: 'favBarFill 0.9s cubic-bezier(0.4,0,0.2,1) both',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reading Mood */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 17 }}>🎭</span> Reading Mood
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MOODS.map(({ label, emoji, color, bg, border, glow }, i) => (
                  <button key={label} onClick={() => setSelectedMood(selectedMood === label ? null : label)} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 13px', borderRadius: 12,
                    border: `1.5px solid ${selectedMood === label ? color : border}`,
                    background: selectedMood === label ? bg : '#fafafa',
                    color: selectedMood === label ? color : '#64748b',
                    cursor: 'pointer', textAlign: 'left',
                    fontWeight: selectedMood === label ? 700 : 500, fontSize: 12,
                    transition: 'all 0.2s ease',
                    boxShadow: selectedMood === label ? `0 4px 14px ${glow}` : 'none',
                    animation: 'favMoodPop 0.32s ease both',
                    animationDelay: `${i * 0.045}s`,
                  }}>
                    <span style={{ fontSize: 17 }}>{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended */}
            {recBooks.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 17 }}>💡</span> Recommended For You
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recBooks.map(book => (
                    <div key={book.id}
                      onClick={() => navigate(`/books/${book.id}`)}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                      style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: 7, borderRadius: 12, transition: 'background 0.18s' }}
                    >
                      <div style={{ width: 40, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        {book.cover_url && <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                        <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</p>
                        <button
                          onClick={e => { e.stopPropagation(); void handleBorrow(book.id); }}
                          disabled={!book.available}
                          style={{
                            fontSize: 10, padding: '3px 11px', borderRadius: 7, border: 'none',
                            background: 'linear-gradient(135deg,#065f46,#059669)',
                            color: '#fff', fontWeight: 700, cursor: 'pointer',
                            opacity: book.available ? 1 : 0.5,
                          }}
                        >Borrow</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
