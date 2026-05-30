import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ML_ANIMS = `
  @keyframes mlHeroGrad {
    0%,100% { background-position: 0% 50% }
    50%      { background-position: 100% 50% }
  }
  @keyframes mlLeafFloat {
    0%   { transform: translateY(0px)   rotate(0deg) }
    33%  { transform: translateY(-22px) rotate(13deg) }
    66%  { transform: translateY(-9px)  rotate(-7deg) }
    100% { transform: translateY(0px)   rotate(0deg) }
  }
  @keyframes mlStatIn {
    from { opacity: 0; transform: translateY(30px) scale(0.88) }
    to   { opacity: 1; transform: translateY(0)    scale(1) }
  }
  @keyframes mlCardIn {
    from { opacity: 0; transform: translateY(20px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  @keyframes mlProgressFill {
    from { width: 0% }
  }
  @keyframes mlProgressGlow {
    0%,100% { box-shadow: 0 0 0 2px rgba(82,183,136,0.6) }
    50%     { box-shadow: 0 0 0 6px rgba(82,183,136,0.12) }
  }
  @keyframes mlRingDraw {
    from { stroke-dasharray: 0 1000 }
  }
  @keyframes mlBadgePop {
    0%   { transform: scale(0.5); opacity: 0 }
    80%  { transform: scale(1.12) }
    100% { transform: scale(1);   opacity: 1 }
  }
  @keyframes mlShimmerBtn {
    0%   { background-position: -300% center }
    100% { background-position:  300% center }
  }
  @keyframes mlTabFade {
    from { opacity: 0; transform: translateY(10px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  @keyframes mlCountIn {
    from { opacity: 0; transform: scale(0.3) }
    to   { opacity: 1; transform: scale(1) }
  }
  @keyframes mlSideIn {
    from { opacity: 0; transform: translateX(22px) }
    to   { opacity: 1; transform: translateX(0) }
  }
  @keyframes mlHeroIn {
    from { opacity: 0; transform: translateY(-20px) }
    to   { opacity: 1; transform: translateY(0) }
  }
  @keyframes mlPulse {
    0%,100% { opacity: 1; transform: scale(1) }
    50%     { opacity: 0.6; transform: scale(1.18) }
  }
  @keyframes mlSkeletonShimmer {
    0%   { background-position: -400px 0 }
    100% { background-position:  400px 0 }
  }
  @keyframes mlToastIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.97) }
    to   { opacity: 1; transform: translateY(0) scale(1) }
  }
`;

import { addLocalBorrow, apiErrorMessage, borrow, getFavoriteIds, getLocalBorrowed, getLocalReturned, listBooks, myLoans, readCached, returnLoan, returnLocalBorrow, toggleFavorite, writeCached } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getReadingStats, getReadingStatsDisplay } from '../lib/readingStats';
import { getProgressPct } from '../lib/readingProgress';
import type { Book, Loan } from '../lib/types';

type Tab = 'reading' | 'saved' | 'history' | 'list';

