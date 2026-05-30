import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLocalBorrow, borrow, getFavoriteIds, getLocalBorrowed, listBooks, listCategories, readCached, writeCached } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';
import { VintageBookCover } from '../components/VintageBookCover';

const ANIMS = `
@keyframes catHeroGrad {
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
@keyframes catParticle {
  0%{transform:translateY(0px) translateX(0px) scale(1);opacity:0.6}
  33%{transform:translateY(-28px) translateX(14px) scale(1.2);opacity:1}
  66%{transform:translateY(-12px) translateX(-9px) scale(0.8);opacity:0.4}
  100%{transform:translateY(0px) translateX(0px) scale(1);opacity:0.6}
}
@keyframes catCardIn {
  0%{opacity:0;transform:translateY(24px) scale(0.96)}
  100%{opacity:1;transform:translateY(0) scale(1)}
}
@keyframes catBadgeIn {
  0%{opacity:0;transform:scale(0.75) translateY(8px)}
  60%{transform:scale(1.06) translateY(-2px)}
  100%{opacity:1;transform:scale(1) translateY(0)}
}
@keyframes catFeatIn {
  0%{opacity:0;transform:translateX(28px)}
  100%{opacity:1;transform:translateX(0)}
}
@keyframes catFloatBook {
  0%,100%{transform:translateY(0px) rotate(-1deg)}
  50%{transform:translateY(-7px) rotate(1deg)}
}
@keyframes catScan {
  0%{transform:translateY(-100%)}
  100%{transform:translateY(500%)}
}
@keyframes catPulse {
  0%,100%{opacity:0.5;transform:scale(1)}
  50%{opacity:1;transform:scale(1.18)}
}
@keyframes catShimmer {
  0%{transform:translateX(-100%)}
  100%{transform:translateX(250%)}
}
@keyframes catReveal {
  0%{opacity:0;transform:translateY(16px)}
  100%{opacity:1;transform:translateY(0)}
}
@keyframes catTrendIn {
  0%{opacity:0;transform:scale(0.85) translateY(6px)}
  100%{opacity:1;transform:scale(1) translateY(0)}
}
@keyframes catRingFill {
  from{stroke-dashoffset:176}
  to{stroke-dashoffset:0}
}
`;

