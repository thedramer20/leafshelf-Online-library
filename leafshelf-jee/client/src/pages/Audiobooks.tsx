import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLocalBorrow, apiErrorMessage, borrow, listBooks } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAudioPlayer } from '../lib/audioPlayer';
import { durationFromPages } from '../components/GlobalAudioPlayer';
import type { Book } from '../lib/types';

const ALL_TABS = ['All', 'Classic', 'Fiction', 'Fantasy', 'Dystopian', 'Romance', 'Recently Added'] as const;
type AudioTab = typeof ALL_TABS[number];

const GENRE_META: Record<string, { bg: string; color: string; emoji: string }> = {
  Classic:    { bg: '#D1FAE5', color: '#065F46',  emoji: '📜' },
  Fiction:    { bg: '#DBEAFE', color: '#1D4ED8',  emoji: '📖' },
  Fantasy:    { bg: '#EDE9FE', color: '#5B21B6',  emoji: '🧙' },
  Dystopian:  { bg: '#FEE2E2', color: '#B91C1C',  emoji: '🌑' },
  Romance:    { bg: '#FCE7F3', color: '#9D174D',  emoji: '💕' },
  Horror:     { bg: '#FEF3C7', color: '#92400E',  emoji: '👻' },
  Science:    { bg: '#CFFAFE', color: '#0E7490',  emoji: '🔬' },
  Memoir:     { bg: '#FEF3C7', color: '#92400E',  emoji: '📝' },
  Historical: { bg: '#EDE9FE', color: '#5B21B6',  emoji: '🏛️' },
};
const DEFAULT_META = { bg: '#D1FAE5', color: '#1B4332', emoji: '🎧' };

const AB_ANIMS = `
@keyframes abHeroGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes abLeafFloat{0%,100%{transform:translateY(0) rotate(0deg);opacity:0.13}50%{transform:translateY(-18px) rotate(16deg);opacity:0.24}}
@keyframes abCardIn{from{opacity:0;transform:translateY(20px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes abStatIn{from{opacity:0;transform:translateY(16px) scale(0.88)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes abWave{0%{transform:scaleY(0.35)}100%{transform:scaleY(1)}}
@keyframes abShimmerBtn{0%{background-position:-300% 0}100%{background-position:300% 0}}
@keyframes abSideIn{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
@keyframes abFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes abBadgePop{0%{transform:scale(0.6)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
@keyframes abPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.7);opacity:0.38}}
@keyframes abTabSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
`;