const TABS: { id: Tab; label: string }[] = [
  { id: 'reading', label: 'Currently Reading' },
  { id: 'saved',   label: 'Saved Books' },
  { id: 'history', label: 'Borrow History' },
  { id: 'list',    label: 'Reading List' },
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysLeft(due: string) {
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function FloatingLeaves() {
  const items = ['🌿','☘️','🍃','🌱','🌿','☘️','🍃'];
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {items.map((leaf, i) => (
        <span key={i} style={{
          position:'absolute',
          left:`${7 + i * 13}%`,
          top:`${10 + (i % 3) * 30}%`,
          fontSize: i % 2 === 0 ? 20 : 13,
          opacity: 0.22,
          animation:`mlLeafFloat ${3 + i * 0.55}s ease-in-out infinite`,
          animationDelay:`${i * 0.5}s`,
          userSelect:'none',
          display:'inline-block',
        }}>{leaf}</span>
      ))}
    </div>
  );
}

function GoalRing({ pct }: { pct: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform:'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="mlGoalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#52B788" />
          <stop offset="100%" stopColor="#1B4332" />
        </linearGradient>
      </defs>
      <circle cx="38" cy="38" r={r} fill="none" stroke="#E8F5E9" strokeWidth="7" />
      <circle cx="38" cy="38" r={r} fill="none" stroke="url(#mlGoalGrad)" strokeWidth="7"
        strokeDasharray={`${pct * circ} ${circ - pct * circ}`} strokeLinecap="round"
        style={{ animation:'mlRingDraw 1.5s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay:'0.4s' }} />
    </svg>
  );
}

function LoanCard({ loan, idx, onReturn, returning }: {
  loan: Loan; idx: number; onReturn: (id: number) => void; returning: number | null;
}) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const progress = getProgressPct(loan.book_id, 5);
  const d = daysLeft(loan.due_at);
  const isOverdue = d < 0;
  const isUrgent  = !isOverdue && d <= 3;
  const dueColor  = isOverdue ? '#EF4444' : isUrgent ? '#F59E0B' : '#22C55E';
  const dueBg     = isOverdue ? '#FEF2F2' : isUrgent ? '#FFFBEB' : '#F0FDF4';
  const dueBorder = isOverdue ? '#FECACA' : isUrgent ? '#FDE68A' : '#BBF7D0';
  const dueLabel  = isOverdue ? 'Overdue!' : d === 0 ? 'Due today' : `${d}d left`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:'white',
        borderRadius:20,
        border:`1.5px solid ${hovered ? '#A7F3D0' : '#E5E7EB'}`,
        boxShadow: hovered
          ? '0 12px 40px rgba(27,67,50,0.13), 0 2px 8px rgba(27,67,50,0.06)'
          : '0 1px 5px rgba(0,0,0,0.06)',
        padding:'18px 20px',
        display:'flex',
        gap:18,
        transition:'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        animation:`mlCardIn 0.45s ease both`,
        animationDelay:`${idx * 0.08}s`,
      }}>

      {/* Cover */}
      <div style={{
        width:76, height:108, flexShrink:0, borderRadius:12,
        overflow:'hidden',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.22)' : '0 4px 14px rgba(0,0,0,0.15)',
        transform: hovered ? 'scale(1.04) rotate(-1.5deg)' : 'scale(1) rotate(0deg)',
        transition:'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {loan.cover_url
          ? <img src={loan.cover_url} alt={loan.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1B4332,#2D6A4F)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>📚</div>
        }
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        {/* Title + due badge */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:3 }}>
          <div style={{ minWidth:0 }}>
            <p style={{ fontWeight:700, fontSize:15, color:'#111827', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>
              {loan.title ?? 'Untitled'}
            </p>
            <p style={{ fontSize:12, color:'#6B7280', margin:'2px 0 0', fontStyle:'italic' }}>{loan.author}</p>
          </div>
          <span style={{
            fontSize:10, fontWeight:700,
            color:dueColor, background:dueBg,
            border:`1px solid ${dueBorder}`,
            borderRadius:20, padding:'3px 9px', flexShrink:0,
            animation:`mlBadgePop 0.4s ease both`,
            animationDelay:`${0.3 + idx*0.08}s`,
            whiteSpace:'nowrap',
          }}>{dueLabel}</span>
        </div>

        {/* Meta */}
        <p style={{ fontSize:11, color:'#9CA3AF', margin:'4px 0 10px' }}>
          {[loan.pages ? `${loan.pages} pages` : null, loan.category].filter(Boolean).join(' • ')}
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom:12 }}>
          <div style={{ height:8, background:'#F0FDF4', borderRadius:99, position:'relative', overflow:'visible' }}>
            <div style={{
              height:'100%', borderRadius:99,
              background:'linear-gradient(90deg,#52B788 0%,#2D6A4F 60%,#1B4332 100%)',
              width:`${progress}%`,
              animation:`mlProgressFill 1s ease-out both`,
              animationDelay:`${0.3 + idx*0.08}s`,
              position:'relative', overflow:'visible',
            }}>
              {progress > 3 && (
                <div style={{
                  position:'absolute', right:-4, top:'50%',
                  transform:'translateY(-50%)',
                  width:12, height:12, borderRadius:'50%',
                  background:'white',
                  animation:'mlProgressGlow 1.8s ease-in-out infinite',
                }}/>
              )}
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
            <span style={{ fontSize:10, color:'#9CA3AF' }}>Reading progress</span>
            <span style={{ fontSize:11, fontWeight:800, color:'#1B4332' }}>{progress}%</span>
          </div>
        </div>

        {/* Due date */}
        <p style={{ fontSize:11, color:'#9CA3AF', margin:'0 0 12px' }}>Due: {formatDate(loan.due_at)}</p>

        {/* Actions */}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button type="button" onClick={() => navigate(`/books/${loan.book_id}/read`)}
            style={{
              padding:'8px 18px', fontSize:12, fontWeight:700,
              color:'white', border:'none', borderRadius:10, cursor:'pointer',
              background:'linear-gradient(90deg,#1B4332 0%,#2D7A55 44%,#3A9E6E 50%,#2D7A55 56%,#1B4332 100%)',
              backgroundSize:'300% 100%',
              animation:'mlShimmerBtn 2.8s linear infinite',
              boxShadow:'0 3px 12px rgba(27,67,50,0.3)',
            }}>
            Continue Reading
          </button>
          <button type="button" onClick={() => onReturn(loan.id)} disabled={returning === loan.id}
            style={{
              padding:'8px 14px', fontSize:12, fontWeight:600,
              color:'#6B7280', background:'white',
              border:'1.5px solid #E5E7EB', borderRadius:10, cursor:'pointer',
              transition:'all 0.2s ease',
              opacity: returning === loan.id ? 0.5 : 1,
            }}>
            {returning === loan.id ? 'Returning…' : 'Return'}
          </button>
          <button type="button" aria-label="More options"
            style={{
              marginLeft:'auto', width:30, height:30,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'transparent', border:'none', cursor:'pointer',
              borderRadius:8, color:'#9CA3AF', fontSize:20, lineHeight:1,
            }}>⋮</button>
        </div>
      </div>
    </div>
  );
}