/* ── Light-mode colour configs per category ── */
const CAT_CONFIGS: Record<string, {
  icon: string; bg: string; bgHover: string;
  border: string; text: string; sub: string; glow: string;
}> = {
  Classic:            { icon:'📚', bg:'linear-gradient(135deg,#ecfdf5,#d1fae5)', bgHover:'linear-gradient(135deg,#d1fae5,#a7f3d0)', border:'#34d399', text:'#065f46', sub:'#059669', glow:'#34d399' },
  Fantasy:            { icon:'✨', bg:'linear-gradient(135deg,#eef2ff,#e0e7ff)', bgHover:'linear-gradient(135deg,#e0e7ff,#c7d2fe)', border:'#818cf8', text:'#3730a3', sub:'#6366f1', glow:'#818cf8' },
  Dystopian:          { icon:'⚡', bg:'linear-gradient(135deg,#fff1f2,#ffe4e6)', bgHover:'linear-gradient(135deg,#ffe4e6,#fecdd3)', border:'#fb7185', text:'#9f1239', sub:'#e11d48', glow:'#fb7185' },
  Fiction:            { icon:'💡', bg:'linear-gradient(135deg,#fffbeb,#fef3c7)', bgHover:'linear-gradient(135deg,#fef3c7,#fde68a)', border:'#fbbf24', text:'#92400e', sub:'#d97706', glow:'#fbbf24' },
  'Science Fiction':  { icon:'🚀', bg:'linear-gradient(135deg,#eff6ff,#dbeafe)', bgHover:'linear-gradient(135deg,#dbeafe,#bfdbfe)', border:'#60a5fa', text:'#1e3a8a', sub:'#2563eb', glow:'#60a5fa' },
  Romance:            { icon:'💕', bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', bgHover:'linear-gradient(135deg,#fce7f3,#fbcfe8)', border:'#f472b6', text:'#831843', sub:'#db2777', glow:'#f472b6' },
  Science:            { icon:'🔬', bg:'linear-gradient(135deg,#f0fdfa,#ccfbf1)', bgHover:'linear-gradient(135deg,#ccfbf1,#99f6e4)', border:'#2dd4bf', text:'#134e4a', sub:'#0d9488', glow:'#2dd4bf' },
  'Self-Help':        { icon:'🌱', bg:'linear-gradient(135deg,#f0fdf4,#dcfce7)', bgHover:'linear-gradient(135deg,#dcfce7,#bbf7d0)', border:'#4ade80', text:'#14532d', sub:'#16a34a', glow:'#4ade80' },
  'Historical Fiction':{ icon:'🏛️',bg:'linear-gradient(135deg,#fffbeb,#fef3c7)', bgHover:'linear-gradient(135deg,#fef3c7,#fde68a)', border:'#f59e0b', text:'#78350f', sub:'#b45309', glow:'#f59e0b' },
  Memoir:             { icon:'📝', bg:'linear-gradient(135deg,#f5f3ff,#ede9fe)', bgHover:'linear-gradient(135deg,#ede9fe,#ddd6fe)', border:'#a78bfa', text:'#4c1d95', sub:'#7c3aed', glow:'#a78bfa' },
  'Non-Fiction':      { icon:'🧠', bg:'linear-gradient(135deg,#f8fafc,#f1f5f9)', bgHover:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', border:'#94a3b8', text:'#0f172a', sub:'#475569', glow:'#94a3b8' },
  Horror:             { icon:'💀', bg:'linear-gradient(135deg,#fef2f2,#fee2e2)', bgHover:'linear-gradient(135deg,#fee2e2,#fecaca)', border:'#f87171', text:'#7f1d1d', sub:'#b91c1c', glow:'#f87171' },
};
const DEFAULT_CFG = { icon:'📖', bg:'linear-gradient(135deg,#eff6ff,#dbeafe)', bgHover:'linear-gradient(135deg,#dbeafe,#bfdbfe)', border:'#60a5fa', text:'#1e3a8a', sub:'#2563eb', glow:'#60a5fa' };

const FEATURED_COLS = [
  { emoji:'🏆', title:'Award Winners',        sub:'Curated reads',        bg:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'#fbbf24', text:'#78350f' },
  { emoji:'🌱', title:'Books to Inspire You', sub:'Handpicked favorites', bg:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'#34d399', text:'#065f46' },
  { emoji:'📜', title:'Timeless Classics',    sub:'Enduring stories',     bg:'linear-gradient(135deg,#f5f3ff,#ede9fe)', border:'#a78bfa', text:'#4c1d95' },
  { emoji:'✨', title:'New Releases',          sub:'Fresh books',          bg:'linear-gradient(135deg,#fdf2f8,#fce7f3)', border:'#f472b6', text:'#831843' },
];

function computeTopCategories(books: Book[]) {
  const counts: Record<string, number> = {};
  books.forEach(b => { counts[b.category] = (counts[b.category] ?? 0) + 1; });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, reads: Math.round(count * (40 + Math.random() * 80)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function Particles() {
  const pts = [
    { size:5, x:'10%', y:'25%', delay:'0s',   dur:'4s',   color:'#34d399' },
    { size:4, x:'82%', y:'18%', delay:'0.7s',  dur:'5s',   color:'#818cf8' },
    { size:6, x:'55%', y:'58%', delay:'1.2s',  dur:'3.5s', color:'#f472b6' },
    { size:4, x:'28%', y:'72%', delay:'0.4s',  dur:'4.5s', color:'#60a5fa' },
    { size:5, x:'92%', y:'52%', delay:'1.8s',  dur:'3.8s', color:'#fbbf24' },
    { size:3, x:'18%', y:'45%', delay:'2.1s',  dur:'5.2s', color:'#2dd4bf' },
    { size:4, x:'70%', y:'78%', delay:'0.9s',  dur:'4.1s', color:'#a78bfa' },
    { size:5, x:'44%', y:'32%', delay:'1.5s',  dur:'3.2s', color:'#34d399' },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <div key={i} style={{
          position:'absolute', left:p.x, top:p.y,
          width:p.size, height:p.size, borderRadius:'50%',
          background:p.color, opacity:0.5,
          animation:`catParticle ${p.dur} ease-in-out infinite`,
          animationDelay:p.delay, pointerEvents:'none',
          boxShadow:`0 0 6px ${p.color}`,
        }} />
      ))}
    </>
  );
}

function CategoryCard({ name, count, idx }: { name:string; count:number; idx:number }) {
  const navigate = useNavigate();
  const cfg = CAT_CONFIGS[name] ?? DEFAULT_CFG;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => navigate(`/books?category=${encodeURIComponent(name)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? cfg.bgHover : cfg.bg,
        border: `1.5px solid ${hovered ? cfg.border : 'rgba(0,0,0,0.07)'}`,
        borderRadius: 16,
        padding: '22px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.13), 0 0 0 1.5px ${cfg.border}60`
          : '0 2px 8px rgba(0,0,0,0.06)',
        animation: `catCardIn 0.5s ease both`,
        animationDelay: `${idx * 0.07}s`,
        minHeight: 128,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Shimmer sweep */}
      {hovered && (
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', borderRadius:16 }}>
          <div style={{
            position:'absolute', top:0, left:'-60%', width:'35%', height:'100%',
            background:`linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)`,
            animation:'catShimmer 0.65s ease forwards',
          }} />
        </div>
      )}
      {/* Glow dot */}
      <div style={{
        position:'absolute', top:12, right:12, width:8, height:8, borderRadius:'50%',
        background: cfg.border,
        boxShadow:`0 0 ${hovered ? 10 : 4}px ${cfg.border}`,
        opacity: hovered ? 1 : 0.5,
        transition:'all 0.3s',
        animation:'catPulse 2.4s ease-in-out infinite',
      }} />

      <div style={{ fontSize:34, lineHeight:1 }}>{cfg.icon}</div>
      <div>
        <div style={{ fontWeight:800, fontSize:15, color:cfg.text, marginBottom:2, fontFamily:'DM Sans, sans-serif' }}>{name}</div>
        <div style={{ fontSize:12, color:cfg.sub, fontFamily:'DM Sans, sans-serif', opacity:0.8 }}>{count} {count===1?'book':'books'}</div>
        {/* Expanding accent bar */}
        <div style={{
          marginTop:10, height:2.5, borderRadius:2,
          background:`linear-gradient(90deg, ${cfg.border}, ${cfg.border}40)`,
          width: hovered ? '90%' : '28%',
          transition:'width 0.4s ease',
        }} />
      </div>
    </button>
  );
}

function TopBar({ name, count, reads, idx, total }: { name:string; count:number; reads:number; idx:number; total:number }) {
  const navigate = useNavigate();
  const cfg = CAT_CONFIGS[name] ?? DEFAULT_CFG;
  const pct = Math.max(12, Math.round((reads / total) * 100));
  const [hovered, setHovered] = useState(false);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 250 + idx * 130);
    return () => clearTimeout(t);
  }, [idx]);

  return (
    <button ref={ref} type="button"
      onClick={() => navigate(`/books?category=${encodeURIComponent(name)}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        textAlign:'left', padding:'10px 14px', borderRadius:10,
        background: hovered ? `${cfg.glow}12` : 'transparent',
        border:'none', cursor:'pointer', transition:'background 0.2s',
        animation:`catReveal 0.4s ease both`, animationDelay:`${idx * 0.09}s`,
      }}>
      <span style={{ fontWeight:800, fontSize:13, color:cfg.sub, width:18, textAlign:'right', fontFamily:'DM Sans, sans-serif' }}>{idx+1}</span>
      <span style={{ fontSize:16 }}>{cfg.icon}</span>
      <span style={{ flex:1, fontWeight:600, fontSize:13, color:'#1f2937', fontFamily:'DM Sans, sans-serif' }}>{name}</span>
      <div style={{ width:110, height:6, borderRadius:6, background:'#e5e7eb', overflow:'hidden', flexShrink:0 }}>
        <div style={{
          height:'100%', borderRadius:6,
          background:`linear-gradient(90deg, ${cfg.border}, ${cfg.sub})`,
          width: animated ? `${pct}%` : '0%',
          transition:'width 0.9s cubic-bezier(0.16,1,0.3,1)',
          boxShadow:`0 0 6px ${cfg.border}80`,
        }} />
      </div>
      <span style={{ fontSize:11, color:'#9ca3af', width:84, textAlign:'right', fontFamily:'DM Sans, sans-serif', lineHeight:1.4 }}>
        {count} {count===1?'book':'books'}<br/>{reads.toLocaleString()} reads
      </span>
    </button>
  );
}

function GoalRing({ pct }: { pct:number }) {
  const r = 28; const circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform:'rotate(-90deg)' }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="#059669" strokeWidth="7"
        strokeDasharray={`${pct * circ} ${circ - pct * circ}`} strokeLinecap="round"
        style={{ filter:'drop-shadow(0 0 4px #05966970)', transition:'stroke-dasharray 1.1s ease' }} />
    </svg>
  );
}

function Stars({ rating }: { rating:number }) {
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} style={{ width:12, height:12, color: i<=Math.round(rating) ? '#f59e0b' : '#e5e7eb' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Categories() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>(() => readCached<string[]>('categories:list') ?? []);
  const [books, setBooks] = useState<Book[]>(() => readCached<Book[]>('categories:books') ?? []);
  const [featured, setFeatured] = useState<Book | null>(() => readCached<Book | null>('categories:featured'));
  const [loading, setLoading] = useState(() => !readCached<Book[]>('categories:books'));
  const [borrowingId, setBorrowingId] = useState<number | null>(null);
  const [borrowedId, setBorrowedId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([listCategories(), listBooks()]).then(([cats, bks]) => {
      if (!alive) return;
      setCategories(cats); setBooks(bks); setFeatured(bks[0] ?? null);
      writeCached('categories:list', cats);
      writeCached('categories:books', bks);
      writeCached('categories:featured', bks[0] ?? null);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function handleBorrow(bookId: number) {
    setBorrowingId(bookId);
    const b = books.find(x => x.id === bookId);
    if (b) addLocalBorrow({ id:b.id, title:b.title, author:b.author, cover_url:b.cover_url, category:b.category, pages:b.pages });
    setBorrowedId(bookId);
    if (user) { try { await borrow(bookId); } catch { /* keep local */ } }
    setBorrowingId(null);
  }

  const catData = categories.map((cat, idx) => ({ name:cat, count:books.filter(b => b.category===cat).length, idx }));
  const topCategories = computeTopCategories(books);
  const maxReads = topCategories[0]?.reads ?? 1;
  const trendingTopics = categories.slice(0, 8);
  const favCount = getFavoriteIds().length;
  const borrowedCount = getLocalBorrowed().length;
  const goalPct = Math.min(1, (borrowedCount + favCount) / 16);

  return (
    <>
      <style>{ANIMS}</style>
      <div style={{ background:'#f8fafc', minHeight:'100vh', display:'flex', gap:24, padding:24, fontFamily:'DM Sans, sans-serif' }}>

        {/* ── Main ── */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Hero */}
          <div style={{
            position:'relative', borderRadius:20, overflow:'hidden', marginBottom:28,
            background:'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 35%, #fdf4ff 65%, #f0fdfa 100%)',
            backgroundSize:'400% 400%',
            animation:'catHeroGrad 14s ease infinite',
            padding:'34px 30px',
            border:'1.5px solid rgba(52,211,153,0.25)',
            boxShadow:'0 4px 24px rgba(52,211,153,0.1)',
          }}>
            <Particles />
            {/* scan line */}
            <div style={{
              position:'absolute', left:0, right:0, height:1.5,
              background:'linear-gradient(90deg, transparent, rgba(16,185,129,0.35), transparent)',
              animation:'catScan 3.5s linear infinite', top:0, pointerEvents:'none',
            }} />
            {/* Corner brackets */}
            {([{top:12,left:12},{top:12,right:12},{bottom:12,left:12},{bottom:12,right:12}] as React.CSSProperties[]).map((pos,i) => (
              <div key={i} style={{
                position:'absolute', ...pos, width:16, height:16,
                borderTop:    i<2  ? '2px solid rgba(16,185,129,0.45)' : 'none',
                borderBottom: i>=2 ? '2px solid rgba(16,185,129,0.45)' : 'none',
                borderLeft:   (i===0||i===2) ? '2px solid rgba(16,185,129,0.45)' : 'none',
                borderRight:  (i===1||i===3) ? '2px solid rgba(16,185,129,0.45)' : 'none',
              }} />
            ))}
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8, marginBottom:12,
                background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
                borderRadius:20, padding:'4px 14px',
              }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#059669', animation:'catPulse 1.8s ease-in-out infinite', boxShadow:'0 0 8px #05966980' }} />
                <span style={{ fontSize:11, fontWeight:700, color:'#059669', letterSpacing:'0.12em', textTransform:'uppercase' }}>Live Library</span>
              </div>
              <h1 style={{
                fontSize:34, fontWeight:800, color:'#0f172a', margin:0, lineHeight:1.15,
                fontFamily:'Fraunces, serif', animation:'catReveal 0.6s ease both',
              }}>
                Browse <span style={{ color:'#059669' }}>Categories</span>
              </h1>
              <p style={{ marginTop:8, color:'#6b7280', fontSize:14, animation:'catReveal 0.6s ease both', animationDelay:'0.15s' }}>
                {books.length} books across {categories.length} genres — find your next great read
              </p>
            </div>
          </div>

          {/* Category grid */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ height:128, borderRadius:16, background:'#f1f5f9', animation:`catPulse 1.5s ease-in-out ${i*0.1}s infinite` }} />
              ))}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
              {catData.map(({ name, count, idx }) => (
                <CategoryCard key={name} name={name} count={count} idx={idx} />
              ))}
            </div>
          )}

          {/* Featured Collections */}
          <section style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:'#0f172a', margin:0, fontFamily:'Fraunces, serif' }}>Featured Collections</h2>
              <button style={{ fontSize:12, color:'#059669', background:'none', border:'none', cursor:'pointer', fontWeight:600, letterSpacing:'0.04em' }}>
                View all →
              </button>
            </div>
            <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:4 }}>
              {FEATURED_COLS.map(({ emoji, title, sub, bg, border, text }, i) => {
                const [h, setH] = useState(false);
                return (
                  <div key={title}
                    onMouseEnter={() => setH(true)}
                    onMouseLeave={() => setH(false)}
                    style={{
                      flexShrink:0, width:180, height:118, padding:'18px 16px',
                      borderRadius:14,
                      border:`1.5px solid ${h ? border : 'rgba(0,0,0,0.08)'}`,
                      background: h ? bg.replace('135deg','145deg') : bg,
                      cursor:'pointer', position:'relative', overflow:'hidden',
                      transform: h ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)',
                      boxShadow: h ? `0 10px 30px rgba(0,0,0,0.12), 0 0 0 1.5px ${border}50` : '0 2px 8px rgba(0,0,0,0.06)',
                      transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                      display:'flex', flexDirection:'column', justifyContent:'space-between',
                      animation:`catBadgeIn 0.45s ease both`, animationDelay:`${i * 0.08}s`,
                    }}>
                    {h && (
                      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', borderRadius:14 }}>
                        <div style={{
                          position:'absolute', top:0, left:'-60%', width:'35%', height:'100%',
                          background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                          animation:'catShimmer 0.6s ease forwards',
                        }} />
                      </div>
                    )}
                    <div style={{ fontSize:28, lineHeight:1 }}>{emoji}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:text }}>{title}</div>
                      <div style={{ fontSize:11, color:text, opacity:0.55, marginTop:2 }}>{sub}</div>
                    </div>
                    <div style={{
                      position:'absolute', bottom:0, left:0, right:0, height:2.5,
                      background:`linear-gradient(90deg, ${border}, transparent)`,
                      opacity: h ? 1 : 0.35, transition:'opacity 0.3s',
                    }} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Top Categories + Trending */}
          <div style={{ display:'flex', gap:20 }}>

            {/* Top Categories This Month */}
            <section style={{ flex:1 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'#0f172a', marginBottom:14, fontFamily:'Fraunces, serif' }}>
                Top Categories This Month
              </h2>
              <div style={{
                background:'#ffffff', borderRadius:16,
                border:'1px solid #e5e7eb', padding:'6px 2px',
                boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
              }}>
                {topCategories.length === 0
                  ? <p style={{ color:'#9ca3af', fontSize:13, padding:'12px 16px' }}>No data yet.</p>
                  : topCategories.map(({ name, count, reads }, idx) => (
                    <TopBar key={name} name={name} count={count} reads={reads} idx={idx} total={maxReads} />
                  ))}
              </div>
            </section>

            {/* Trending + Stats */}
            <section style={{ flex:1 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'#0f172a', marginBottom:14, fontFamily:'Fraunces, serif' }}>
                Trending Topics
              </h2>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {trendingTopics.map((topic, i) => {
                  const cfg = CAT_CONFIGS[topic] ?? DEFAULT_CFG;
                  const [h, setH] = useState(false);
                  return (
                    <button key={topic} type="button"
                      onClick={() => navigate(`/books?category=${encodeURIComponent(topic)}`)}
                      onMouseEnter={() => setH(true)}
                      onMouseLeave={() => setH(false)}
                      style={{
                        padding:'7px 16px', borderRadius:30, fontSize:13, fontWeight:600,
                        border:`1.5px solid ${h ? cfg.border : '#e5e7eb'}`,
                        background: h ? cfg.bg : '#ffffff',
                        color: h ? cfg.text : '#374151',
                        cursor:'pointer', display:'flex', alignItems:'center', gap:6,
                        transition:'all 0.25s',
                        boxShadow: h ? `0 4px 14px ${cfg.border}30` : '0 1px 3px rgba(0,0,0,0.05)',
                        animation:`catTrendIn 0.4s ease both`, animationDelay:`${i * 0.06}s`,
                      }}>
                      <span style={{ fontSize:14 }}>{cfg.icon}</span>
                      {topic}
                    </button>
                  );
                })}
              </div>

              {/* Quick stats */}
              <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Total Books',    value:books.length,                          icon:'📚', color:'#059669', bg:'#ecfdf5' },
                  { label:'Categories',     value:categories.length,                     icon:'🗂️', color:'#7c3aed', bg:'#f5f3ff' },
                  { label:'Available Now',  value:books.filter(b => b.available).length, icon:'✅', color:'#16a34a', bg:'#f0fdf4' },
                  { label:'Your Borrowed',  value:borrowedCount,                         icon:'📖', color:'#d97706', bg:'#fffbeb' },
                ].map(({ label, value, icon, color, bg }, i) => (
                  <div key={label} style={{
                    background:bg, border:`1px solid ${color}25`,
                    borderRadius:12, padding:'12px 14px',
                    display:'flex', alignItems:'center', gap:10,
                    animation:`catBadgeIn 0.4s ease both`, animationDelay:`${0.3 + i * 0.07}s`,
                    boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    <span style={{ fontSize:20 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize:18, fontWeight:800, color, lineHeight:1 }}>{value}</div>
                      <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── Right panel ── */}
        <aside style={{ width:264, flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>

          {/* Featured Book */}
          {featured && (
            <div style={{
              background:'#ffffff', borderRadius:18,
              border:'1px solid #e5e7eb', padding:16,
              boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
              animation:'catFeatIn 0.5s ease both',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:10, fontWeight:800, color:'#059669', letterSpacing:'0.15em', textTransform:'uppercase' }}>Featured Book</span>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#059669', animation:'catPulse 2s ease-in-out infinite', boxShadow:'0 0 6px #05996980' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:14, cursor:'pointer', animation:'catFloatBook 5s ease-in-out infinite' }}
                onClick={() => navigate(`/books/${featured.id}`)}>
                <VintageBookCover title={featured.title} subtitle={featured.author} size="md" />
              </div>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#0f172a', margin:0, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {featured.title}
              </h3>
              <p style={{ fontSize:11, color:'#9ca3af', fontStyle:'italic', marginTop:3 }}>by {featured.author}</p>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                <Stars rating={featured.rating} />
                <span style={{ fontSize:11, color:'#9ca3af' }}>{featured.rating.toFixed(1)}</span>
              </div>
              <button
                onClick={() => void handleBorrow(featured.id)}
                disabled={borrowingId===featured.id || borrowedId===featured.id || !featured.available}
                style={{
                  marginTop:12, width:'100%', padding:'10px 0', borderRadius:10, fontSize:13,
                  fontWeight:700, border:'none',
                  cursor: featured.available ? 'pointer' : 'not-allowed',
                  background: borrowedId===featured.id ? '#d1fae5' : !featured.available ? '#f1f5f9' : 'linear-gradient(135deg, #059669, #047857)',
                  color: borrowedId===featured.id ? '#059669' : !featured.available ? '#9ca3af' : '#ffffff',
                  transition:'all 0.25s',
                  boxShadow: featured.available && borrowedId!==featured.id ? '0 4px 14px rgba(5,150,105,0.3)' : 'none',
                }}>
                {borrowedId===featured.id ? '✓ Borrowed' : borrowingId===featured.id ? 'Adding…' : 'Read Now 📖'}
              </button>
            </div>
          )}

          {/* Reading Stats */}
          <div style={{
            background:'#ffffff', borderRadius:18,
            border:'1px solid #e5e7eb', padding:16,
            boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
            animation:'catFeatIn 0.5s ease both', animationDelay:'0.1s',
          }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:14, letterSpacing:'0.04em' }}>Your Reading Stats</h3>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <GoalRing pct={goalPct} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:11, fontWeight:800, color:'#059669' }}>{Math.round(goalPct*100)}%</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', lineHeight:1 }}>
                  {borrowedCount} <span style={{ fontSize:12, fontWeight:400, color:'#9ca3af' }}>Borrowed</span>
                </div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>{favCount} favorites saved</div>
              </div>
            </div>
            <div style={{
              background:'#fffbeb', border:'1px solid #fde68a',
              borderRadius:8, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, marginBottom:12,
            }}>
              <span>🔥</span>
              <span style={{ fontSize:11, fontWeight:600, color:'#b45309' }}>Keep reading to build a streak!</span>
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:'#9ca3af' }}>Goal: 16 books / month</span>
                <span style={{ fontSize:11, fontWeight:700, color:'#059669' }}>{borrowedCount}/16</span>
              </div>
              <div style={{ height:5, borderRadius:5, background:'#e5e7eb', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:5,
                  background:'linear-gradient(90deg, #059669, #34d399)',
                  width:`${goalPct*100}%`,
                  boxShadow:'0 0 6px rgba(5,150,105,0.4)',
                  transition:'width 1.1s ease',
                }} />
              </div>
            </div>
          </div>

          {/* Explore by Mood */}
          <div style={{
            background:'#ffffff', borderRadius:18,
            border:'1px solid #e5e7eb', padding:16,
            boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
            animation:'catFeatIn 0.5s ease both', animationDelay:'0.18s',
          }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:12, letterSpacing:'0.04em' }}>Explore by Mood</h3>
            {[
              { mood:'Adventurous', cat:'Fantasy',     icon:'⚔️', color:'#6366f1', bg:'#eef2ff' },
              { mood:'Thoughtful',  cat:'Non-Fiction', icon:'🧠', color:'#475569', bg:'#f8fafc' },
              { mood:'Romantic',    cat:'Romance',     icon:'💕', color:'#db2777', bg:'#fdf2f8' },
              { mood:'Thrilled',    cat:'Dystopian',   icon:'⚡', color:'#e11d48', bg:'#fff1f2' },
            ].map(({ mood, cat, icon, color, bg }, i) => {
              const [h, setH] = useState(false);
              return (
                <button key={mood} type="button"
                  onClick={() => navigate(`/books?category=${encodeURIComponent(cat)}`)}
                  onMouseEnter={() => setH(true)}
                  onMouseLeave={() => setH(false)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:10,
                    padding:'8px 10px', borderRadius:8, border:'none',
                    background: h ? bg : 'transparent',
                    cursor:'pointer', marginBottom:4,
                    transition:'background 0.2s',
                    animation:`catReveal 0.4s ease both`, animationDelay:`${0.2+i*0.07}s`,
                  }}>
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontSize:12, fontWeight:600, color: h ? color : '#374151' }}>{mood}</div>
                    <div style={{ fontSize:10, color:'#9ca3af' }}>{cat}</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:11, color, opacity: h ? 1 : 0, transition:'opacity 0.2s' }}>→</div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
