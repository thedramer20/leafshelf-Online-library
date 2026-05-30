import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloads, getLocalBorrowed, removeDownload } from '../lib/api';
import type { DownloadEntry } from '../lib/api';

type FilterTab = 'All Downloads' | 'eBooks' | 'Audiobooks' | 'PDFs' | 'Completed';
const FILTER_TABS: FilterTab[] = ['All Downloads', 'eBooks', 'Audiobooks', 'PDFs', 'Completed'];

const SEED: (DownloadEntry & { book_id: number })[] = [
  { id: 101, book_id: 1, title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', addedAt: 'May 28, 2026' },
  { id: 102, book_id: 2, title: 'Brave New World', author: 'Aldous Huxley', addedAt: 'May 28, 2026' },
  { id: 103, book_id: 3, title: 'Pride and Prejudice', author: 'Jane Austen', addedAt: 'May 8, 2026' },
  { id: 104, book_id: 4, title: 'To Kill a Mockingbird', author: 'Harper Lee', addedAt: 'May 20, 2026' },
  { id: 105, book_id: 5, title: '1984', author: 'George Orwell', addedAt: 'May 18, 2026' },
  { id: 106, book_id: 6, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', addedAt: 'May 15, 2026' },
];

const DL_ANIMS = `
@keyframes dlHeroGrad {
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
@keyframes dlLeafFloat {
  0%,100%{transform:translateY(0) rotate(0deg);opacity:0.18}
  50%{transform:translateY(-16px) rotate(14deg);opacity:0.3}
}
@keyframes dlStatIn {
  from{opacity:0;transform:translateY(22px) scale(0.88)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
@keyframes dlCardIn {
  from{opacity:0;transform:translateY(16px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes dlRingDraw {
  from{stroke-dasharray:0 999}
}
@keyframes dlShimmerBtn {
  0%{background-position:-300% 0}
  100%{background-position:300% 0}
}
@keyframes dlSideIn {
  from{opacity:0;transform:translateX(20px)}
  to{opacity:1;transform:translateX(0)}
}
@keyframes dlTabFade {
  from{opacity:0;transform:translateY(8px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes dlCountIn {
  from{transform:scale(0.3);opacity:0}
  to{transform:scale(1);opacity:1}
}
@keyframes dlBadgePop {
  0%{transform:scale(0.6)}
  70%{transform:scale(1.18)}
  100%{transform:scale(1)}
}
@keyframes dlBarFill {
  from{width:0%}
}
@keyframes dlPulseRing {
  0%,100%{box-shadow:0 0 0 0 rgba(82,183,136,0)}
  50%{box-shadow:0 0 0 6px rgba(82,183,136,0.18)}
}
`;

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)',
  'linear-gradient(135deg,#2c3e50 0%,#1B4332 100%)',
  'linear-gradient(135deg,#1a3a2a 0%,#52B788 100%)',
  'linear-gradient(135deg,#0f2418 0%,#2D6A4F 100%)',
  'linear-gradient(135deg,#234d35 0%,#1B4332 100%)',
  'linear-gradient(135deg,#2D6A4F 0%,#40916c 100%)',
];
const COVER_ICONS = ['📖', '📚', '📕', '📗', '📘', '📙'];
const FILE_SIZES: Record<number, string> = {
  101: '4.2 MB', 102: '2.8 MB', 103: '1.9 MB',
  104: '3.1 MB', 105: '2.3 MB', 106: '1.7 MB',
};
function getFileSize(id: number) {
  return FILE_SIZES[id] ?? `${((id % 5) + 1)}.${id % 9} MB`;
}

