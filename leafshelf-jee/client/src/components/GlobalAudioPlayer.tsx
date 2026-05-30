import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from '../lib/audioPlayer';
import type { Book } from '../lib/types';

// ── Helpers ────────────────────────────────────────────────────────────────
export function durationFromPages(pages: number): string {
  const h = Math.floor(pages / 40);
  const m = Math.round((pages % 40) * 1.5);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

const BOOK_SCRIPTS: Record<string, string[]> = {
  '1984': [
    "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
    "The Ministry of Truth — Minitrue, in Newspeak — was an enormous pyramidal structure of glittering white concrete, soaring three hundred metres into the air. From where Winston stood it was just possible to read, picked out on its white face in elegant lettering, the three slogans of the Party: WAR IS PEACE. FREEDOM IS SLAVERY. IGNORANCE IS STRENGTH.",
    "She had a bold, aquiline face, a woman of about thirty, not beautiful, but with a certain nobility of appearance. She was probably the same woman who shouted at him out of the telescreen. He did not know what had become of her.",
  ],
  'Brave New World': [
    "A squat grey building of only thirty-four storeys. Over the main entrance the words CENTRAL LONDON HATCHERY AND CONDITIONING CENTRE, and, in a shield, the World State's motto, COMMUNITY, IDENTITY, STABILITY.",
    "Outside, in the warm June sunshine, six or seven hundred little boys and girls were running with shrill yells over the lawns or playing ball games, or squatting silently in twos and threes among the flowering shrubs.",
  ],
  'Pride and Prejudice': [
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
    "Netherfield Park is let at last, said Mrs. Bennet to her husband one evening. Do you not want to know who has taken it? You want to tell me, and I have no objection to hearing it, replied Mr. Bennet.",
  ],
  'To Kill a Mockingbird': [
    "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed, and Jem's fears of never being able to play football were assuaged, he was seldom self-conscious about his injury.",
    "Maycomb was an old town, but it was a tired old town when I first knew it. In rainy weather the streets turned to red slop; grass grew on the sidewalks, the courthouse sagged in the square.",
  ],
  'The Great Gatsby': [
    "In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had.",
    "About halfway between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land. This is a valley of ashes.",
  ],
  'The Brothers Karamazov': [
    "Alexei Fyodorovitch Karamazov was the third son of Fyodor Pavlovitch Karamazov, a landowner well known in our district in his own day, and still remembered among us owing to his gloomy and tragic death, which happened thirteen years ago.",
  ],
  'Crime and Punishment': [
    "On an exceptionally hot evening early in July a young man came out of the garret in which he lodged in S. Place and walked slowly, as though in hesitation, towards K. bridge.",
  ],
};

function getChapterText(book: Book, chapter: number): string {
  const scripts = BOOK_SCRIPTS[book.title];
  if (scripts?.length) return `Chapter ${chapter + 1}. ${scripts[chapter % scripts.length]}`;
  return `Chapter ${chapter + 1} of ${book.title}, by ${book.author}. `
    + `The narrative continues with careful precision, each sentence drawing you deeper into the world ${book.author} has crafted. `
    + `Characters reveal themselves through action and dialogue, while themes of consequence, identity, and meaning weave quietly through every page.`;
}

// ── Waveform ─────────────────────────────────────────────────────────────
function Waveform({ small }: { small?: boolean }) {
  const bars = [14, 26, 18, 32, 22, 28, 16, 30, 20, 24];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: small ? 2 : 3, height: small ? 16 : 34 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: small ? 2.5 : 4, borderRadius: 2,
          background: `rgba(255,255,255,${0.22 + (i % 3) * 0.08})`,
          animation: `gapWave ${0.68 + i * 0.09}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.11}s`,
          height: small ? Math.round(h * 0.5) : h,
        }} />
      ))}
    </div>
  );
}

// ── Expand / Minimize SVG icons ───────────────────────────────────────────
function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
    </svg>
  );
}