function FloatingNotes() {
  const items = ['🎵', '🎧', '🎶', '🎵', '🎧', '🎶', '🎵'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {items.map((n, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${6 + i * 13}%`, top: `${12 + (i % 3) * 26}%`,
          fontSize: i % 2 === 0 ? 14 : 10, opacity: 0.12,
          animation: `abLeafFloat ${3.2 + i * 0.55}s ease-in-out infinite`,
          animationDelay: `${i * 0.42}s`,
        }}>{n}</span>
      ))}
    </div>
  );
}

function Waveform() {
  const bars = [14, 26, 18, 32, 22, 28, 16, 30, 20, 24];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 34 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2,
          background: `rgba(255,255,255,${0.22 + (i % 3) * 0.08})`,
          animation: `abWave ${0.68 + i * 0.09}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.11}s`,
          height: h,
        }} />
      ))}
    </div>
  );
}

function AudioCard({ book, idx, onBorrow, onListen }: { book: Book; idx: number; onBorrow: (id: number) => Promise<void>; onListen: (book: Book) => void }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  async function handleListen(e: React.MouseEvent) {
    e.stopPropagation();
    onListen(book);
    if (!borrowing && !borrowed && book.available) {
      setBorrowing(true);
      try { await onBorrow(book.id); setBorrowed(true); }
      catch { /* ignore */ }
      finally { setBorrowing(false); }
    }
  }

  const canBorrow = book.available && !borrowed && !borrowing;
  const dur = durationFromPages(book.pages ?? 300);

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: 'white', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
        border: hov ? '1.5px solid #A7F3D0' : '1.5px solid #EEF7F2',
        boxShadow: hov ? '0 16px 40px rgba(27,67,50,0.16)' : '0 2px 12px rgba(27,67,50,0.06)',
        transform: hov ? 'translateY(-5px) scale(1.015)' : 'none',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        animation: `abCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both`,
        animationDelay: `${0.06 + idx * 0.065}s`,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', paddingBottom: '72%', flexShrink: 0, overflow: 'hidden' }}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} loading="lazy" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              transform: hov ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }} />
          : <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg,#1B4332,#2D6A4F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
            }}>🎧</div>
        }

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,26,15,0.92) 0%, rgba(7,26,15,0.42) 60%, transparent 100%)',
          opacity: hov ? 1 : 0,
          transition: 'opacity 0.28s ease',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '10px 12px',
        }}>
          <button onClick={handleListen} disabled={false}
            style={{
              width: '100%', padding: '9px', borderRadius: 10, border: 'none',
              background: borrowed
                ? 'rgba(74,222,128,0.22)'
                : !book.available ? 'rgba(255,255,255,0.10)'
                : 'linear-gradient(90deg,#1B4332 0%,#2D7A55 44%,#3A9E6E 50%,#2D7A55 56%,#1B4332 100%)',
              backgroundSize: canBorrow ? '300% 100%' : 'auto',
              animation: canBorrow ? 'abShimmerBtn 2.6s linear infinite' : 'none',
              color: borrowed ? '#4ade80' : !book.available ? 'rgba(255,255,255,0.4)' : 'white',
              fontSize: 12, fontWeight: 700, cursor: canBorrow ? 'pointer' : 'default',
              boxShadow: canBorrow ? '0 4px 16px rgba(27,67,50,0.5)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {borrowed ? '✓ Borrowed' : borrowing ? '…' : <><span style={{ fontSize: 13 }}>▶</span> Listen Now</>}

          </button>
        </div>

        {/* Available pulse dot */}
        <span style={{
          position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: '50%',
          background: book.available ? '#22C55E' : '#EF4444',
          border: '2.5px solid white',
          boxShadow: `0 2px 6px ${book.available ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.4)'}`,
          animation: book.available ? 'abPulse 2s ease-in-out infinite' : 'none',
        }} />

        {/* Duration badge top-left */}
        <div style={{
          position: 'absolute', top: 10, left: 10, padding: '3px 9px', borderRadius: 20,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          color: 'rgba(255,255,255,0.92)', fontSize: 10, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 9 }}>🎧</span>{dur}
        </div>

        {/* Category badge bottom-left (hides on hover) */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          opacity: hov ? 0 : 1, transition: 'opacity 0.2s ease',
        }}>{book.category}</div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px', flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2e22', margin: '0 0 3px', lineHeight: 1.35, overflow: 'hidden', maxHeight: 36 }}>{book.title}</p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 10px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.author}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width={11} height={11} fill={i <= Math.round(book.rating) ? '#F59E0B' : '#E5E7EB'} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, marginLeft: 3 }}>{book.rating.toFixed(1)}</span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: book.available ? '#D1FAE5' : '#FEE2E2',
            color: book.available ? '#065F46' : '#B91C1C',
            padding: '2px 8px', borderRadius: 20,
            border: `1px solid ${book.available ? '#6EE7B7' : '#FECACA'}`,
          }}>{book.available ? 'Available' : 'Out'}</span>
        </div>
      </div>
    </div>
  );
}

function GenreBtn({ genre, active, count, onClick }: { genre: string; active: boolean; count: number; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const meta = GENRE_META[genre] ?? DEFAULT_META;
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', width: '100%',
        background: active ? 'linear-gradient(90deg,#F0FDF4,#D1FAE5)' : hov ? '#F6FAF8' : 'transparent',
        transition: 'all 0.18s ease',
        borderLeft: active ? '3px solid #2D6A4F' : '3px solid transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15 }}>{meta.emoji}</span>
        <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#1B4332' : '#374151' }}>{genre}</span>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700,
        background: active ? meta.bg : '#F0F9F4',
        color: active ? meta.color : '#9CA3AF',
        padding: '2px 7px', borderRadius: 20,
        transition: 'all 0.18s',
      }}>{count}</span>
    </button>
  );
}