function FloatingLeaves() {
  const items = ['🌿', '☘️', '🍃', '🌱', '🌿', '🍃'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {items.map((leaf, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${8 + i * 15}%`,
          top: `${15 + (i % 3) * 28}%`,
          fontSize: i % 2 === 0 ? 16 : 11,
          opacity: 0.18,
          animation: `dlLeafFloat ${3 + i * 0.6}s ease-in-out infinite`,
          animationDelay: `${i * 0.45}s`,
        }}>{leaf}</span>
      ))}
    </div>
  );
}

function StorageRing({ pct }: { pct: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="dlStorageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#52B788" />
          <stop offset="100%" stopColor="#1B4332" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="44" r={r} fill="none" stroke="#E8F5E9" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="url(#dlStorageGrad)" strokeWidth="8"
        strokeDasharray={`${(pct / 100) * circ} ${circ - (pct / 100) * circ}`}
        strokeLinecap="round"
        style={{ animation: 'dlRingDraw 1.8s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay: '0.3s' }}
      />
    </svg>
  );
}

function DownloadCard({ item, idx, onDelete, deleting, onOpen }: {
  item: DownloadEntry & { book_id?: number };
  idx: number;
  onDelete: (id: number) => void;
  deleting: number | null;
  onOpen: (bookId: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [openHov, setOpenHov] = useState(false);
  const [delHov, setDelHov] = useState(false);
  const isDeleting = deleting === item.id;
  const coverGrad = COVER_GRADIENTS[idx % COVER_GRADIENTS.length];
  const coverIcon = COVER_ICONS[idx % COVER_ICONS.length];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 20px',
        background: hovered ? 'linear-gradient(90deg,#F0FDF4 0%,#FAFFFE 100%)' : 'white',
        borderRadius: 18,
        border: hovered ? '1.5px solid #A7F3D0' : '1.5px solid #F0F9F4',
        boxShadow: hovered ? '0 6px 24px rgba(27,67,50,0.11)' : '0 1px 6px rgba(27,67,50,0.05)',
        transform: isDeleting
          ? 'translateX(40px) scale(0.94)'
          : hovered ? 'translateY(-2px)' : 'none',
        opacity: isDeleting ? 0 : 1,
        transition: isDeleting
          ? 'all 0.32s ease'
          : 'all 0.24s cubic-bezier(0.34,1.56,0.64,1)',
        animation: `dlCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both`,
        animationDelay: `${idx * 0.07}s`,
      }}
    >
      {/* Cover */}
      <div style={{
        width: 46,
        height: 64,
        flexShrink: 0,
        borderRadius: 9,
        background: coverGrad,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        overflow: 'hidden',
        boxShadow: '0 3px 10px rgba(27,67,50,0.22)',
        transform: hovered ? 'scale(1.06) rotate(-1.5deg)' : 'none',
        transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {item.cover_url
          ? <img src={item.cover_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <span style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>{coverIcon}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#1a2e22',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '92%',
        }}>{item.title}</p>
        <p style={{ fontSize: 12, color: '#6B7280', margin: '3px 0 7px' }}>{item.author}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 9px',
            borderRadius: 20,
            background: item.type === 'audiobook' ? '#F3E8FF' : item.type === 'pdf' ? '#FEF3C7' : '#EFF6FF',
            color: item.type === 'audiobook' ? '#7C3AED' : item.type === 'pdf' ? '#B45309' : '#2563EB',
            letterSpacing: '0.02em',
            animation: `dlBadgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both`,
            animationDelay: `${0.12 + idx * 0.07}s`,
          }}>{item.type === 'audiobook' ? 'Audiobook' : item.type === 'pdf' ? 'PDF' : 'eBook'}</span>
          <span style={{ fontSize: 11, color: '#D1D5DB' }}>·</span>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{getFileSize(item.id)}</span>
        </div>
      </div>

      {/* Date */}
      <div style={{ width: 96, flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, textAlign: 'right' }}>{item.addedAt}</p>
      </div>

      {/* Status badge */}
      <div style={{ width: 96, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 20,
          background: '#D1FAE5',
          color: '#065F46',
          letterSpacing: '0.03em',
          animation: `dlBadgePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both`,
          animationDelay: `${0.18 + idx * 0.07}s`,
        }}>✓ Completed</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onMouseEnter={() => setOpenHov(true)}
          onMouseLeave={() => setOpenHov(false)}
          onClick={() => onOpen(item.book_id ?? item.id)}
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '7px 16px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: openHov
              ? 'linear-gradient(90deg,#1B4332 0%,#2D7A55 44%,#3A9E6E 50%,#2D7A55 56%,#1B4332 100%)'
              : '#1B4332',
            backgroundSize: openHov ? '300% 100%' : '100% 100%',
            color: 'white',
            boxShadow: openHov ? '0 4px 14px rgba(27,67,50,0.38)' : '0 1px 5px rgba(27,67,50,0.22)',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            transform: openHov ? 'scale(1.04)' : 'none',
            ...(openHov ? { animation: 'dlShimmerBtn 2.8s linear infinite' } : {}),
          }}
        >
          Open
        </button>
        <button
          type="button"
          onMouseEnter={() => setDelHov(true)}
          onMouseLeave={() => setDelHov(false)}
          onClick={() => onDelete(item.id)}
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: '7px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            background: delHov ? '#FEF2F2' : 'transparent',
            color: '#EF4444',
            border: `1.5px solid ${delHov ? '#EF4444' : '#FCA5A5'}`,
            transition: 'all 0.2s ease',
            transform: delHov ? 'scale(1.04)' : 'none',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Downloads() {
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState<(DownloadEntry & { book_id?: number })[]>(() => {
    const stored = getDownloads();
    if (stored.length > 0) return stored as (DownloadEntry & { book_id?: number })[];
    // Seed from real borrowed books if any
    const borrowed = getLocalBorrowed();
    if (borrowed.length > 0) {
      const fromBorrows: (DownloadEntry & { book_id: number })[] = borrowed.map(b => ({
        id: b.id, book_id: b.id, title: b.title, author: b.author,
        cover_url: b.cover_url, addedAt: b.borrowedAt,
      }));
      localStorage.setItem('leafshelf:downloads', JSON.stringify(fromBorrows));
      return fromBorrows;
    }
    localStorage.setItem('leafshelf:downloads', JSON.stringify(SEED));
    return SEED;
  });
  const [activeTab, setActiveTab] = useState<FilterTab>('All Downloads');
  const [deleting, setDeleting] = useState<number | null>(null);

  function handleDelete(id: number) {
    setDeleting(id);
    setTimeout(() => {
      removeDownload(id);
      setDownloads(prev => prev.filter(d => d.id !== id));
      setDeleting(null);
    }, 340);
  }

  const ebooks = downloads.filter(d => !d.type || d.type === 'ebook');
  const audiobooks = downloads.filter(d => d.type === 'audiobook');
  const pdfs = downloads.filter(d => d.type === 'pdf');

  const filtered =
    activeTab === 'All Downloads' || activeTab === 'Completed' ? downloads
    : activeTab === 'eBooks' ? ebooks
    : activeTab === 'Audiobooks' ? audiobooks
    : activeTab === 'PDFs' ? pdfs
    : downloads;

  const totalMB = downloads.length * 22;
  const storagePct = Math.min(99, Math.round((totalMB / 10240) * 100));
  const availableGB = ((10240 - totalMB) / 1024).toFixed(2);

  const tabCounts: Record<FilterTab, number> = {
    'All Downloads': downloads.length,
    'eBooks': ebooks.length,
    'Audiobooks': audiobooks.length,
    'PDFs': pdfs.length,
    'Completed': downloads.length,
  };

  return (
    <>
      <style>{DL_ANIMS}</style>
      <div style={{ display: 'flex', gap: 24, padding: 24, minHeight: '100%', background: '#F6FAF8' }}>

        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Hero banner */}
          <div style={{
            background: 'linear-gradient(135deg,#071a0f 0%,#0e2318 15%,#1B4332 38%,#2D6A4F 62%,#1B4332 82%,#071a0f 100%)',
            backgroundSize: '300% 300%',
            animation: 'dlHeroGrad 12s ease infinite',
            borderRadius: 24,
            padding: '28px 32px',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <FloatingLeaves />
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(82,183,136,0.13),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, left: 140, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.05),transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 26 }}>⬇️</span>
                <h1 style={{ margin: 0, fontSize: 27, fontFamily: 'Georgia,serif', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                  Downloads
                </h1>
              </div>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                Your offline reading collection — available anywhere, anytime
              </p>

              {/* Stat chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { icon: '📚', label: 'Total Files', value: String(downloads.length) },
                  { icon: '📖', label: 'eBooks', value: String(ebooks.length) },
                  { icon: '🎧', label: 'Audiobooks', value: String(audiobooks.length) },
                  { icon: '💾', label: 'Storage Used', value: `${totalMB} MB` },
                ].map(({ icon, label, value }, i) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    padding: '12px 14px',
                    animation: `dlStatIn 0.52s cubic-bezier(0.34,1.56,0.64,1) both`,
                    animationDelay: `${0.08 + i * 0.07}s`,
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 5 }}>{icon}</div>
                    <div style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: 'white',
                      fontFamily: 'Georgia,serif',
                      animation: `dlCountIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both`,
                      animationDelay: `${0.2 + i * 0.07}s`,
                    }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pill tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            padding: '5px 6px',
            background: '#EDF7F1',
            borderRadius: 16,
            border: '1px solid #D1FAE5',
            marginBottom: 20,
            overflowX: 'auto',
          }}>
            {FILTER_TABS.map(t => {
              const isActive = activeTab === t;
              const count = tabCounts[t];
              return (
                <button key={t} type="button" onClick={() => setActiveTab(t)} style={{
                  flexShrink: 0,
                  padding: '8px 18px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#1B4332' : 'transparent',
                  color: isActive ? 'white' : '#4B7A5E',
                  boxShadow: isActive ? '0 3px 12px rgba(27,67,50,0.28)' : 'none',
                  transition: 'all 0.26s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isActive ? 'scale(1.015)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  {t}
                  {count > 0 && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      background: isActive ? 'rgba(255,255,255,0.22)' : '#D1FAE5',
                      color: isActive ? 'white' : '#065F46',
                      borderRadius: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Column header row */}
          {filtered.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 20px 10px',
              borderBottom: '1.5px solid #E8F5E9',
              marginBottom: 10,
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 46, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Title</span>
              </div>
              <div style={{ width: 96, textAlign: 'right' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Downloaded</span>
              </div>
              <div style={{ width: 96, textAlign: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</span>
              </div>
              <div style={{ width: 120, textAlign: 'right' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Actions</span>
              </div>
            </div>
          )}

          {/* Cards list */}
          <div
            key={activeTab}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              animation: `dlTabFade 0.3s ease both`,
            }}
          >
            {filtered.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '64px 20px',
                background: 'white',
                borderRadius: 20,
                border: '1.5px solid #F0F9F4',
                boxShadow: '0 1px 8px rgba(27,67,50,0.05)',
                animation: `dlCardIn 0.4s ease both`,
              }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1B4332', margin: '0 0 6px' }}>
                  No {activeTab} found
                </p>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
                  Downloads in this category will appear here
                </p>
              </div>
            ) : (
              filtered.map((item, idx) => (
                <DownloadCard
                  key={item.id}
                  item={item}
                  idx={idx}
                  onDelete={handleDelete}
                  deleting={deleting}
                  onOpen={bookId => navigate(`/books/${bookId}/read`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ width: 244, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Storage ring */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            border: '1.5px solid #D1FAE5',
            boxShadow: '0 2px 14px rgba(27,67,50,0.07)',
            padding: '20px 18px',
            animation: 'dlSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
            animationDelay: '0.1s',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#1B4332' }}>Offline Storage</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, position: 'relative' }}>
              <StorageRing pct={storagePct} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#1B4332', fontFamily: 'Georgia,serif' }}>
                  {storagePct}%
                </span>
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>Used</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { label: 'Used', value: `${totalMB} MB`, color: '#1B4332' },
                { label: 'Available', value: `${availableGB} GB`, color: '#2D6A4F' },
                { label: 'Total', value: '10 GB', color: '#6B7280' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, height: 6, background: '#E8F5E9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${storagePct}%`,
                background: 'linear-gradient(90deg,#52B788,#2D6A4F,#1B4332)',
                borderRadius: 3,
                animation: 'dlBarFill 1.6s cubic-bezier(0.34,1.56,0.64,1) both',
                animationDelay: '0.4s',
              }} />
            </div>
          </div>

          {/* Download Preferences */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            border: '1.5px solid #D1FAE5',
            boxShadow: '0 2px 14px rgba(27,67,50,0.07)',
            padding: '20px 18px',
            animation: 'dlSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
            animationDelay: '0.18s',
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#1B4332' }}>Download Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Auto-download', value: 'Wi-Fi only', icon: '📶' },
                { label: 'Quality', value: 'High', icon: '⭐' },
                { label: 'Storage limit', value: '10 GB', icon: '💾' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: '#F6FAF8',
                  borderRadius: 10,
                  border: '1px solid #E8F5E9',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B7280' }}>
                    <span>{icon}</span>{label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1B4332' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Downloaded */}
          <div style={{
            background: 'white',
            borderRadius: 20,
            border: '1.5px solid #D1FAE5',
            boxShadow: '0 2px 14px rgba(27,67,50,0.07)',
            padding: '20px 18px',
            animation: 'dlSideIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
            animationDelay: '0.26s',
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#1B4332' }}>Recently Downloaded</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {downloads.slice(0, 4).map(({ id, title, addedAt }, i) => (
                <div key={id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  animation: `dlCardIn 0.45s ease both`,
                  animationDelay: `${0.32 + i * 0.06}s`,
                }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    flexShrink: 0,
                    background: COVER_GRADIENTS[i % COVER_GRADIENTS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                  }}>{COVER_ICONS[i % COVER_ICONS.length]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#1a2e22',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{title}</p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>{addedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </>
  );
}