const PLAYER_ANIMS = `
@keyframes gapWave{0%{transform:scaleY(0.35)}100%{transform:scaleY(1)}}
@keyframes gapFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes gapMiniIn{from{transform:translateY(90px) scale(0.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
`;

// ── Core player logic — stays mounted in both modes ───────────────────────
function AudioPlayerInner({ book }: { book: Book }) {
  const { isMini, setMini, setPlayerBook } = useAudioPlayer();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const TOTAL_SECS = Math.floor((book.pages ?? 300) * 90);
  const CHAPTERS = Math.max(3, Math.ceil((book.pages ?? 300) / 40));
  const chapter = Math.min(CHAPTERS - 1, Math.floor(progress * CHAPTERS));
  const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function speak(rate: number, ch: number) {
    window.speechSynthesis.cancel();
    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find(v => v.lang === 'en-US' && /google|natural|premium/i.test(v.name)) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en')) ||
        null;
      const u = new SpeechSynthesisUtterance(getChapterText(book, ch));
      u.rate = rate; u.volume = 1;
      if (voice) u.voice = voice;
      u.onend = () => setPlaying(false);
      window.speechSynthesis.speak(u);
    };
    if (window.speechSynthesis.getVoices().length > 0) trySpeak();
    else window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true });
  }

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + speed * 0.0004;
        if (next >= 1) { setPlaying(false); return 1; }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, speed]);

  useEffect(() => {
    if (!playing) { if (keepAliveRef.current) clearInterval(keepAliveRef.current); return; }
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 8000);
    return () => { if (keepAliveRef.current) clearInterval(keepAliveRef.current); };
  }, [playing]);

  useEffect(() => {
    if (playing) speak(speed, chapter);
    else window.speechSynthesis.pause();
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (playing) speak(speed, chapter);
  }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { return () => { window.speechSynthesis.cancel(); }; }, []);

  function handleClose() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPlayerBook(null);
    setMini(false);
  }

  const elapsed = Math.floor(progress * TOTAL_SECS);
  const remaining = TOTAL_SECS - elapsed;

  // ── Mini player (corner widget) ─────────────────────────────────────────
  if (isMini) {
    return (
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 400,
        width: 316, borderRadius: 18,
        background: 'linear-gradient(135deg,#0a1e12 0%,#1a4332 55%,#0f2318 100%)',
        border: '1px solid rgba(82,183,136,0.30)',
        boxShadow: '0 16px 50px rgba(0,0,0,0.60), 0 0 0 1px rgba(0,0,0,0.3)',
        animation: 'gapMiniIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        overflow: 'hidden',
      }}>
        {/* Thin progress strip at very top */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: 'linear-gradient(90deg,#52B788,#A7F3D0)', transition: 'width 0.1s linear' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px 11px' }}>
          {/* Cover thumbnail */}
          <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.45)' }}>
            {book.cover_url
              ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎧</div>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'white', margin: '0 0 3px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{book.title}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {playing
                ? <Waveform small />
                : <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>Paused</span>
              }
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginLeft: 2 }}>Ch {chapter + 1}/{CHAPTERS}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <button
              onClick={() => setPlaying(p => !p)}
              title={playing ? 'Pause' : 'Play'}
              style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#52B788,#2D6A4F)',
                color: 'white', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(27,67,50,0.55)',
                flexShrink: 0,
              }}
            >{playing ? '⏸' : '▶'}</button>

            <button
              onClick={() => setMini(false)}
              title="Expand player"
              style={{
                width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            ><ExpandIcon /></button>

            <button
              onClick={handleClose}
              title="Close player"
              style={{
                width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.42)', fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >✕</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Full player (modal overlay) ─────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'gapFadeUp 0.22s ease both',
      }}
      onClick={() => setMini(true)}
    >
      {/* "click outside to minimize" hint */}
      <p style={{
        position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
        fontSize: 11, color: 'rgba(255,255,255,0.32)', pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
      }}>
        <MinimizeIcon /> Click outside to minimize to corner
      </p>

      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg,#061510 0%,#0f2318 30%,#1B4332 70%,#0e2218 100%)',
        borderRadius: 28, width: '100%', maxWidth: 400, margin: '0 16px',
        padding: '32px 28px', position: 'relative',
        boxShadow: '0 50px 120px rgba(0,0,0,0.7)',
        border: '1px solid rgba(82,183,136,0.18)',
      }}>
        {/* Minimize button */}
        <button onClick={() => setMini(true)} title="Minimize to corner" style={{
          position: 'absolute', top: 14, right: 52,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
          width: 30, height: 30, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><MinimizeIcon /></button>

        {/* Close (fully stops) */}
        <button onClick={handleClose} title="Stop and close" style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
          width: 30, height: 30, borderRadius: '50%', fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {/* Cover art */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 144, height: 144, margin: '0 auto', borderRadius: 18,
            overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
            border: '2px solid rgba(255,255,255,0.07)',
          }}>
            {book.cover_url
              ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🎧</div>
            }
          </div>
        </div>

        {/* Track info */}
        <p style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>{book.title}</p>
        <p style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.48)' }}>{book.author}</p>
        <p style={{ textAlign: 'center', margin: '0 0 18px', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          Chapter {chapter + 1} of {CHAPTERS} · {durationFromPages(book.pages ?? 300)}
        </p>

        {/* Waveform */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, height: 34 }}>
          {playing
            ? <Waveform />
            : <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                {[14, 26, 18, 32, 22, 28, 16, 30, 20, 24].map((h, i) => (
                  <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
                ))}
              </div>
          }
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{ height: 4, background: 'rgba(255,255,255,0.10)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setProgress(p);
              if (playing) speak(speed, Math.min(CHAPTERS - 1, Math.floor(p * CHAPTERS)));
            }}
          >
            <div style={{ width: `${progress * 100}%`, height: '100%', background: 'linear-gradient(90deg,#52B788,#A7F3D0)', borderRadius: 2, transition: 'width 0.1s linear' }} />
            <div style={{
              position: 'absolute', top: '50%', left: `${progress * 100}%`,
              transform: 'translate(-50%,-50%)',
              width: 12, height: 12, borderRadius: '50%', background: '#A7F3D0',
              boxShadow: '0 0 10px rgba(167,243,208,0.7)',
              transition: 'left 0.1s linear',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>
            <span>{fmt(elapsed)}</span>
            <span>-{fmt(remaining)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 22 }}>
          <button
            onClick={() => setProgress(p => Math.max(0, p - 30 / TOTAL_SECS))}
            title="Back 30s"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: 6 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            <span style={{ fontSize: 9, letterSpacing: '0.03em' }}>30s</span>
          </button>

          <button
            onClick={() => setPlaying(p => !p)}
            style={{
              width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#52B788 0%,#2D6A4F 100%)',
              color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: playing
                ? '0 0 0 8px rgba(82,183,136,0.18), 0 8px 28px rgba(27,67,50,0.65)'
                : '0 8px 28px rgba(27,67,50,0.5)',
              transition: 'box-shadow 0.3s ease',
            }}
          >{playing ? '⏸' : '▶'}</button>

          <button
            onClick={() => setProgress(p => Math.min(1, p + 30 / TOTAL_SECS))}
            title="Forward 30s"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: 6 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18 14.5 12 6 6v12zm8-12v12h2V6h-2z"/></svg>
            <span style={{ fontSize: 9, letterSpacing: '0.03em' }}>30s</span>
          </button>
        </div>

        {/* Speed selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
          {SPEEDS.map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11,
              background: speed === s ? 'rgba(82,183,136,0.22)' : 'rgba(255,255,255,0.05)',
              color: speed === s ? '#A7F3D0' : 'rgba(255,255,255,0.32)',
              fontWeight: speed === s ? 700 : 400,
              transition: 'all 0.18s',
            }}>{s}x</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GlobalAudioPlayer() {
  const { playerBook } = useAudioPlayer();
  if (!playerBook) return null;
  return (
    <>
      <style>{PLAYER_ANIMS}</style>
      <AudioPlayerInner key={playerBook.id} book={playerBook} />
    </>
  );
}