function SavedBookCard({ book, idx, onUnsave }: { book: Book; idx: number; onUnsave: (id: number) => void }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/books/${book.id}`)}
      style={{
        borderRadius:16, overflow:'hidden', cursor:'pointer',
        background:'white',
        border:`1.5px solid ${hovered ? '#A7F3D0' : '#E5E7EB'}`,
        boxShadow: hovered ? '0 8px 28px rgba(27,67,50,0.13)' : '0 1px 5px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
        transition:'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        animation:`mlCardIn 0.4s ease both`,
        animationDelay:`${idx * 0.06}s`,
      }}>
      <div style={{ position:'relative', paddingBottom:'140%' }}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} loading="lazy" style={{
              position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
              transition:'transform 0.38s ease',
            }} />
          : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#1B4332,#2D6A4F)', display:'flex', alignItems:'flex-end', padding:8 }}>
              <span style={{ color:'white', fontSize:10, fontWeight:600, lineHeight:1.3 }}>{book.title}</span>
            </div>
        }
        <button type="button"
          onClick={e => { e.stopPropagation(); onUnsave(book.id); }}
          style={{
            position:'absolute', top:8, right:8,
            width:28, height:28, borderRadius:'50%',
            background:'rgba(255,255,255,0.9)',
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 6px rgba(0,0,0,0.12)',
            transition:'all 0.2s ease',
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#EF4444">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div style={{ padding:'10px 12px' }}>
        <p style={{ fontWeight:700, fontSize:12, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{book.title}</p>
        <p style={{ fontSize:10, color:'#6B7280', margin:'0 0 5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{book.author}</p>
        <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:7 }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ fontSize:10, color: i <= Math.round(book.rating) ? '#F59E0B' : '#E5E7EB' }}>★</span>
          ))}
          <span style={{ fontSize:9, color:'#9CA3AF', marginLeft:2 }}>{book.rating.toFixed(1)}</span>
        </div>
        <button type="button"
          onClick={e => { e.stopPropagation(); navigate(`/books/${book.id}/read`); }}
          style={{
            width:'100%', padding:'6px 0', fontSize:11, fontWeight:700,
            background:'#1B4332', color:'white', border:'none',
            borderRadius:9, cursor:'pointer',
            transition:'background 0.2s ease',
          }}>
          Read Now
        </button>
      </div>
    </div>
  );
}

export default function MyLibrary() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loans, setLoans] = useState<Loan[]>(() => readCached<Loan[]>('library:loans') ?? []);
  const [recBooks, setRecBooks] = useState<Book[]>(() => readCached<Book[]>('library:recommendations') ?? []);
  const [loading, setLoading] = useState(() => !readCached<Loan[]>('library:loans'));
  const [tab, setTab] = useState<Tab>('reading');
  const [returning, setReturning] = useState<number | null>(null);
  const [returnMsg, setReturnMsg] = useState<string | null>(null);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);
  const [localTick, setLocalTick] = useState(0);
  const [allBooks, setAllBooks] = useState<Book[]>(() => readCached<Book[]>('library:allbooks') ?? []);
  const localBorrows = useMemo(() => getLocalBorrowed(), [localTick]);
  const localReturns = useMemo(() => getLocalReturned(), [localTick]);
  const savedIds  = useMemo(() => getFavoriteIds(), [localTick]);
  const savedCount = savedIds.length;

  const load = useCallback(async () => {
    if (authLoading) return;
    if (!readCached<Loan[]>('library:loans')) setLoading(true);
    try {
      const b = await listBooks();
      setAllBooks(b);
      writeCached('library:allbooks', b);
      setRecBooks(b.filter(bk => bk.available).slice(0, 2));
      writeCached('library:recommendations', b.filter(bk => bk.available).slice(0, 2));
      if (user) {
        try { const l = await myLoans(); setLoans(l); writeCached('library:loans', l); }
        catch { setLoans([]); }
      } else {
        setLoans([]);
      }
    } finally { setLoading(false); }
  }, [authLoading, user]);

  useEffect(() => { void load(); }, [load]);

  async function handleReturn(loanId: number) {
    setReturning(loanId);
    try {
      if (loanId < 0) {
        returnLocalBorrow(-loanId);
        setLocalTick(t => t + 1);
        setReturnMsg('Book returned successfully!');
      } else {
        await returnLoan(loanId);
        setReturnMsg('Book returned successfully!');
        await load();
      }
      setTimeout(() => setReturnMsg(null), 3000);
    } catch (err) {
      setReturnMsg(apiErrorMessage(err));
    } finally { setReturning(null); }
  }

  async function handleBorrow(bookId: number) {
    setBorrowingId(bookId);
    const b = recBooks.find(x => x.id === bookId);
    if (b) addLocalBorrow({ id: b.id, title: b.title, author: b.author, cover_url: b.cover_url, category: b.category, pages: b.pages });
    setLocalTick(t => t + 1);
    if (user) { try { await borrow(bookId); await load(); } catch { /* keep local */ } }
    setBorrowingId(null);
  }

  const localActiveAsLoans: Loan[] = localBorrows.map(b => ({
    id: -b.id, user_id: -1, book_id: b.id,
    borrowed_at: new Date(b.borrowedAt).toISOString(),
    due_at: new Date(b.dueAt).toISOString(),
    returned_at: null, status: 'active' as const, active: true,
    title: b.title, author: b.author, cover_url: b.cover_url,
    category: b.category, pages: b.pages ?? null,
  }));
  const localReturnedAsLoans: Loan[] = localReturns.map(b => ({
    id: -b.id - 1000000, user_id: -1, book_id: b.id,
    borrowed_at: new Date(b.borrowedAt).toISOString(),
    due_at: new Date(b.dueAt).toISOString(),
    returned_at: new Date(b.returnedAt).toISOString(),
    status: 'returned' as const, active: false,
    title: b.title, author: b.author, cover_url: b.cover_url,
    category: b.category, pages: b.pages ?? null,
  }));
  const serverActive   = loans.filter(l => l.active);
  const serverReturned = loans.filter(l => !l.active);
  const activeLoans   = [...serverActive, ...localActiveAsLoans.filter(la => !serverActive.some(s => s.book_id === la.book_id))];
  const returnedLoans = [...serverReturned, ...localReturnedAsLoans.filter(la => !serverReturned.some(s => s.book_id === la.book_id))];
  const dueSoon = activeLoans.filter(l => { const d = daysLeft(l.due_at); return d >= 0 && d <= 7; });

  if (!authLoading && !user) {
    return (
      <>
        <style>{ML_ANIMS}</style>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:24 }}>
          <div style={{
            background:'white', borderRadius:24, border:'1.5px solid #D1FAE5',
            boxShadow:'0 4px 20px rgba(27,67,50,0.09)',
            padding:'48px 40px', textAlign:'center', maxWidth:400,
            animation:'mlCardIn 0.5s ease both',
          }}>
            <p style={{ fontSize:52, marginBottom:16 }}>📚</p>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:28, fontWeight:700, color:'#111827', margin:'0 0 8px' }}>My Library</h1>
            <p style={{ fontSize:13, color:'#6B7280', marginBottom:24 }}>Sign in to see your borrowed books, reading progress, and recommendations.</p>
            <button type="button" onClick={() => navigate('/login')}
              style={{
                padding:'11px 28px', background:'#1B4332', color:'white',
                border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer',
                boxShadow:'0 4px 16px rgba(27,67,50,0.3)',
                transition:'all 0.2s ease',
              }}>
              Sign In
            </button>
          </div>
        </div>
      </>
    );
  }

  const heroStats = [
    { value: activeLoans.length,   label: 'Currently Reading', sub: null },
    { value: activeLoans.length,   label: 'Borrowed',          sub: dueSoon.length > 0 ? `${dueSoon.length} due soon` : null },
    { value: savedCount,            label: 'Saved Books',       sub: null },
    { value: returnedLoans.length,  label: 'Completed',         sub: null },
  ];

  return (
    <>
      <style>{ML_ANIMS}</style>
      <div style={{ padding:'24px 28px', minHeight:'100%', background:'#F7FBF8' }}>

        {/* Toast */}
        {returnMsg && (
          <div style={{
            marginBottom:16, padding:'12px 18px', borderRadius:12, fontSize:13,
            animation:'mlToastIn 0.35s ease both',
            background: returnMsg.includes('success') ? '#F0FDF4' : '#FEF2F2',
            color:       returnMsg.includes('success') ? '#166534'  : '#DC2626',
            border:`1px solid ${returnMsg.includes('success') ? '#BBF7D0' : '#FECACA'}`,
            fontWeight:600,
          }}>
            {returnMsg.includes('success') ? '✓ ' : '✕ '}{returnMsg}
          </div>
        )}

        {/* ── HERO BANNER ── */}
        <div style={{
          background:'linear-gradient(135deg, #071a0f 0%, #0e2318 15%, #1B4332 38%, #2D6A4F 62%, #1B4332 82%, #071a0f 100%)',
          backgroundSize:'300% 300%',
          animation:'mlHeroGrad 12s ease infinite',
          borderRadius:24, padding:'30px 36px',
          marginBottom:26, position:'relative', overflow:'hidden',
        }}>
          <FloatingLeaves />

          {/* Decorative glows */}
          <div style={{ position:'absolute', right:-50, top:-50, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(82,183,136,0.1) 0%, transparent 68%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', left:-30, bottom:-40, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(82,183,136,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ animation:'mlHeroIn 0.6s ease both' }}>
              <p style={{ color:'rgba(209,250,229,0.6)', fontSize:11, margin:'0 0 6px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                Welcome back
              </p>
              <h1 style={{ color:'white', fontSize:29, fontWeight:700, fontFamily:'Georgia,serif', margin:'0 0 5px', lineHeight:1.2 }}>
                My Library
              </h1>
              <p style={{ color:'rgba(209,250,229,0.5)', fontSize:12, margin:0 }}>
                Your personal space to manage and track your reading journey.
              </p>
            </div>

            {/* Stat chips */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:22 }}>
              {heroStats.map((s, i) => (
                <div key={s.label} style={{
                  background:'rgba(255,255,255,0.07)',
                  backdropFilter:'blur(10px)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  borderRadius:14, padding:'13px 14px',
                  animation:`mlStatIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both`,
                  animationDelay:`${0.18 + i*0.09}s`,
                }}>
                  <p style={{
                    color:'white', fontSize:26, fontWeight:800,
                    fontFamily:'Georgia,serif', lineHeight:1, margin:'0 0 4px',
                    animation:`mlCountIn 0.5s ease both`,
                    animationDelay:`${0.42 + i*0.09}s`,
                  }}>{s.value}</p>
                  <p style={{ color:'rgba(209,250,229,0.65)', fontSize:10, fontWeight:500, margin:0 }}>{s.label}</p>
                  {s.sub && (
                    <p style={{ color:'#FCA5A5', fontSize:9, margin:'3px 0 0', fontWeight:600 }}>{s.sub}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN + SIDEBAR ── */}
        <div style={{ display:'flex', gap:24 }}>

          {/* ── Main column ── */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* Pill tab bar */}
            <div style={{
              background:'#EDF7F1', borderRadius:16,
              padding:5, display:'flex', gap:4, marginBottom:20,
              border:'1px solid #D1FAE5',
            }}>
              {TABS.map(t => {
                const count = t.id==='reading' ? activeLoans.length
                  : t.id==='saved'   ? savedCount
                  : t.id==='history' ? returnedLoans.length
                  : null;
                const active = tab === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setTab(t.id)}
                    style={{
                      flex:1, padding:'9px 6px', borderRadius:12,
                      fontSize:12, fontWeight:600, border:'none', cursor:'pointer',
                      transition:'all 0.26s cubic-bezier(0.34,1.56,0.64,1)',
                      background: active ? '#1B4332' : 'transparent',
                      color: active ? 'white' : '#3D6B50',
                      boxShadow: active ? '0 3px 12px rgba(27,67,50,0.28)' : 'none',
                      transform: active ? 'scale(1.015)' : 'scale(1)',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                    }}>
                    {t.label}
                    {count != null && count > 0 && (
                      <span style={{
                        background: active ? 'rgba(255,255,255,0.22)' : 'rgba(27,67,50,0.14)',
                        color: active ? 'white' : '#1B4332',
                        fontSize:9, fontWeight:800, borderRadius:99,
                        padding:'1px 6px', lineHeight:'15px',
                      }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab content ── */}
            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    height:128, borderRadius:20,
                    background:'linear-gradient(90deg,#F0FDF4 25%,#E8F5E9 50%,#F0FDF4 75%)',
                    backgroundSize:'400px 100%',
                    animation:`mlSkeletonShimmer 1.4s ease-in-out infinite`,
                    animationDelay:`${i*0.15}s`,
                  }}/>
                ))}
              </div>

            ) : tab === 'reading' ? (
              activeLoans.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 0', animation:'mlTabFade 0.4s ease both' }}>
                  <p style={{ fontSize:50, marginBottom:14 }}>📖</p>
                  <p style={{ fontWeight:700, fontSize:17, color:'#111827', marginBottom:6 }}>No active loans</p>
                  <p style={{ fontSize:13, color:'#6B7280', marginBottom:22 }}>Browse our collection and borrow a book to get started</p>
                  <button type="button" onClick={() => navigate('/books')}
                    style={{
                      padding:'11px 26px', background:'#1B4332', color:'white',
                      border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer',
                      boxShadow:'0 4px 16px rgba(27,67,50,0.3)',
                    }}>
                    Browse Books
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'mlTabFade 0.4s ease both' }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1B4332', margin:'0 0 4px', letterSpacing:'0.01em' }}>
                    Continue where you left off
                  </p>
                  {activeLoans.map((loan, idx) => (
                    <LoanCard key={loan.id} loan={loan} idx={idx} onReturn={handleReturn} returning={returning} />
                  ))}
                  <button type="button" onClick={() => navigate('/books')}
                    style={{
                      width:'100%', padding:'13px', borderRadius:14, fontSize:13,
                      fontWeight:600, color:'#1B4332',
                      background:'transparent', border:'1.5px solid #D1FAE5',
                      cursor:'pointer', marginTop:4,
                      transition:'all 0.2s ease',
                    }}>
                    View All Currently Reading
                  </button>
                </div>
              )

            ) : tab === 'history' ? (
              returnedLoans.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 0', animation:'mlTabFade 0.4s ease both' }}>
                  <p style={{ fontSize:44, marginBottom:12 }}>📋</p>
                  <p style={{ fontWeight:600, fontSize:15, color:'#111827' }}>No borrow history yet</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10, animation:'mlTabFade 0.4s ease both' }}>
                  {returnedLoans.map((loan, i) => (
                    <div key={loan.id} style={{
                      background:'white', borderRadius:16,
                      border:'1px solid #E5E7EB',
                      boxShadow:'0 1px 5px rgba(0,0,0,0.05)',
                      padding:'14px 16px', display:'flex', gap:14, alignItems:'center',
                      animation:`mlCardIn 0.4s ease both`,
                      animationDelay:`${i*0.07}s`,
                    }}>
                      <div style={{ width:50, height:70, flexShrink:0, borderRadius:10, overflow:'hidden', boxShadow:'0 3px 10px rgba(0,0,0,0.12)' }}>
                        {loan.cover_url
                          ? <img src={loan.cover_url} alt={loan.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          : <div style={{ width:'100%', height:'100%', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' }}>📚</div>
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontWeight:600, fontSize:14, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{loan.title ?? 'Untitled'}</p>
                        <p style={{ fontSize:12, color:'#6B7280', margin:'0 0 4px' }}>{loan.author}</p>
                        <p style={{ fontSize:11, color:'#9CA3AF' }}>
                          Borrowed {formatDate(loan.borrowed_at)} · Returned {formatDate(loan.returned_at)}
                        </p>
                      </div>
                      <span style={{
                        fontSize:10, fontWeight:700, padding:'3px 10px',
                        borderRadius:99, background:'#F0FDF4',
                        color:'#166534', border:'1px solid #BBF7D0', flexShrink:0,
                      }}>Returned</span>
                    </div>
                  ))}
                </div>
              )

            ) : tab === 'saved' ? (
              (() => {
                const favBooks = allBooks.filter(b => savedIds.includes(b.id));
                if (favBooks.length === 0) return (
                  <div style={{ textAlign:'center', padding:'60px 0', animation:'mlTabFade 0.4s ease both' }}>
                    <p style={{ fontSize:44, marginBottom:12 }}>❤️</p>
                    <p style={{ fontWeight:600, fontSize:15, color:'#111827', marginBottom:6 }}>No saved books yet</p>
                    <p style={{ fontSize:13, color:'#6B7280', marginBottom:22 }}>Tap the heart icon on any book to save it here</p>
                    <button type="button" onClick={() => navigate('/books')}
                      style={{ padding:'11px 26px', background:'#1B4332', color:'white', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(27,67,50,0.3)' }}>
                      Browse Books
                    </button>
                  </div>
                );
                return (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:14, animation:'mlTabFade 0.4s ease both' }}>
                    {favBooks.map((book, i) => (
                      <SavedBookCard key={book.id} book={book} idx={i} onUnsave={id => { toggleFavorite(id); setLocalTick(t => t + 1); }} />
                    ))}
                  </div>
                );
              })()

            ) : tab === 'list' ? (
              (() => {
                if (activeLoans.length === 0) return (
                  <div style={{ textAlign:'center', padding:'60px 0', animation:'mlTabFade 0.4s ease both' }}>
                    <p style={{ fontSize:44, marginBottom:12 }}>📋</p>
                    <p style={{ fontWeight:600, fontSize:15, color:'#111827', marginBottom:6 }}>Your reading list is empty</p>
                    <p style={{ fontSize:13, color:'#6B7280', marginBottom:22 }}>Books you borrow will appear here as your active reading list</p>
                    <button type="button" onClick={() => navigate('/books')}
                      style={{ padding:'11px 26px', background:'#1B4332', color:'white', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(27,67,50,0.3)' }}>
                      Browse Books
                    </button>
                  </div>
                );
                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:10, animation:'mlTabFade 0.4s ease both' }}>
                    <p style={{ fontSize:12, color:'#6B7280', margin:'0 0 8px' }}>Books you're currently working through</p>
                    {activeLoans.map((loan, i) => (
                      <div key={loan.id} style={{
                        background:'white', borderRadius:16,
                        border:'1px solid #E5E7EB', boxShadow:'0 1px 5px rgba(0,0,0,0.05)',
                        padding:'14px 16px', display:'flex', gap:14, alignItems:'center',
                        animation:`mlCardIn 0.4s ease both`, animationDelay:`${i*0.07}s`,
                      }}>
                        <span style={{ fontSize:18, fontWeight:800, color:'#D1D5DB', width:26, textAlign:'center', flexShrink:0 }}>{i+1}</span>
                        <div style={{ width:48, height:68, flexShrink:0, borderRadius:9, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                          {loan.cover_url
                            ? <img src={loan.cover_url} alt={loan.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                            : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1B4332,#2D6A4F)', display:'flex', alignItems:'center', justifyContent:'center' }}>📚</div>
                          }
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:700, fontSize:14, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{loan.title}</p>
                          <p style={{ fontSize:12, color:'#6B7280', margin:'0 0 8px' }}>{loan.author}</p>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, background:'#F0FDF4', borderRadius:99, height:6, overflow:'hidden' }}>
                              <div style={{
                                height:'100%', borderRadius:99,
                                background:'linear-gradient(90deg,#52B788,#1B4332)',
                                width:`${getProgressPct(loan.book_id,5)}%`,
                                animation:`mlProgressFill 0.9s ease-out both`,
                                animationDelay:`${i*0.07}s`,
                              }}/>
                            </div>
                            <span style={{ fontSize:10, fontWeight:800, color:'#1B4332', flexShrink:0 }}>{getProgressPct(loan.book_id,5)}%</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => navigate(`/books/${loan.book_id}/read`)}
                          style={{
                            padding:'7px 14px', fontSize:11, fontWeight:700,
                            background:'#1B4332', color:'white', border:'none',
                            borderRadius:10, cursor:'pointer', flexShrink:0,
                            boxShadow:'0 2px 8px rgba(27,67,50,0.25)',
                          }}>
                          Continue
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : null}
          </div>

          {/* ── Sidebar ── */}
          <aside style={{ width:260, flexShrink:0, display:'flex', flexDirection:'column', gap:16 }}>

            {/* Reading Goal */}
            {(() => {
              const rs = getReadingStats();
              const { timeStr, pctStr } = getReadingStatsDisplay(rs);
              return (
                <div style={{
                  background:'white', borderRadius:20,
                  border:'1.5px solid #D1FAE5',
                  boxShadow:'0 2px 12px rgba(27,67,50,0.07)',
                  padding:'20px',
                  animation:'mlSideIn 0.5s ease both', animationDelay:'0.1s',
                }}>
                  <h3 style={{ fontWeight:700, fontSize:13, color:'#111827', margin:'0 0 16px', display:'flex', alignItems:'center', gap:6 }}>
                    <span>🎯</span> Your Reading Goal
                  </h3>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <GoalRing pct={rs.goalPct} />
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:11, fontWeight:800, color:'#1B4332' }}>{pctStr}</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontWeight:800, fontSize:16, color:'#111827', margin:'0 0 3px' }}>
                        {rs.booksRead + rs.currentlyReading}{' '}
                        <span style={{ fontSize:11, fontWeight:500, color:'#6B7280' }}>Books</span>
                      </p>
                      <p style={{ fontSize:11, color:'#6B7280', margin:'0 0 3px' }}>{timeStr || '0m'} Total Reading</p>
                      <p style={{ fontSize:11, color:'#6B7280', margin:0, display:'flex', alignItems:'center', gap:3 }}>
                        {rs.streak > 0
                          ? <><span style={{ display:'inline-block', animation:'mlPulse 1s ease-in-out infinite' }}>🔥</span>{rs.streak} days in a row</>
                          : 'Start your streak!'
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:11, color:'#6B7280' }}>Goal: {rs.goalTarget} books</span>
                      <span style={{ fontSize:11, fontWeight:800, color:'#1B4332' }}>{rs.booksRead + rs.currentlyReading}/{rs.goalTarget}</span>
                    </div>
                    <div style={{ height:8, background:'#F0FDF4', borderRadius:99, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:99,
                        background:'linear-gradient(90deg,#52B788,#1B4332)',
                        width:`${Math.round(rs.goalPct * 100)}%`,
                        transition:'width 1s ease',
                      }}/>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Due Soon */}
            {activeLoans.length > 0 && (
              <div style={{
                background:'white', borderRadius:20,
                border:'1.5px solid #D1FAE5',
                boxShadow:'0 2px 12px rgba(27,67,50,0.07)',
                padding:'20px',
                animation:'mlSideIn 0.5s ease both', animationDelay:'0.2s',
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <h3 style={{ fontWeight:700, fontSize:13, color:'#111827', margin:0, display:'flex', alignItems:'center', gap:6 }}>
                    <span>⏰</span> Due Soon
                  </h3>
                  <button type="button" onClick={() => setTab('reading')}
                    style={{ fontSize:11, color:'#1B4332', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                    View all
                  </button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {(dueSoon.length > 0 ? dueSoon : activeLoans).slice(0,2).map(loan => {
                    const d = daysLeft(loan.due_at);
                    const urgent = d >= 0 && d <= 3;
                    return (
                      <div key={loan.id} style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width:40, height:56, flexShrink:0, borderRadius:8, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                          {loan.cover_url
                            ? <img src={loan.cover_url} alt={loan.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                            : <div style={{ width:'100%', height:'100%', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📚</div>
                          }
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{
                            fontWeight:600, fontSize:11, color:'#111827',
                            margin:'0 0 2px', lineHeight:1.3,
                            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                          }}>{loan.title}</p>
                          <p style={{ fontSize:10, color: urgent ? '#F59E0B' : '#6B7280', fontWeight: urgent ? 700 : 400, margin:0 }}>
                            {formatDate(loan.due_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {activeLoans.length > 2 && (
                    <p style={{ fontSize:11, color:'#9CA3AF', margin:0 }}>+ {activeLoans.length-2} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Recommended */}
            {recBooks.length > 0 && (
              <div style={{
                background:'white', borderRadius:20,
                border:'1.5px solid #D1FAE5',
                boxShadow:'0 2px 12px rgba(27,67,50,0.07)',
                padding:'20px',
                animation:'mlSideIn 0.5s ease both', animationDelay:'0.3s',
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <h3 style={{ fontWeight:700, fontSize:13, color:'#111827', margin:0, display:'flex', alignItems:'center', gap:6 }}>
                    <span>✨</span> Recommended For You
                  </h3>
                  <button type="button" onClick={() => navigate('/books')}
                    style={{ fontSize:11, color:'#1B4332', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                    View all
                  </button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {recBooks.map(book => (
                    <div key={book.id} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <div onClick={() => navigate(`/books/${book.id}`)} style={{ width:52, height:72, flexShrink:0, borderRadius:10, overflow:'hidden', cursor:'pointer', boxShadow:'0 3px 10px rgba(0,0,0,0.12)' }}>
                        {book.cover_url
                          ? <img src={book.cover_url} alt={book.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          : <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1B4332,#2D6A4F)' }}/>
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p onClick={() => navigate(`/books/${book.id}`)}
                          style={{ fontWeight:600, fontSize:11, color:'#111827', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer' }}>
                          {book.title}
                        </p>
                        <p style={{ fontSize:10, color:'#6B7280', margin:'0 0 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{book.author}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:6 }}>
                          {[1,2,3,4,5].map(i => (
                            <span key={i} style={{ fontSize:9, color: i <= Math.round(book.rating) ? '#F59E0B' : '#E5E7EB' }}>★</span>
                          ))}
                          <span style={{ fontSize:9, color:'#9CA3AF', marginLeft:2 }}>{book.rating.toFixed(1)}</span>
                        </div>
                        <button type="button" onClick={() => void handleBorrow(book.id)} disabled={borrowingId === book.id}
                          style={{
                            width:'100%', padding:'5px 0', fontSize:11, fontWeight:600,
                            background: borrowingId === book.id ? '#F3F4F6' : 'white',
                            color: borrowingId === book.id ? '#9CA3AF' : '#1B4332',
                            border:'1.5px solid #D1FAE5', borderRadius:8, cursor:'pointer',
                            transition:'all 0.2s ease',
                          }}>
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
      </div>
    </>
  );
}
