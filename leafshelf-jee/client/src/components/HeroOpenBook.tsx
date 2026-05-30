import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Leaf from './Leaf';

interface Props {
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DIM = {
  sm: { w: 100, h: 140, leaf: 18, title: 11, sub: 8 },
  md: { w: 170, h: 230, leaf: 32, title: 16, sub: 10 },
  lg: { w: 220, h: 300, leaf: 40, title: 20, sub: 12 },
};

export default function HeroOpenBook({ userName = 'Reader', size = 'md' }: Props) {
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dim = DIM[size];

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (open && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [open]);

  const containerW = open ? dim.w * 2 + 16 : dim.w;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        perspective: '1600px',
        width: containerW,
        height: dim.h,
        transition: 'width 0.85s cubic-bezier(0.55, 0.15, 0.25, 1)',
      }}
    >
      {/* Soft shadow underneath */}
      <div style={{
        position: 'absolute',
        bottom: -10,
        left: '50%',
        transform: 'translateX(-50%)',
        width: open ? dim.w * 1.8 : dim.w * 0.7,
        height: 14,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.4), transparent 70%)',
        filter: 'blur(8px)',
        transition: 'width 0.85s ease, opacity 0.85s ease',
        pointerEvents: 'none',
      }} />

      {/* Inside left page — visible when open */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: dim.w,
        height: dim.h,
        background: 'linear-gradient(135deg, #FBF7EE 0%, #F5EFD9 100%)',
        borderRadius: '6px 2px 2px 6px',
        boxShadow: 'inset -8px 0 12px -8px rgba(0,0,0,0.25)',
        opacity: open ? 1 : 0,
        transform: open ? 'translateZ(0)' : 'translateZ(-2px)',
        transition: 'opacity 0.4s ease 0.35s',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <Leaf className="w-12 h-12 mb-3" />
        <p style={{
          fontFamily: "'Playfair Display', serif",
          color: '#1B4332',
          fontWeight: 800,
          fontSize: dim.title,
          textAlign: 'center',
          letterSpacing: '0.02em',
          lineHeight: 1.25,
        }}>
          LeafShelf
        </p>
        <p style={{
          color: '#86796B',
          fontSize: dim.sub,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginTop: 4,
          textAlign: 'center',
        }}>Online Library</p>
        <div style={{
          marginTop: 14,
          width: '60%',
          height: 1,
          background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
        }} />
        <p style={{
          fontFamily: "'Playfair Display', serif",
          color: '#86796B',
          fontSize: dim.sub + 1,
          textAlign: 'center',
          marginTop: 12,
          fontStyle: 'italic',
          lineHeight: 1.4,
          padding: '0 4px',
        }}>
          "A reader lives a thousand lives before he dies."
        </p>
      </div>

      {/* Inside right page — visible when open */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: dim.w + 16,
        width: dim.w,
        height: dim.h,
        background: 'linear-gradient(135deg, #FBF7EE 0%, #F5EFD9 100%)',
        borderRadius: '2px 6px 6px 2px',
        boxShadow: 'inset 8px 0 12px -8px rgba(0,0,0,0.25)',
        opacity: open ? 1 : 0,
        transition: 'opacity 0.4s ease 0.45s',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: open ? 'auto' : 'none',
      }}>
        <p style={{
          color: '#86796B',
          fontSize: dim.sub,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>Welcome</p>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          color: '#1B4332',
          fontWeight: 800,
          fontSize: dim.title + 2,
          textAlign: 'center',
          marginTop: 6,
          lineHeight: 1.15,
        }}>
          {userName}
        </h3>
        <div style={{
          width: 30, height: 1, background: '#C9A84C', margin: '10px 0',
        }} />
        <p style={{
          color: '#3C2E22',
          fontSize: dim.sub + 1,
          textAlign: 'center',
          lineHeight: 1.45,
          padding: '0 4px',
        }}>
          Your next great read is waiting on the shelves.
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate('/books'); }}
          style={{
            marginTop: 14,
            background: '#1B4332',
            color: '#FBF7EE',
            border: 'none',
            borderRadius: 999,
            padding: '7px 14px',
            fontSize: dim.sub + 1,
            fontWeight: 700,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(27, 67, 50, 0.3)',
          }}
        >
          Enter the Library →
        </button>
      </div>

      {/* The book cover that flips */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label={open ? 'Close book' : 'Open book'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: dim.w,
          height: dim.h,
          padding: 0,
          border: 'none',
          background: 'transparent',
          transformStyle: 'preserve-3d',
          transformOrigin: 'left center',
          transform: open
            ? 'rotateY(-168deg) translateZ(0)'
            : hovering ? 'rotateY(-8deg)' : 'rotateY(0deg)',
          transition: 'transform 0.85s cubic-bezier(0.55, 0.15, 0.25, 1)',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        {/* Front of cover */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #1a3a10 0%, #2d5016 30%, #1f3812 50%, #2d5016 70%, #1a3a10 100%)',
          borderRadius: '2px 6px 6px 2px',
          border: '2px solid rgba(201, 168, 76, 0.4)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255, 230, 150, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
        }}>
          <div style={{
            position: 'absolute', inset: 8,
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 2,
            pointerEvents: 'none',
          }} />
          <Leaf className="mb-2" />
          <h4 style={{
            fontFamily: "'Playfair Display', serif",
            color: '#f5e9c0',
            fontWeight: 800,
            fontSize: dim.title,
            marginTop: 6,
            textAlign: 'center',
            textShadow: '0 0 8px rgba(201,168,76,0.4)',
            lineHeight: 1.2,
          }}>{userName}</h4>
          <p style={{
            color: 'rgba(201, 168, 76, 0.7)',
            fontSize: dim.sub,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginTop: 4,
            textAlign: 'center',
          }}>Reader</p>
          {!open && (
            <p style={{
              position: 'absolute',
              bottom: 10,
              fontSize: dim.sub - 1,
              color: 'rgba(245, 233, 192, 0.55)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>tap to open</p>
          )}
        </div>
        {/* Back of cover (inside front cover) — shown when open */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, #FBF7EE 0%, #EEDDB8 100%)',
          borderRadius: '6px 2px 2px 6px',
          boxShadow: 'inset 0 0 18px rgba(140, 110, 60, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
        }}>
          <div style={{
            position: 'absolute', inset: 8,
            border: '1px solid rgba(140,110,60,0.25)',
            borderRadius: 2,
            pointerEvents: 'none',
          }} />
          <p style={{
            color: '#86796B',
            fontSize: dim.sub,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>Ex libris</p>
          <Leaf className="w-10 h-10 my-3" />
          <p style={{
            fontFamily: "'Playfair Display', serif",
            color: '#1B4332',
            fontSize: dim.title - 1,
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: 1.3,
          }}>
            {userName}
          </p>
        </div>
      </button>
    </div>
  );
}