export default function Audiobooks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPlayerBook, setMini } = useAudioPlayer();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AudioTab>('All');

  useEffect(() => {
    let alive = true;
    listBooks()
      .then(b => { if (alive) setBooks(Array.isArray(b) ? b : []); })
      .catch(e => { if (alive) setApiError(apiErrorMessage(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function handleBorrow(bookId: number): Promise<void> {
    const b = books.find(x => x.id === bookId);
    if (!b) return;
    try {
      if (user) await borrow(bookId);
      addLocalBorrow({ id: b.id, title: b.title, author: b.author, cover_url: b.cover_url, category: b.category, pages: b.pages });
    } catch {
      // server rejected — AudioCard reverts its local state
      throw new Error('borrow failed');
    }
  }

  const filtered = books.filter(b => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Recently Added') return b.id <= 5;
    return b.category === activeTab;
  });

  const totalDuration = books.reduce((acc, b) => acc + Math.floor((b.pages ?? 300) / 40), 0);
  const topRated = books.length > 0 ? [...books].sort((a, b) => b.rating - a.rating)[0] : null;

  const genreCounts: Record<string, number> = {};
  books.forEach(b => { genreCounts[b.category] = (genreCounts[b.category] || 0) + 1; });

  const tabCounts: Record<string, number> = {
    All: books.length,
    'Recently Added': Math.min(5, books.length),
    ...genreCounts,
  };

  const STAT_CHIPS = [
    { icon: '🎧', label: 'Total Audiobooks', value: String(books.length) },
    { icon: '⏱', label: 'Total Duration', value: `${totalDuration}h` },
    { icon: '🆕', label: 'New This Month', value: String(Math.min(5, books.length)) },
    { icon: '⭐', label: 'Top Rated', value: topRated ? topRated.rating.toFixed(1) : '—' },
  ];

  const GENRES = ['Classic', 'Fiction', 'Fantasy', 'Dystopian', 'Romance', 'Horror'];

  return (
    <>
      <style>{AB_ANIMS}</style>
      {apiError && (
        <div role="alert" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '11px 20px',
          background: '#FEF2F2', borderBottom: '1px solid #FECACA',
          color: '#B91C1C', fontSize: 13, fontWeight: 500,
        }}>
          <span>⚠️ Couldn't load audiobooks — {apiError}. <button onClick={() => window.location.reload()} style={{ fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Retry</button></span>
          <button onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: 16 }} aria-label="Dismiss">✕</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 24, padding: 24, minHeight: '100%', background: '#F6FAF8' }}>

        {/* ── Main column ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Hero */}
          <div style={{
            background: 'linear-gradient(135deg,#071a0f 0%,#0e2318 15%,#1B4332 38%,#2D6A4F 62%,#1B4332 82%,#071a0f 100%)',
            backgroundSize: '300% 300%', animation: 'abHeroGrad 12s ease infinite',
            borderRadius: 24, padding: '30px 34px', marginBottom: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <FloatingNotes />
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(82,183,136,0.10),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: 160, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.04),transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: 16 }}>
                <Waveform />
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 32, fontFamily: 'Georgia,serif', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                🎧 Audio Books
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>
                Listen to your favourite books anytime, anywhere
              </p>

              {/* Stat chips */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {STAT_CHIPS.map(({ icon, label, value }, i) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: 16, padding: '10px 18px',
                    animation: `abStatIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both`,
                    animationDelay: `${0.10 + i * 0.08}s`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0, lineHeight: 1 }}>{value}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.48)', margin: '2px 0 0' }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pill tab bar */}
          <div style={{
            display: 'flex', gap: 6, background: '#E8F5E9', borderRadius: 16, padding: 5, marginBottom: 24,
            overflowX: 'auto',
          }}>
            {ALL_TABS.map((tab, i) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={{
                padding: '8px 16px', borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#1B4332' : '#6B7280',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: 13,
                boxShadow: activeTab === tab ? '0 2px 10px rgba(27,67,50,0.12)' : 'none',
                transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                animation: `abTabSlide 0.4s ease both`,
                animationDelay: `${i * 0.05}s`,
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              }}>
                {tab}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: activeTab === tab ? '#D1FAE5' : 'rgba(0,0,0,0.07)',
                  color: activeTab === tab ? '#065F46' : '#9CA3AF',
                  padding: '1px 7px', borderRadius: 20,
                  animation: activeTab === tab ? `abBadgePop 0.35s ease both` : 'none',
                }}>{tabCounts[tab] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Book grid */}
          {loading ? (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  borderRadius: 20, background: 'linear-gradient(135deg,#E8F5E9,#D1FAE5)',
                  aspectRatio: '0.88', animation: `abFadeUp 1.4s ease-in-out ${i * 0.1}s infinite alternate`,
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, border: '1.5px solid #F0F9F4', animation: 'abFadeUp 0.4s ease both' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎧</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1B4332', margin: '0 0 8px' }}>No audiobooks in this category</p>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Try a different tab above</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))' }}>
              {filtered.map((book, i) => (
                <AudioCard key={book.id} book={book} idx={i} onBorrow={handleBorrow} onListen={b => { setMini(false); setPlayerBook(b); }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ width: 252, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Trending Now */}
          <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #D1FAE5', boxShadow: '0 2px 14px rgba(27,67,50,0.07)', padding: '20px 18px', animation: 'abSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay: '0.1s' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#1B4332', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 16 }}>🔥</span> Trending Now
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...books].sort((a, b) => b.rating - a.rating).slice(0, 3).map((book, i) => (
                <div key={book.id} onClick={() => navigate(`/books/${book.id}`)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6FAF8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '7px 8px', borderRadius: 10, transition: 'background 0.18s', animation: `abFadeUp 0.4s ease both`, animationDelay: `${0.2 + i * 0.07}s` }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? 'linear-gradient(135deg,#F59E0B,#D97706)' : i === 1 ? 'linear-gradient(135deg,#94A3B8,#64748B)' : 'linear-gradient(135deg,#C2956C,#A07045)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: 'white',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e22', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>{book.author} · {book.rating.toFixed(1)}★</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browse by Genre */}
          <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #D1FAE5', boxShadow: '0 2px 14px rgba(27,67,50,0.07)', padding: '20px 18px', animation: 'abSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay: '0.18s' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#1B4332', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 16 }}>🎵</span> Browse by Genre
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {GENRES.map(genre => (
                <GenreBtn
                  key={genre}
                  genre={genre}
                  active={activeTab === genre}
                  count={genreCounts[genre] ?? 0}
                  onClick={() => setActiveTab(genre as AudioTab)}
                />
              ))}
            </div>
          </div>

          {/* Featured Pick */}
          {topRated && (
            <div
              onClick={() => navigate(`/books/${topRated.id}`)}
              style={{
                background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)',
                borderRadius: 20, boxShadow: '0 4px 20px rgba(27,67,50,0.22)',
                padding: '18px', cursor: 'pointer',
                animation: 'abSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay: '0.26s',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(82,183,136,0.15),transparent 70%)', pointerEvents: 'none' }} />
              <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.52)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                ⭐ Featured Pick
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 50, height: 66, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>
                  {topRated.cover_url
                    ? <img src={topRated.cover_url} alt={topRated.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎧</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: '0 0 3px', lineHeight: 1.3, overflow: 'hidden', maxHeight: 36 }}>{topRated.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.52)', margin: '0 0 8px' }}>{topRated.author}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} width={11} height={11} fill={i <= Math.round(topRated.rating) ? '#F59E0B' : 'rgba(255,255,255,0.18)'} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: 700, marginLeft: 2 }}>{topRated.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setMini(false); setPlayerBook(topRated); }}
                style={{
                  width: '100%', marginTop: 14, padding: '9px', borderRadius: 10,
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                  color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ▶ Listen Now
              </button>
            </div>
          )}

        </aside>
      </div>

    </>
  );
}
