import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDownload, addLocalBorrow, apiErrorMessage, borrow, getBook, getReviews, isFavorite, isDownloaded, isLocallyBorrowed, listBooks, saveReview, toggleFavorite } from '../lib/api';
import type { Review } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

const BD_ANIMS = `
  @keyframes bdHeroGrad {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes bdCoverFloat {
    0%,100% { transform: translateY(0px) rotate(-1.5deg) scale(1); }
    50%      { transform: translateY(-18px) rotate(1.5deg) scale(1.02); }
  }
  @keyframes bdPageIn {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bdSlideLeft {
    from { opacity: 0; transform: translateX(-40px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes bdSlideRight {
    from { opacity: 0; transform: translateX(40px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes bdStatIn {
    0%  { opacity: 0; transform: translateY(20px) scale(0.86); }
    65% { transform: translateY(-4px) scale(1.05); }
    100%{ opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bdBarFill { from { width: 0%; } }
  @keyframes bdPulseDot {
    0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.8); }
    50%      { box-shadow: 0 0 0 12px rgba(74,222,128,0); }
  }
  @keyframes bdBadgePop {
    0%   { transform: scale(0.5) rotate(-12deg); opacity: 0; }
    70%  { transform: scale(1.12) rotate(3deg); }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
  @keyframes bdStarPop {
    0%   { transform: scale(0) rotate(-35deg); opacity: 0; }
    65%  { transform: scale(1.35) rotate(6deg); opacity: 1; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
  @keyframes bdScan {
    0%   { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
    20%  { opacity: 0.65; }
    80%  { opacity: 0.65; }
    100% { transform: translateX(260%) skewX(-20deg); opacity: 0; }
  }
  @keyframes bdShimmerBtn {
    0%   { background-position: -400% center; }
    100% { background-position:  400% center; }
  }
  @keyframes bdSuccessIn {
    0%   { opacity: 0; transform: scale(0.7) translateY(18px); }
    55%  { transform: scale(1.07) translateY(-4px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes bdRelatedIn {
    from { opacity: 0; transform: translateX(26px) scale(0.95); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes bdTabIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bdGlow {
    0%,100% { opacity: 0.35; transform: scale(1); }
    50%      { opacity: 0.65; transform: scale(1.18); }
  }
  @keyframes bdBtnGlow {
    0%,100% { box-shadow: 0 6px 32px rgba(27,67,50,0.5), 0 2px 12px rgba(0,0,0,0.2); }
    50%      { box-shadow: 0 14px 54px rgba(27,67,50,0.7), 0 2px 12px rgba(0,0,0,0.2); }
  }
  @keyframes bdRipple {
    0%   { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(5.5); opacity: 0; }
  }
  @keyframes bdOrbFloat {
    0%,100% { transform: translate(0,0) scale(1); opacity: 0.28; }
    33%      { transform: translate(30px,-24px) scale(1.12); opacity: 0.48; }
    66%      { transform: translate(-22px,16px) scale(0.9); opacity: 0.22; }
  }
  @keyframes bdOrbFloat2 {
    0%,100% { transform: translate(0,0) scale(1); opacity: 0.2; }
    40%      { transform: translate(-36px,-20px) scale(1.14); opacity: 0.38; }
    70%      { transform: translate(24px,18px) scale(0.88); opacity: 0.16; }
  }
  @keyframes bdConfetti {
    0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
    100% { transform: translate(var(--cx,0px),var(--cy,-110px)) rotate(var(--cr,540deg)) scale(0.3); opacity: 0; }
  }
  @keyframes bdPanelIn {
    from { opacity: 0; transform: translateX(32px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes bdCheckDraw {
    from { stroke-dashoffset: 60; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes bdSparkle {
    0%   { transform: scale(0) rotate(0deg); opacity: 1; }
    50%  { opacity: 1; }
    100% { transform: scale(2) rotate(200deg); opacity: 0; }
  }
  @keyframes bdPulseRing {
    0%   { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(2); opacity: 0; }
  }
  @keyframes bdSuccessBg {
    0%,100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes bdCoverGlow {
    0%,100% { filter: drop-shadow(0 24px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 24px rgba(82,183,136,0.18)); }
    50%      { filter: drop-shadow(0 32px 80px rgba(0,0,0,0.68)) drop-shadow(0 0 48px rgba(82,183,136,0.38)); }
  }
  @keyframes bdTitleReveal {
    from { opacity: 0; transform: translateY(24px); letter-spacing: 0.05em; }
    to   { opacity: 1; transform: translateY(0); letter-spacing: normal; }
  }
  @keyframes bdProgressLine {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes bdBorderPulse {
    0%,100% { border-color: rgba(82,183,136,0.35); }
    50%      { border-color: rgba(82,183,136,0.8); }
  }
  @keyframes bdCountIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function GlowOrbs() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {[
        { size:280, x:'8%',  y:'10%', delay:'0s',   dur:'8s'  },
        { size:180, x:'72%', y:'20%', delay:'2s',   dur:'11s' },
        { size:220, x:'40%', y:'60%', delay:'1.2s', dur:'9s'  },
        { size:150, x:'85%', y:'65%', delay:'3s',   dur:'13s' },
        { size:200, x:'20%', y:'75%', delay:'0.6s', dur:'10s' },
      ].map(({ size,x,y,delay,dur },i) => (
        <div key={i} style={{
          position:'absolute', left:x, top:y,
          width:size, height:size,
          background:'radial-gradient(circle, rgba(82,183,136,0.22) 0%, rgba(45,106,79,0.10) 50%, transparent 70%)',
          borderRadius:'50%',
          transform:'translate(-50%,-50%)',
          animation:`${i%2===0?'bdOrbFloat':'bdOrbFloat2'} ${dur} ease-in-out ${delay} infinite`,
        }} />
      ))}
    </div>
  );
}

function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = [
    { cx:-55, cy:-90,  cr:480, color:'#52B788', shape:'square' },
    { cx: 45, cy:-110, cr:-380, color:'#D4A96A', shape:'circle' },
    { cx: 80, cy:-75,  cr:320, color:'#86efac', shape:'square' },
    { cx:-80, cy:-95,  cr:-420, color:'#fff',   shape:'circle' },
    { cx: 20, cy:-120, cr:560, color:'#fbbf24', shape:'square' },
    { cx:-40, cy:-85,  cr:-300, color:'#a7f3d0', shape:'circle' },
    { cx: 65, cy:-105, cr:440, color:'#D4A96A', shape:'square' },
    { cx:-65, cy:-100, cr:-500, color:'#52B788', shape:'circle' },
  ];
  if (!active) return null;
  return (
    <div style={{ position:'absolute', top:'50%', left:'50%', pointerEvents:'none', zIndex:10 }}>
      {pieces.map((p,i) => (
        <div key={i} style={{
          position:'absolute', top:0, left:0,
          width: p.shape==='square' ? 8 : 10,
          height: p.shape==='square' ? 8 : 10,
          borderRadius: p.shape==='circle' ? '50%' : 2,
          background: p.color,
          animation:`bdConfetti 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${i*0.06}s both`,
          ['--cx' as string]: `${p.cx}px`,
          ['--cy' as string]: `${p.cy}px`,
          ['--cr' as string]: `${p.cr}deg`,
        }} />
      ))}
    </div>
  );
}

function Stars({ rating, size='sm', animate=false }: { rating:number; size?:'sm'|'md'|'lg'; animate?:boolean }) {
  const sz = size==='lg' ? 24 : size==='md' ? 19 : 14;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={sz} height={sz}
          fill={i<=Math.round(rating) ? '#F59E0B' : '#E5E7EB'}
          viewBox="0 0 20 20"
          style={animate ? { animation:`bdStarPop 0.45s ease both`, animationDelay:`${i*0.08}s` } : {}}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function ratingBreakdown(rating: number): number[] {
  const r = Math.min(5, Math.max(0, rating));
  if (r >= 4.5) return [68,22,7,2,1];
  if (r >= 4.0) return [52,30,12,4,2];
  if (r >= 3.5) return [35,35,20,7,3];
  if (r >= 3.0) return [25,30,25,12,8];
  return [15,20,25,25,15];
}

function formatDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function SmallBookCard({ book, index=0 }: { book:Book; index?:number }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink:0, width:115, cursor:'pointer',
        animation:'bdRelatedIn 0.45s ease both', animationDelay:`${index*0.07}s`,
      }}
    >
      <div style={{
        borderRadius:14, overflow:'hidden', paddingBottom:'150%', position:'relative',
        boxShadow: hovered ? '0 12px 32px rgba(27,67,50,0.28)' : '0 3px 12px rgba(0,0,0,0.10)',
        transform: hovered ? 'translateY(-7px) scale(1.02)' : 'translateY(0) scale(1)',
        transition:'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} loading="lazy" style={{
              position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition:'transform 0.45s ease',
            }} />
          : <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(135deg,#1B4332,#2D6A4F)',
              display:'flex', alignItems:'flex-end', padding:10,
            }}>
              <span style={{ color:'#fff', fontSize:10, lineHeight:1.3 }}>{book.title}</span>
            </div>
        }
        {hovered && (
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(to top, rgba(27,67,50,0.8) 0%, transparent 60%)',
          }} />
        )}
      </div>
      <p style={{ fontSize:11, fontWeight:700, color:'#1C1A16', marginTop:10, lineHeight:1.3, overflow:'hidden', maxHeight:32 }}>{book.title}</p>
      <p style={{ fontSize:10, color:'#8B7355', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{book.author}</p>
    </div>
  );
}

const SEED_REVIEWS = [
  { initials:'SJ', name:'Sarah J.',  color:'#1B4332', rating:5, time:'5 days ago',   text:"Absolutely captivating. Couldn't put it down — finished it in one sitting. The prose is beautiful and the plot twists are genuinely unexpected.", likes:24, comments:2 },
  { initials:'MK', name:'Marcus K.', color:'#5C3A1E', rating:4, time:'2 weeks ago',  text:'A masterpiece of its genre. Rich world-building and deeply complex characters make this a must-read. Highly recommended.', likes:18, comments:5 },
  { initials:'RP', name:'Rachel P.', color:'#2D6A4F', rating:5, time:'1 month ago',  text:"One of the best books I've read this year. The author has a gift for capturing human emotion in a way that feels deeply authentic.", likes:31, comments:3 },
];

const AVATAR_COLORS = ['#1B4332','#5C3A1E','#2D6A4F','#7C3AED','#B45309','#0369A1','#BE185D'];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h) + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function BookDetail() {
  const { id }     = useParams<{ id:string }>();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const borrowBtnRef = useRef<HTMLButtonElement>(null);

  const [book,            setBook]            = useState<Book|null>(null);
  const [related,         setRelated]         = useState<Book[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [borrowing,       setBorrowing]       = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [showConfetti,    setShowConfetti]     = useState(false);
  const [error,           setError]           = useState<string|null>(null);
  const [fav,             setFav]             = useState(false);
  const [downloaded,      setDownloaded]      = useState(false);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false);
  const [activeTab,       setActiveTab]       = useState<'about'|'details'|'reviews'>('about');
  const [ripple,          setRipple]          = useState(false);
  const [hoveredBtn,      setHoveredBtn]      = useState<string|null>(null);
  const [localReviews,    setLocalReviews]    = useState<Review[]>([]);
  const [reviewText,      setReviewText]      = useState('');
  const [reviewStars,     setReviewStars]     = useState(5);
  const [reviewHover,     setReviewHover]     = useState(0);
  const [reviewSaved,     setReviewSaved]     = useState(false);
  const [borrowToast,     setBorrowToast]     = useState(false);

  const loadBook = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await getBook(id);
      setBook(b);
      setLocalReviews(getReviews(b.id));
      setFav(isFavorite(b.id));
      setDownloaded(isDownloaded(b.id));
      setAlreadyBorrowed(isLocallyBorrowed(b.id));
      const all = await listBooks({ category: b.category });
      setRelated(all.filter(x => x.id !== b.id).slice(0, 6));
    } catch { navigate('/books'); }
    finally  { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { void loadBook(); }, [loadBook]);

  async function handleBorrow() {
    if (!book) return;
    setBorrowing(true); setError(null);
    setRipple(true);
    setTimeout(() => setRipple(false), 700);
    addLocalBorrow({ id:book.id, title:book.title, author:book.author, cover_url:book.cover_url, category:book.category, pages:book.pages });
    setAlreadyBorrowed(true);
    if (user) {
      try { await borrow(book.id); } catch (err) {
        const msg = apiErrorMessage(err);
        if (msg && !/unauth|sign|login/i.test(msg)) setError(msg);
      }
    }
    setSuccess(true); setBorrowing(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
    setBorrowToast(true);
    setTimeout(() => setBorrowToast(false), 5000);
  }

  function handleFavorite() {
    if (!book) return;
    const nowFav = toggleFavorite(book.id);
    setFav(nowFav);
    navigate('/favorites');
  }

  function handleDownload() {
    if (!book) return;
    addDownload({ id:book.id, title:book.title, author:book.author, cover_url:book.cover_url });
    setDownloaded(true);
    navigate('/downloads');
  }

  /* ── Loading skeleton ─────────────────────────── */
  if (loading) return (
    <div style={{ background:'#FAF7F2', minHeight:'100vh' }}>
      <div style={{
        height:320,
        background:'linear-gradient(135deg, #071a0f 0%, #1B4332 35%, #2D6A4F 65%, #1B4332 85%, #0d2419 100%)',
        opacity:0.75,
        animation:'bdPageIn 0.4s ease both',
      }} />
      <div style={{ padding:'32px 36px', display:'flex', gap:28 }}>
        <div style={{ flex:1 }}>
          {[0.55,0.35,0.9,0.7,0.5].map((w,i) => (
            <div key={i} style={{
              height:14+i*2, borderRadius:10, marginBottom:14,
              background:'linear-gradient(90deg,#E8DCC8 25%,#F5EDD8 50%,#E8DCC8 75%)',
              backgroundSize:'200% 100%',
              width:`${w*100}%`,
              animation:`bdShimmerBtn 1.6s ease ${i*0.15}s infinite`,
            }} />
          ))}
        </div>
        <div style={{ width:295, flexShrink:0 }}>
          <div style={{
            height:420, borderRadius:22,
            background:'linear-gradient(90deg,#E8DCC8 25%,#F5EDD8 50%,#E8DCC8 75%)',
            backgroundSize:'200% 100%',
            animation:'bdShimmerBtn 1.6s ease infinite',
          }} />
        </div>
      </div>
    </div>
  );
  if (!book) return null;

  const breakdown    = ratingBreakdown(book.rating);
  const totalRatings = 1284;
  const canBorrow    = !alreadyBorrowed && !success && book.available;

  function glassBtn(active: boolean, activeColor: string, hoverKey: string): React.CSSProperties {
    const isHov = hoveredBtn === hoverKey;
    return {
      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      padding:'11px 20px', borderRadius:14, fontSize:14, fontWeight:700, cursor:'pointer', border:'none',
      background: active
        ? `${activeColor}28`
        : isHov
          ? 'rgba(255,255,255,0.18)'
          : 'rgba(255,255,255,0.10)',
      outline: `1.5px solid ${active ? `${activeColor}55` : isHov ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)'}`,
      color: active ? activeColor : '#fff',
      backdropFilter:'blur(8px)',
      transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      transform: isHov ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: isHov ? '0 6px 20px rgba(0,0,0,0.18)' : 'none',
    };
  }

  function handleReviewSubmit() {
    if (!book || !reviewText.trim()) return;
    const name = user?.name ?? 'Anonymous Reader';
    const color = avatarColor(name);
    const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
    const review: Review = {
      id: `${Date.now()}`,
      bookId: book.id,
      userName: name,
      initials,
      color,
      rating: reviewStars,
      text: reviewText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    saveReview(review);
    setLocalReviews(getReviews(book.id));
    setReviewText('');
    setReviewStars(5);
    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 3000);
  }

  return (
    <>
      <style>{BD_ANIMS}</style>
      {borrowToast && (
        <div style={{
          position:'fixed', bottom:28, right:28, zIndex:9999,
          background:'linear-gradient(135deg,#1B4332,#2D6A4F)',
          color:'white', padding:'14px 22px', borderRadius:16,
          boxShadow:'0 12px 40px rgba(27,67,50,0.45)',
          display:'flex', alignItems:'center', gap:10,
          fontSize:14, fontWeight:700,
          animation:'bdSuccessIn 0.4s ease both',
        }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          <div>
            <div>Borrowed successfully!</div>
            <div style={{ fontSize:11, fontWeight:500, opacity:0.75, marginTop:2 }}>Return by {formatDueDate()} · 14 days</div>
          </div>
        </div>
      )}
      <div style={{ background:'#FAF7F2', minHeight:'100vh', animation:'bdPageIn 0.5s ease both' }}>

        {/* ═══ HERO ══════════════════════════════════════════════════ */}
        <div style={{
          background:'linear-gradient(135deg, #060f08 0%, #0d1f14 18%, #1B4332 40%, #2D6A4F 62%, #1B4332 80%, #0a1a10 100%)',
          backgroundSize:'300% 300%',
          animation:'bdHeroGrad 14s ease infinite',
          padding:'32px 36px 48px',
          position:'relative', overflow:'hidden',
        }}>
          <GlowOrbs />

          {/* Light sweep */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(108deg, transparent 25%, rgba(82,183,136,0.07) 48%, rgba(212,169,106,0.04) 52%, transparent 75%)',
            animation:'bdScan 6s ease-in-out 0.8s infinite',
            pointerEvents:'none',
          }} />

          {/* Vignette */}
          <div style={{
            position:'absolute', inset:0,
            background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)',
            pointerEvents:'none',
          }} />

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            onMouseEnter={() => setHoveredBtn('back')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              display:'inline-flex', alignItems:'center', gap:7, marginBottom:28,
              background: hoveredBtn==='back' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
              border:'1.5px solid rgba(255,255,255,0.18)',
              borderRadius:10, padding:'7px 16px',
              color:'rgba(255,255,255,0.78)', fontSize:13, fontWeight:600, cursor:'pointer',
              backdropFilter:'blur(10px)', position:'relative', zIndex:1,
              transition:'all 0.22s ease',
              transform: hoveredBtn==='back' ? 'translateX(-3px)' : 'translateX(0)',
            }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          <div style={{ display:'flex', gap:40, alignItems:'flex-start', position:'relative', zIndex:1 }}>

            {/* Cover */}
            <div style={{
              width:215, flexShrink:0, position:'relative',
              animation:'bdSlideLeft 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
              animationDelay:'0.1s',
            }}>
              <div style={{
                position:'absolute', top:'40%', left:'50%',
                transform:'translate(-50%,-50%)',
                width:'160%', height:'60%',
                background:'radial-gradient(ellipse, rgba(82,183,136,0.42) 0%, transparent 70%)',
                animation:'bdGlow 3.5s ease-in-out infinite',
              }} />
              <div style={{
                animation:'bdCoverFloat 5.5s ease-in-out infinite, bdCoverGlow 4s ease-in-out infinite',
                position:'relative',
              }}>
                <div style={{ borderRadius:20, overflow:'hidden', paddingBottom:'150%', position:'relative' }}>
                  {book.cover_url
                    ? <img src={book.cover_url} alt={book.title} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover' }} />
                    : <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,#1B4332,#2D6A4F)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:72 }}>📚</div>
                  }
                  {/* Shine overlay */}
                  <div style={{
                    position:'absolute', top:0, left:0, width:'35%', bottom:0,
                    background:'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                    borderRadius:'20px 0 0 20px',
                    pointerEvents:'none',
                  }} />
                </div>
                {/* Book spine shadow */}
                <div style={{
                  position:'absolute', bottom:-6, left:'8%', right:'8%', height:12,
                  background:'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
                  filter:'blur(4px)',
                }} />
              </div>
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              {/* Badges */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
                {[book.category, 'eBook', book.available ? '✓ Available' : 'Waitlist'].map((label,i) => (
                  <span key={label} style={{
                    fontSize:11, fontWeight:700, padding:'5px 15px',
                    background: i===2 && book.available
                      ? 'rgba(74,222,128,0.18)'
                      : i===2
                        ? 'rgba(248,113,113,0.18)'
                        : 'rgba(255,255,255,0.10)',
                    color: i===2 && book.available ? '#86efac' : i===2 ? '#fca5a5' : '#D8F3DC',
                    borderRadius:999,
                    border:`1.5px solid ${i===2 && book.available ? 'rgba(74,222,128,0.32)' : i===2 ? 'rgba(248,113,113,0.32)' : 'rgba(255,255,255,0.20)'}`,
                    backdropFilter:'blur(6px)',
                    animation:'bdBadgePop 0.45s ease both', animationDelay:`${i*0.1}s`,
                  }}>{label}</span>
                ))}
              </div>

              <h1 style={{
                fontSize:42, fontWeight:900, color:'#fff', lineHeight:1.1,
                marginBottom:12, fontFamily:'Georgia,serif',
                textShadow:'0 3px 20px rgba(0,0,0,0.4)',
                animation:'bdTitleReveal 0.7s cubic-bezier(0.22,1,0.36,1) both', animationDelay:'0.15s',
              }}>{book.title}</h1>

              <p style={{
                fontSize:17, color:'#A7F3D0', marginBottom:18, fontStyle:'italic',
                animation:'bdPageIn 0.6s ease both', animationDelay:'0.28s',
              }}>
                by <span style={{ fontWeight:800, fontStyle:'normal', color:'#D8F3DC', fontSize:18 }}>{book.author}</span>
              </p>

              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, animation:'bdPageIn 0.55s ease both', animationDelay:'0.33s' }}>
                <Stars rating={book.rating} size="md" animate />
                <span style={{ fontWeight:800, color:'#fff', fontSize:18 }}>{book.rating.toFixed(1)}</span>
                <span style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>({(localReviews.length + SEED_REVIEWS.length).toLocaleString()} ratings)</span>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'5px 12px', borderRadius:8, marginLeft:6,
                  background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
                  color:'rgba(255,255,255,0.55)', fontSize:12, fontWeight:600,
                }}>
                  📄 {book.pages ? `${book.pages} pages` : 'N/A'}
                </span>
              </div>

              {/* Availability + pulse */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:10,
                padding:'9px 18px', borderRadius:12, marginBottom:28,
                background: book.available ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                border:`1.5px solid ${book.available ? 'rgba(74,222,128,0.32)' : 'rgba(248,113,113,0.32)'}`,
                animation:'bdBadgePop 0.45s ease both', animationDelay:'0.42s',
              }}>
                <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
                  <span style={{
                    position:'absolute', inset:0, borderRadius:'50%',
                    background: book.available ? '#4ade80' : '#f87171',
                    animation: book.available ? 'bdPulseDot 2s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{
                    position:'absolute', inset:-4, borderRadius:'50%',
                    border:`2px solid ${book.available ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
                    animation: book.available ? 'bdPulseRing 2s ease-in-out infinite' : 'none',
                  }} />
                </div>
                <span style={{ color: book.available ? '#86efac' : '#fca5a5', fontSize:14, fontWeight:700 }}>
                  {book.available ? 'Available to borrow now' : 'All copies checked out'}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', animation:'bdPageIn 0.55s ease both', animationDelay:'0.5s' }}>
                <button onClick={handleBorrow}
                  disabled={!canBorrow || borrowing}
                  onMouseEnter={() => canBorrow && setHoveredBtn('borrow-hero')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    display:'flex', alignItems:'center', gap:9, border:'none',
                    padding:'13px 28px', borderRadius:14,
                    fontSize:14, fontWeight:800, letterSpacing:'0.02em',
                    cursor: canBorrow ? 'pointer' : 'default',
                    background: alreadyBorrowed||success
                      ? 'rgba(74,222,128,0.2)'
                      : !book.available
                        ? 'rgba(255,255,255,0.08)'
                        : hoveredBtn==='borrow-hero'
                          ? 'linear-gradient(90deg,#1B4332 0%,#3DB077 35%,#52D499 50%,#3DB077 65%,#1B4332 100%)'
                          : 'linear-gradient(90deg,#1B4332 0%,#2D7A55 45%,#3A9E6E 50%,#2D7A55 55%,#1B4332 100%)',
                    backgroundSize: canBorrow ? '300% 100%' : 'auto',
                    animation: canBorrow ? 'bdShimmerBtn 2.5s linear infinite' : 'none',
                    color: alreadyBorrowed||success ? '#4ade80' : !book.available ? 'rgba(255,255,255,0.35)' : '#fff',
                    boxShadow: canBorrow
                      ? hoveredBtn==='borrow-hero'
                        ? '0 8px 32px rgba(27,67,50,0.6)'
                        : '0 5px 24px rgba(27,67,50,0.45)'
                      : 'none',
                    transform: hoveredBtn==='borrow-hero' ? 'translateY(-3px)' : 'translateY(0)',
                    transition:'transform 0.25s ease, box-shadow 0.25s ease',
                  }}>
                  {alreadyBorrowed||success
                    ? <><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Borrowed</>
                    : borrowing ? '⏳ Borrowing…' : '📖 Borrow Now'
                  }
                </button>

                <button
                  onClick={() => navigate(`/books/${book.id}/read`)}
                  onMouseEnter={() => setHoveredBtn('read-hero')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={glassBtn(false,'#fff','read-hero')}>
                  📖 Read Now
                </button>
                <button
                  onClick={handleFavorite}
                  onMouseEnter={() => setHoveredBtn('fav-hero')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={glassBtn(fav,'#fca5a5','fav-hero')}>
                  {fav ? '❤️ Favorited' : '♡ Favorite'}
                </button>
                <button
                  onClick={handleDownload}
                  onMouseEnter={() => setHoveredBtn('dl-hero')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={glassBtn(downloaded,'#86efac','dl-hero')}>
                  {downloaded ? '✓ Downloaded' : '⬇ Download'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ CONTENT ══════════════════════════════════════════════ */}
        <div style={{ display:'flex', gap:28, padding:'32px 36px', alignItems:'flex-start' }}>

          {/* ── Main column ─────────────────────────────────────── */}
          <div style={{ flex:1, minWidth:0, animation:'bdPageIn 0.55s ease both', animationDelay:'0.28s' }}>

            {/* Pill tabs */}
            <div style={{
              display:'flex', gap:4, padding:5, width:'fit-content', marginBottom:28,
              background:'#EDE0CC', borderRadius:16,
              boxShadow:'0 1px 8px rgba(0,0,0,0.06)',
            }}>
              {(['about','details','reviews'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding:'9px 24px', borderRadius:12, border:'none',
                  background: activeTab===tab ? '#fff' : 'transparent',
                  color: activeTab===tab ? '#1B4332' : '#7C6547',
                  fontWeight: activeTab===tab ? 800 : 600,
                  fontSize:13, cursor:'pointer',
                  boxShadow: activeTab===tab ? '0 2px 12px rgba(27,67,50,0.12)' : 'none',
                  transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: activeTab===tab ? 'scale(1.02)' : 'scale(1)',
                }}>
                  {tab==='about' ? '📖 About' : tab==='details' ? '📋 Details' : '⭐ Reviews'}
                </button>
              ))}
            </div>

            {/* ── About ── */}
            {activeTab==='about' && (
              <div style={{ animation:'bdTabIn 0.32s ease both' }}>
                <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, fontWeight:800, color:'#1C1A16', marginBottom:16 }}>About the Book</h2>
                <div style={{ fontSize:15.5, color:'#3D2B1F', lineHeight:1.88, marginBottom:30 }}>
                  {book.description.split('\n\n').map((p,i) => <p key={i} style={{ marginBottom:16 }}>{p}</p>)}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                  {[
                    { icon:'📄', label:'Pages',     value: book.pages ? String(book.pages) : '—' },
                    { icon:'🏷️', label:'Genre',     value: book.category },
                    { icon:'📅', label:'Published', value: book.published_year ? String(book.published_year) : '—' },
                    { icon:'🌐', label:'Language',  value:'English' },
                  ].map(({ icon,label,value },i) => (
                    <div
                      key={label}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 8px 24px rgba(27,67,50,0.12)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 8px rgba(27,67,50,0.05)'; }}
                      style={{
                        background:'#fff', borderRadius:18, border:'1.5px solid #E8DCC8',
                        padding:'18px 16px', textAlign:'center',
                        animation:'bdStatIn 0.45s ease both', animationDelay:`${i*0.09}s`,
                        boxShadow:'0 1px 8px rgba(27,67,50,0.05)',
                        transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                        cursor:'default',
                      }}>
                      <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
                      <div style={{ fontSize:10, color:'#A0876A', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:800 }}>{label}</div>
                      <div style={{ fontSize:16, fontWeight:800, color:'#1B4332', marginTop:5 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Details ── */}
            {activeTab==='details' && (
              <div style={{ animation:'bdTabIn 0.32s ease both' }}>
                <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, fontWeight:800, color:'#1C1A16', marginBottom:18 }}>Book Details</h2>
                <div style={{ background:'#fff', borderRadius:20, border:'1.5px solid #E8DCC8', overflow:'hidden', boxShadow:'0 2px 16px rgba(0,0,0,0.05)' }}>
                  {[
                    ['Title',          book.title],
                    ['Author',         book.author],
                    ['Genre',          book.category],
                    ['Pages',          book.pages ? `${book.pages} pages` : '—'],
                    ['Published Year', book.published_year ? String(book.published_year) : '—'],
                    ['ISBN',           book.isbn || '—'],
                    ['Format',         'eBook (EPUB)'],
                    ['Language',       'English'],
                    ['File Size',      '2.1 MB'],
                    ['Loan Period',    '14 days'],
                  ].map(([label,value],i) => (
                    <div key={label as string} style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'14px 24px',
                      background: i%2===0 ? '#fff' : '#FAF7F2',
                      borderBottom: i<9 ? '1px solid #F0E6D3' : 'none',
                      animation:'bdTabIn 0.32s ease both', animationDelay:`${i*0.04}s`,
                    }}>
                      <span style={{ color:'#7C6547', fontSize:13, fontWeight:600 }}>{label}</span>
                      <span style={{ color:'#1B4332', fontSize:14, fontWeight:700 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Reviews ── */}
            {activeTab==='reviews' && (
              <div style={{ animation:'bdTabIn 0.32s ease both' }}>
                <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, fontWeight:800, color:'#1C1A16', marginBottom:18 }}>Reader Reviews</h2>

                <div style={{
                  background:'#fff', borderRadius:20, border:'1.5px solid #E8DCC8',
                  padding:'24px 28px', marginBottom:18,
                  display:'flex', gap:32, alignItems:'center',
                  boxShadow:'0 2px 16px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontSize:60, fontWeight:900, color:'#1B4332', lineHeight:1, animation:'bdBadgePop 0.5s ease both', fontFamily:'Georgia,serif' }}>
                      {book.rating.toFixed(1)}
                    </div>
                    <Stars rating={book.rating} size="md" animate />
                    <div style={{ fontSize:11, color:'#A0876A', marginTop:7, fontWeight:600 }}>{(localReviews.length + SEED_REVIEWS.length).toLocaleString()} ratings</div>
                  </div>
                  <div style={{ flex:1 }}>
                    {[5,4,3,2,1].map((star,idx) => (
                      <div key={star} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                        <span style={{ fontSize:12, color:'#7C6547', width:18, fontWeight:700 }}>{star}★</span>
                        <div style={{ flex:1, background:'#EDE0CC', borderRadius:999, height:9, overflow:'hidden' }}>
                          <div style={{
                            height:'100%',
                            background:'linear-gradient(90deg,#52B788,#1B4332)',
                            borderRadius:999,
                            width:`${breakdown[idx]}%`,
                            animation:'bdBarFill 1s ease-out both',
                            animationDelay:`${0.1+idx*0.1}s`,
                          }} />
                        </div>
                        <span style={{ fontSize:12, color:'#A0876A', width:34, textAlign:'right', fontWeight:600 }}>
                          {Math.round(totalRatings*breakdown[idx]/100)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write a Review */}
                <div style={{
                  background:'#fff', borderRadius:18, border:'1.5px solid #D1FAE5',
                  padding:'20px 24px', marginBottom:18,
                  boxShadow:'0 2px 12px rgba(27,67,50,0.06)',
                  animation:'bdTabIn 0.32s ease both',
                }}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:'#1B4332', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
                    ✍️ Write a Review
                  </h3>
                  {/* Star picker */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                    <span style={{ fontSize:12, color:'#7C6547', fontWeight:600, marginRight:4 }}>Your rating:</span>
                    {[1,2,3,4,5].map(i => (
                      <button key={i} type="button"
                        title={['','Terrible','Poor','Okay','Good','Excellent'][i]}
                        onMouseEnter={() => setReviewHover(i)}
                        onMouseLeave={() => setReviewHover(0)}
                        onClick={() => setReviewStars(i)}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', lineHeight:1 }}
                      >
                        <svg width={22} height={22} fill={(reviewHover || reviewStars) >= i ? '#F59E0B' : '#E5E7EB'} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </button>
                    ))}
                    <span style={{ fontSize:12, color:'#A0876A', marginLeft:4 }}>
                      {['','Terrible','Poor','Okay','Good','Excellent'][reviewStars]}
                    </span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this book..."
                    rows={3}
                    style={{
                      width:'100%', padding:'10px 14px', borderRadius:10, fontSize:14,
                      border:'1.5px solid #E8DCC8', outline:'none', resize:'vertical',
                      fontFamily:'inherit', color:'#3D2B1F', boxSizing:'border-box',
                      lineHeight:1.6,
                    }}
                  />
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
                    <button type="button" onClick={handleReviewSubmit}
                      disabled={!reviewText.trim()}
                      style={{
                        padding:'9px 22px', borderRadius:10, border:'none', cursor: reviewText.trim() ? 'pointer' : 'default',
                        background: reviewText.trim() ? 'linear-gradient(135deg,#1B4332,#2D6A4F)' : '#E8DCC8',
                        color: reviewText.trim() ? 'white' : '#A0876A',
                        fontSize:13, fontWeight:700,
                        boxShadow: reviewText.trim() ? '0 4px 14px rgba(27,67,50,0.28)' : 'none',
                        transition:'all 0.2s',
                      }}
                    >Submit Review</button>
                    {reviewSaved && (
                      <span style={{ fontSize:13, color:'#2D6A4F', fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        Review saved!
                      </span>
                    )}
                  </div>
                </div>

                {/* User reviews first, then seed reviews */}
                {[
                  ...localReviews.map(r => ({ initials:r.initials, name:r.userName, color:r.color, rating:r.rating, time:r.date, text:r.text, likes:0, comments:0, isUser:true })),
                  ...SEED_REVIEWS.map(r => ({ ...r, isUser:false })),
                ].map(({ initials,name,color,rating,time,text,likes,comments,isUser },i) => (
                  <div key={`${name}-${i}`} style={{
                    background:'#fff', borderRadius:18,
                    border: isUser ? '1.5px solid #BBF7D0' : '1.5px solid #E8DCC8',
                    padding:'20px 24px', marginBottom:14,
                    boxShadow:'0 1px 10px rgba(0,0,0,0.04)',
                    animation:'bdTabIn 0.4s ease both', animationDelay:`${i*0.08}s`,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{
                        width:42, height:42, borderRadius:'50%',
                        background:`linear-gradient(135deg,${color},${color}88)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'#fff', fontSize:13, fontWeight:800, flexShrink:0,
                        boxShadow:`0 4px 12px ${color}44`,
                      }}>{initials}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:800, color:'#1C1A16' }}>{name}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <Stars rating={rating} size="sm" />
                          <span style={{ fontSize:11, color:'#A0876A', fontWeight:600 }}>{time}</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize:10, fontWeight:800, padding:'3px 11px',
                        background: isUser ? '#D1FAE5' : '#F0FDF4',
                        color: isUser ? '#1B4332' : '#2D6A4F',
                        borderRadius:999, border:'1.5px solid #BBF7D0',
                        letterSpacing:'0.04em',
                      }}>{isUser ? 'Your Review' : 'Verified'}</span>
                    </div>
                    <p style={{ fontSize:14, color:'#3D2B1F', lineHeight:1.75, marginBottom:12 }}>{text}</p>
                    {!isUser && (
                    <div style={{ display:'flex', gap:18 }}>
                      <button style={{ background:'none', border:'none', cursor:'pointer', color:'#A0876A', fontSize:13, padding:0, fontWeight:600 }}>👍 {likes}</button>
                      <button style={{ background:'none', border:'none', cursor:'pointer', color:'#A0876A', fontSize:13, padding:0, fontWeight:600 }}>💬 {comments}</button>
                    </div>
                    )}
                  </div>
                ))}

                <button
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#F0FDF4'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='#fff'; }}
                  style={{
                    width:'100%', padding:'14px', borderRadius:14,
                    background:'#fff', border:'2px solid #D1FAE5',
                    color:'#1B4332', fontWeight:700, fontSize:14, cursor:'pointer',
                    transition:'background 0.2s ease',
                  }}>See all {localReviews.length + SEED_REVIEWS.length} reviews →</button>
              </div>
            )}

            {/* Related books */}
            {related.length > 0 && (
              <div style={{ marginTop:40, animation:'bdPageIn 0.55s ease both', animationDelay:'0.5s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                  <h2 style={{ fontFamily:'Georgia,serif', fontSize:21, fontWeight:800, color:'#1C1A16', margin:0 }}>More in {book.category}</h2>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,#E8DCC8,transparent)' }} />
                </div>
                <div style={{ display:'flex', gap:18, overflowX:'auto', paddingBottom:10 }}>
                  {related.map((b,i) => <SmallBookCard key={b.id} book={b} index={i} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Borrow Panel ────────────────────────────────────── */}
          <div style={{ width:300, flexShrink:0, animation:'bdPanelIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay:'0.22s' }}>
            <div style={{
              background:'#fff',
              borderRadius:24, overflow:'hidden',
              border:'1.5px solid #E8DCC8',
              boxShadow:'0 8px 40px rgba(27,67,50,0.12), 0 2px 8px rgba(0,0,0,0.04)',
              position:'sticky', top:20,
            }}>

              {/* Panel header */}
              <div style={{
                background:'linear-gradient(135deg, #071a0f 0%, #1B4332 40%, #2D6A4F 80%, #1a3d2e 100%)',
                padding:'22px 24px 20px',
                position:'relative', overflow:'hidden',
              }}>
                {/* Orbs in header */}
                {[
                  { s:80, x:'80%', y:'20%', delay:'0s', dur:'7s' },
                  { s:60, x:'10%', y:'60%', delay:'1s', dur:'9s' },
                ].map(({ s,x,y,delay,dur },i) => (
                  <div key={i} style={{
                    position:'absolute', left:x, top:y, transform:'translate(-50%,-50%)',
                    width:s, height:s,
                    background:'radial-gradient(circle,rgba(82,183,136,0.25) 0%,transparent 70%)',
                    borderRadius:'50%',
                    animation:`${i%2===0?'bdOrbFloat':'bdOrbFloat2'} ${dur} ease-in-out ${delay} infinite`,
                    pointerEvents:'none',
                  }} />
                ))}
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:8, marginBottom:6,
                  }}>
                    <div style={{
                      width:28, height:28, borderRadius:8,
                      background:'rgba(255,255,255,0.12)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, border:'1px solid rgba(255,255,255,0.16)',
                    }}>📚</div>
                    <span style={{ color:'#A7F3D0', fontSize:11, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                      Borrow this Book
                    </span>
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.72)', fontSize:13, fontWeight:500 }}>
                    {book.available ? '● Available — no waitlist' : '○ All copies are checked out'}
                  </div>

                  {/* Loan period bar */}
                  {book.available && (
                    <div style={{ marginTop:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:600 }}>Today</span>
                        <span style={{ color:'#A7F3D0', fontSize:10, fontWeight:700 }}>14-day loan</span>
                        <span style={{ color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:600 }}>Due {formatDueDate()}</span>
                      </div>
                      <div style={{ height:4, background:'rgba(255,255,255,0.12)', borderRadius:999, overflow:'hidden' }}>
                        <div style={{
                          height:'100%',
                          background:'linear-gradient(90deg,#52B788,#D4A96A)',
                          borderRadius:999, width:'100%',
                          animation:'bdProgressLine 1.2s ease-out 0.6s both',
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel body */}
              <div style={{ padding:'22px 24px' }}>

                {/* Error */}
                {error && (
                  <div style={{
                    background:'#FFF5F5', color:'#C53030', border:'1.5px solid #FEB2B2',
                    borderRadius:12, padding:'11px 15px', marginBottom:16, fontSize:13, fontWeight:600,
                    animation:'bdPageIn 0.3s ease both',
                  }}>⚠️ {error}</div>
                )}

                {/* Success banner */}
                {success && (
                  <div style={{
                    background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
                    border:'1.5px solid #86EFAC',
                    borderRadius:14, padding:'14px 16px', marginBottom:16,
                    animation:'bdSuccessIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                    position:'relative', overflow:'hidden',
                  }}>
                    <ConfettiBurst active={showConfetti} />
                    <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
                      <div style={{
                        width:34, height:34, borderRadius:'50%',
                        background:'linear-gradient(135deg,#1B4332,#52B788)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        flexShrink:0, boxShadow:'0 4px 14px rgba(27,67,50,0.3)',
                      }}>
                        <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24"
                          style={{ animation:'bdCheckDraw 0.4s ease 0.2s both' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                            d="M5 13l4 4L19 7"
                            strokeDasharray="60" strokeDashoffset="0"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:800, color:'#1B4332' }}>Book Borrowed! 🎉</div>
                        <div style={{ fontSize:11, color:'#2D6A4F', marginTop:2 }}>Go to My Library to start reading.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main borrow button */}
                <div style={{ position:'relative', marginBottom:12 }}>
                  {ripple && (
                    <div style={{
                      position:'absolute', top:'50%', left:'50%',
                      width:40, height:40,
                      background:'rgba(82,183,136,0.5)',
                      borderRadius:'50%',
                      transform:'translate(-50%,-50%)',
                      animation:'bdRipple 0.7s ease-out both',
                      pointerEvents:'none',
                    }} />
                  )}
                  <button
                    ref={borrowBtnRef}
                    onClick={handleBorrow}
                    disabled={!canBorrow || borrowing}
                    onMouseEnter={() => canBorrow && setHoveredBtn('borrow-panel')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      width:'100%', padding:'15px 20px', borderRadius:16, border:'none',
                      fontSize:15, fontWeight:800, letterSpacing:'0.02em',
                      cursor: canBorrow ? 'pointer' : 'default',
                      position:'relative', overflow:'hidden',
                      background: alreadyBorrowed||success
                        ? 'linear-gradient(135deg,#F0FDF4,#DCFCE7)'
                        : !book.available
                          ? '#F5F0EA'
                          : 'linear-gradient(90deg,#0a1a10 0%,#1B4332 20%,#2D7A55 45%,#3DB577 50%,#2D7A55 55%,#1B4332 80%,#0a1a10 100%)',
                      backgroundSize: canBorrow ? '300% 100%' : 'auto',
                      animation: canBorrow ? 'bdShimmerBtn 2.2s linear infinite' : 'none',
                      color: alreadyBorrowed||success ? '#15803D' : !book.available ? '#A0876A' : '#fff',
                      boxShadow: canBorrow
                        ? hoveredBtn==='borrow-panel'
                          ? '0 10px 40px rgba(27,67,50,0.55)'
                          : '0 6px 28px rgba(27,67,50,0.4), 0 0 0 1px rgba(82,183,136,0.2)'
                        : 'none',
                      transform: hoveredBtn==='borrow-panel' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
                      transition:'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                    }}>
                    <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      {alreadyBorrowed||success ? (
                        <>
                          <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>
                          Currently Borrowed
                        </>
                      ) : borrowing ? (
                        <>⏳ Borrowing…</>
                      ) : (
                        <>
                          📖 Borrow Now
                          {hoveredBtn==='borrow-panel' && (
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              style={{ animation:'bdSlideRight 0.2s ease both' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                            </svg>
                          )}
                        </>
                      )}
                    </span>
                    {/* Shine overlay */}
                    {canBorrow && (
                      <div style={{
                        position:'absolute', top:0, left:0, right:0, height:'50%',
                        background:'linear-gradient(to bottom,rgba(255,255,255,0.08),transparent)',
                        borderRadius:'16px 16px 0 0',
                        pointerEvents:'none',
                      }} />
                    )}
                  </button>
                </div>

                {/* Read Now */}
                <button
                  onClick={() => navigate(`/books/${book.id}/read`)}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#F0FDF4'; (e.currentTarget as HTMLButtonElement).style.borderColor='#86EFAC'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='#FAF7F2'; (e.currentTarget as HTMLButtonElement).style.borderColor='#E8DCC8'; }}
                  style={{
                    width:'100%', padding:'12px', borderRadius:14,
                    background:'#FAF7F2', border:'2px solid #E8DCC8',
                    color:'#1B4332', fontWeight:700, fontSize:14, cursor:'pointer',
                    marginBottom:10, transition:'all 0.22s ease',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                  }}>
                  📖 Read Now
                </button>

                {/* Fav + Download */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <button
                    onClick={handleFavorite}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform='scale(1.04)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='scale(1)'; }}
                    style={{
                      padding:'11px 8px', borderRadius:12, cursor:'pointer',
                      background: fav ? '#FFF5F5' : '#FAF7F2',
                      border:`2px solid ${fav ? '#FECACA' : '#E8DCC8'}`,
                      color: fav ? '#DC2626' : '#7C6547',
                      fontWeight:700, fontSize:12, transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                    }}>
                    {fav ? '❤️ Saved' : '♡ Favorite'}
                  </button>
                  <button
                    onClick={handleDownload}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform='scale(1.04)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='scale(1)'; }}
                    style={{
                      padding:'11px 8px', borderRadius:12, cursor:'pointer',
                      background: downloaded ? '#F0FDF4' : '#FAF7F2',
                      border:`2px solid ${downloaded ? '#BBF7D0' : '#E8DCC8'}`,
                      color: downloaded ? '#15803D' : '#7C6547',
                      fontWeight:700, fontSize:12, transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                    }}>
                    {downloaded ? '✓ Saved' : '⬇ Download'}
                  </button>
                </div>
              </div>

              {/* Loan details */}
              <div style={{ borderTop:'1.5px solid #F0E6D3', padding:'20px 24px', background:'#FAF7F2' }}>
                <div style={{
                  fontSize:10, color:'#A0876A', fontWeight:800,
                  textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16,
                  display:'flex', alignItems:'center', gap:8,
                }}>
                  <div style={{ flex:1, height:1, background:'linear-gradient(90deg,#E8DCC8,transparent)' }} />
                  Loan Details
                  <div style={{ flex:1, height:1, background:'linear-gradient(270deg,#E8DCC8,transparent)' }} />
                </div>

                {[
                  { icon:'⏱', label:'Loan Period', value:'14 days',        bg:'#F0FDF4', ic:'#2D6A4F' },
                  { icon:'📅', label:'Due Date',    value:formatDueDate(), bg:'#FFF7ED', ic:'#C2711D' },
                  { icon:'📄', label:'Format',      value:'eBook · 2.1 MB', bg:'#EFF6FF', ic:'#1D4ED8' },
                ].map(({ icon,label,value,bg,ic },i) => (
                  <div key={label} style={{
                    display:'flex', alignItems:'center', gap:13, marginBottom:13,
                    animation:'bdCountIn 0.4s ease both', animationDelay:`${0.3+i*0.09}s`,
                  }}>
                    <div style={{
                      width:38, height:38, background:bg, borderRadius:12,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18, flexShrink:0,
                      border:`1.5px solid ${ic}22`,
                    }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:11, color:'#A0876A', fontWeight:600, letterSpacing:'0.03em' }}>{label}</div>
                      <div style={{ fontSize:14, fontWeight:800, color:'#1C1A16', marginTop:1 }}>{value}</div>
                    </div>
                  </div>
                ))}

                <div style={{
                  background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)',
                  borderRadius:12, padding:'11px 14px',
                  fontSize:12, color:'#2D6A4F', lineHeight:1.6,
                  border:'1.5px solid #BBF7D0',
                  display:'flex', gap:8, alignItems:'flex-start',
                  animation:'bdCountIn 0.4s ease both', animationDelay:'0.6s',
                }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>ℹ️</span>
                  <span style={{ fontWeight:600 }}>You can renew this book for free if no one else is on the waitlist.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
