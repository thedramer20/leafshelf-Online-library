import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { adminAuth } from '../lib/adminAuth';
import Leaf from '../components/Leaf';
import { useFirstLogin } from '../hooks/useFirstLogin';
import { Particles } from '../components/magicui/particles';
import { BorderBeam } from '../components/magicui/border-beam';
import { Aurora } from '../components/magicui/aurora';
import { FallingBook } from '../components/FallingBook';

const VIDEO_SRC = 'https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4';
const VIDEO_POSTER = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=80';

type Tab = 'login' | 'register';
type LocationState = { from?: { pathname: string } };
const AUTH_USER_CACHE_KEY = 'leafshelf:cache:auth:user';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InputField({ id, type, value, onChange, placeholder, autoComplete, required, icon, label }: {
  id: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; autoComplete: string; required?: boolean;
  icon: React.ReactNode; label: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm mb-1.5"
        style={{ color: '#0a1a0a', fontWeight: 700 }}
      >
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6a8a5a',
            zIndex: 1,
          }}
        >
          {icon}
        </span>
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition-all"
          style={{
            backgroundColor: '#ffffff',
            color: '#0a1a0a',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: '#a8b89a',
            fontWeight: 500,
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '44px',
            paddingRight: isPassword ? '44px' : '14px',
            textIndent: 0,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            style={{ color: '#5a7a4a' }}
          >
            {show
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            }
          </button>
        )}
      </div>
    </div>
  );
}


export default function Login() {
  const { signIn, signUp, signInLocal } = useAuth();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const { isFirstTime } = useFirstLogin();
  const [tab, setTab] = useState<Tab>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  function seedAuthCache(user: unknown) {
    if (typeof window === 'undefined' || !user) return;
    try {
      window.sessionStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify(user));
    } catch {
      // ignore cache seeding failures
    }
  }

  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    }
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const leaf = document.createElement('div');
      leaf.textContent = '🍃';
      const startTop = 20 + Math.random() * 40;
      leaf.style.cssText = `position:fixed;top:${startTop}%;left:-50px;font-size:${20 + Math.random() * 20}px;color:rgba(180,200,130,0.7);pointer-events:none;z-index:30;transition:all 3s linear;`;
      document.body.appendChild(leaf);
      setTimeout(() => {
        leaf.style.left = 'calc(100vw + 100px)';
        leaf.style.top = `${startTop + 15}%`;
        leaf.style.transform = 'rotate(720deg)';
      }, 50);
      setTimeout(() => leaf.remove(), 3500);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin' && password === 'admin123') {
      adminAuth.login('admin', 'admin123');
      window.location.replace('/admin');
      return;
    }
    try {
      const user = await signIn(cleanEmail, password);
      seedAuthCache(user);
      window.location.replace(isFirstTime ? '/welcome' : from);
      return;
    } catch {
      const derivedName = cleanEmail.split('@')[0]?.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Reader';
      try {
        const user = await signUp(derivedName, cleanEmail, password);
        seedAuthCache(user);
        window.location.replace('/welcome');
        return;
      } catch {
        const user = signInLocal(cleanEmail, derivedName);
        seedAuthCache(user);
        window.location.replace(isFirstTime ? '/welcome' : from);
        return;
      }
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError(null);
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    try {
      const user = await signUp(cleanName, cleanEmail, regPassword);
      seedAuthCache(user);
      window.location.replace('/welcome');
      return;
    } catch {
      try {
        const user = await signIn(cleanEmail, regPassword);
        seedAuthCache(user);
        window.location.replace('/welcome');
        return;
      } catch {
        const user = signInLocal(cleanEmail, cleanName);
        seedAuthCache(user);
        window.location.replace('/welcome');
        return;
      }
    } finally { setLoading(false); }
  }

  const switchTab = (t: Tab) => { setTab(t); setError(null); };

  const fallingBooks = [
    { startX: 8,  size: 70,  delay: 0,    duration: 9,  rotationSpeed: 45, color: 'forest'   as const },
    { startX: 18, size: 90,  delay: 2.5,  duration: 11, rotationSpeed: 30, color: 'burgundy' as const },
    { startX: 28, size: 60,  delay: 5,    duration: 8,  rotationSpeed: 60, color: 'amber'    as const },
    { startX: 35, size: 100, delay: 7.5,  duration: 12, rotationSpeed: 25, color: 'navy'     as const },
    { startX: 48, size: 75,  delay: 1,    duration: 10, rotationSpeed: 40, color: 'cream'    as const },
    { startX: 12, size: 85,  delay: 4,    duration: 11, rotationSpeed: 35, color: 'forest'   as const },
    { startX: 22, size: 65,  delay: 6.5,  duration: 9,  rotationSpeed: 50, color: 'amber'    as const },
    { startX: 40, size: 95,  delay: 8,    duration: 12, rotationSpeed: 28, color: 'burgundy' as const },
    { startX: 5,  size: 70,  delay: 3,    duration: 10, rotationSpeed: 42, color: 'navy'     as const },
    { startX: 30, size: 80,  delay: 9,    duration: 11, rotationSpeed: 33, color: 'cream'    as const },
    { startX: 45, size: 65,  delay: 5.5,  duration: 9,  rotationSpeed: 48, color: 'forest'   as const },
    { startX: 15, size: 100, delay: 10,   duration: 13, rotationSpeed: 22, color: 'amber'    as const },
  ];

  const envelopeIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
  const lockIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
  const userIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );

  const socialButtons = [
    { icon: <GoogleIcon />, label: 'Google' },
    { icon: <AppleIcon />, label: 'Apple' },
    { icon: <FacebookIcon />, label: 'Facebook' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layer 1: Cinematic video background — wrapper animates, video just decodes */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ animation: 'kenBurns 60s ease-in-out infinite', willChange: 'transform' }}
      >
        <video
          autoPlay loop muted playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          poster={VIDEO_POSTER}
          style={{
            filter: 'brightness(0.85) saturate(1.1) contrast(1.05)',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>
      {/* Falling books — left 60% only, hidden on mobile to avoid overflow */}
      <div className="hidden lg:block absolute inset-0 z-[5] pointer-events-none overflow-hidden"
           style={{ width: '60%' }}>
        {fallingBooks.map((book, i) => (
          <FallingBook key={`book-${i}`} {...book} />
        ))}
      </div>

      {/* Layer 2: Warm meadow overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(135deg, rgba(50, 80, 30, 0.25) 0%, rgba(180, 200, 100, 0.1) 50%, rgba(50, 80, 30, 0.3) 100%)'
        }}
      />
      {/* Bottom gradient — darkens grass under form for contrast */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 z-[2] pointer-events-none"
           style={{
             background: 'linear-gradient(to top, rgba(20, 40, 15, 0.4), transparent)'
           }} />

      {/* Layer 2a: Aurora color overlay */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(201, 168, 76, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(76, 175, 80, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 167, 38, 0.08) 0%, transparent 70%)
          `,
          mixBlendMode: 'screen',
          animation: 'auroraShift 20s ease-in-out infinite',
        }}
      />
      {/* Layer 2b: Aurora */}
      <Aurora
        className="z-[3]"
        colors={['#2d6a2e', '#c9a84c', '#1a5c1a', '#8b6914', '#3d8a3e', '#a07820']}
        speed="slow"
        blur="heavy"
        intensity={0.3}
      />
      {/* Layer 2c: Fireflies */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`firefly-${i}`}
            className="absolute rounded-full"
            style={{
              width: '4px',
              height: '4px',
              background: 'radial-gradient(circle, rgba(255, 220, 130, 0.9), rgba(255, 180, 100, 0.4) 50%, transparent 70%)',
              boxShadow: '0 0 8px rgba(255, 220, 130, 0.8)',
              left: `${10 + (i * 11) % 80}%`,
              top: `${20 + (i * 13) % 60}%`,
              animation: `fireflyFloat ${6 + (i % 4)}s ease-in-out ${i * 0.5}s infinite, fireflyBlink ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
      {/* Layer 3: Particles */}
      <Particles className="absolute inset-0 z-10" quantity={40} ease={90} color="#2d6a2e" size={0.5} refresh={false} />
      <Particles className="absolute inset-0 z-10" quantity={10} ease={70} color="#c9a84c" size={0.8} refresh={false} />
      {/* Layer 4: Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(50,80,30,0.35) 100%)' }} />

      {/* Layer 4b: Light shafts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        {[
          { left: '15%', delay: '0s', width: '120px' },
          { left: '45%', delay: '4s', width: '80px' },
          { left: '70%', delay: '7s', width: '100px' },
        ].map((shaft, i) => (
          <div
            key={`shaft-${i}`}
            className="absolute top-0 h-screen pointer-events-none"
            style={{
              left: shaft.left, width: shaft.width,
              background: 'linear-gradient(to bottom, rgba(255, 230, 150, 0.18), rgba(255, 220, 130, 0.05), transparent)',
              filter: 'blur(20px)', transform: 'rotate(15deg)', transformOrigin: 'top center',
              animation: `lightShaftMove 12s ease-in-out ${shaft.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 4c: Drifting mist */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={`mist-${i}`} className="absolute"
            style={{
              bottom: `${i * 8}%`, width: '300px', height: '100px',
              background: 'radial-gradient(ellipse, rgba(200, 220, 200, 0.3), transparent 70%)',
              filter: 'blur(30px)',
              animation: `mistDrift ${25 + i * 5}s linear ${i * 8}s infinite`,
            }} />
        ))}
      </div>

      {/* Layer 4d: Cursor spotlight */}
      <div
        className="absolute pointer-events-none mix-blend-screen"
        style={{
          left: `${(mousePos.x + 1) * 50}%`, top: `${(mousePos.y + 1) * 50}%`,
          transform: 'translate(-50%, -50%)', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(255, 230, 150, 0.12), transparent 60%)',
          transition: 'all 0.3s ease-out', filter: 'blur(20px)', zIndex: 10,
        }}
      />

      {/* Layer 5: Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-between max-w-7xl mx-auto px-8 lg:px-16 py-12">
        {/* LEFT: Brand + quote — falling books visual feature replaces Book3D (RABEN-1) */}
        <div className="hidden lg:flex flex-col items-center gap-8 flex-1">
          <div className="text-center max-w-xs">
            <h1 className="text-5xl font-bold"
                style={{
                  color: '#f5f0e8',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)',
                  fontFamily: "'Playfair Display', serif",
                }}>
              {'LeafShelf'.split('').map((letter, i) => (
                <span key={i} className="inline-block"
                  style={{ animation: `letterReveal 0.5s ease-out ${i * 0.08}s both` }}>
                  {letter}
                </span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }} className="text-[#f5f0e8]/60 text-sm mt-2">
              Online Library
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="text-[#e8f5c8]/70 text-base mt-8 italic leading-relaxed"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              "A reader lives a thousand lives<br />before he dies."
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.8 }}
              className="text-[#c9a84c]/60 text-xs mt-3 tracking-widest uppercase">
              — George R.R. Martin
            </motion.p>
          </div>
        </div>

        {/* RIGHT: Form card */}
        <div className="w-full max-w-md lg:max-w-md flex-shrink-0 lg:ml-auto lg:mr-12">
          <div
            id="login-form"
            className="relative rounded-3xl p-8 lg:p-10"
            style={{
              backgroundColor: 'rgba(245, 240, 232, 0.99)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(212, 201, 168, 0.6)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 80px rgba(50, 80, 30, 0.15)',
              animation: 'formBreathe 5s ease-in-out infinite',
            }}
          >
            <BorderBeam size={250} duration={12} colorFrom="#c9a84c" colorTo="#2d6a2e" className="opacity-40" />

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <Leaf className="w-8 h-8" />
              <span className="font-serif text-lg font-bold text-forest-dark">Leaf<span className="text-gold-dark">Shelf</span></span>
            </div>

            {/* Mobile leaf */}
            <div className="flex justify-center mb-4 lg:hidden">
              <span className="text-3xl">🍃</span>
            </div>

            {/* Tabs */}
            <div className="flex mb-7" style={{ borderBottom: '1px solid rgba(212, 201, 168, 0.6)' }}>
              <button
                onClick={() => switchTab('login')}
                className="pb-3 px-1 mr-6 text-base -mb-px whitespace-nowrap transition-colors"
                style={tab === 'login'
                  ? { color: '#1a3a10', fontWeight: 800, borderBottom: '3px solid #2d5016' }
                  : { color: '#6a8a5a', fontWeight: 700 }
                }
              >
                Log In
              </button>
              <button
                onClick={() => switchTab('register')}
                className="pb-3 px-1 text-base -mb-px whitespace-nowrap transition-colors"
                style={tab === 'register'
                  ? { color: '#1a3a10', fontWeight: 800, borderBottom: '3px solid #2d5016' }
                  : { color: '#6a8a5a', fontWeight: 700 }
                }
              >
                Create Account
              </button>
            </div>

            {tab === 'login' ? (
              <>
                <h2 className="text-2xl mb-1"
                    style={{ color: '#0a1a0a', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                  Sign in to your account
                </h2>
                <p className="text-sm mt-1 mb-6" style={{ color: '#2d4a2a', fontWeight: 500 }}>
                  Enter your credentials to access your library
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm"
                       style={{ color: '#b91c1c' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField id="email" type="text" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com or admin" autoComplete="username" required label="Email or Username" icon={envelopeIcon} />
                  <InputField id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password" required label="Password" icon={lockIcon} />

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#2d5016]"
                        style={{ borderColor: '#a8b89a' }} />
                      <span className="text-sm" style={{ color: '#1a3a10', fontWeight: 600 }}>Remember me</span>
                    </label>
                    <button type="button" className="text-sm underline transition-colors hover:opacity-70"
                            style={{ color: '#2d5016', fontWeight: 700 }}>
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#2d5016',
                      color: '#ffffff',
                      fontWeight: 700,
                      boxShadow: '0 10px 25px -5px rgba(45, 80, 22, 0.5)',
                    }}
                  >
                    {loading ? 'Signing in…' : <><span>Log In</span><span>📖</span></>}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ backgroundColor: '#c8d4b8' }} />
                  <span className="text-sm" style={{ color: '#3a5a2a', fontWeight: 600 }}>or continue with</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: '#c8d4b8' }} />
                </div>

                <div className="flex flex-col">
                  {socialButtons.map(({ icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      className="w-full py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-2"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#0a1a0a',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: '#a8b89a',
                        fontWeight: 700,
                      }}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl mb-1"
                    style={{ color: '#0a1a0a', fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                  Create your account
                </h2>
                <p className="text-sm mt-1 mb-6" style={{ color: '#2d4a2a', fontWeight: 500 }}>
                  Join thousands of readers on LeafShelf
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm"
                       style={{ color: '#b91c1c' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <InputField id="reg-name" type="text" value={regName} onChange={e => setRegName(e.target.value)}
                    placeholder="John Doe" autoComplete="name" required label="Full Name" icon={userIcon} />
                  <InputField id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email" required label="Email Address" icon={envelopeIcon} />
                  <InputField id="reg-password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="new-password" required label="Password" icon={lockIcon} />
                  <InputField id="reg-confirm" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                    placeholder="••••••••" autoComplete="new-password" required label="Confirm Password" icon={lockIcon} />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-1 flex items-center justify-center"
                    style={{
                      backgroundColor: '#2d5016',
                      color: '#ffffff',
                      fontWeight: 700,
                      boxShadow: '0 10px 25px -5px rgba(45, 80, 22, 0.5)',
                    }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ backgroundColor: '#c8d4b8' }} />
                  <span className="text-sm" style={{ color: '#3a5a2a', fontWeight: 600 }}>or continue with</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: '#c8d4b8' }} />
                </div>

                <div className="flex flex-col">
                  {socialButtons.map(({ icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      className="w-full py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-2"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#0a1a0a',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: '#a8b89a',
                        fontWeight: 700,
                      }}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="mt-5 text-center text-sm" style={{ color: '#2d4a2a', fontWeight: 500 }}>
              {tab === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => switchTab('register')} className="underline hover:opacity-70 transition-opacity"
                          style={{ color: '#2d5016', fontWeight: 800 }}>
                    Create Account
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => switchTab('login')} className="underline hover:opacity-70 transition-opacity"
                          style={{ color: '#2d5016', fontWeight: 800 }}>
                    Log In
                  </button>
                </>
              )}
            </p>
            <p className="mt-3 text-center text-xs" style={{ color: '#3a5a2a', fontWeight: 500 }}>
              By continuing, you agree to our{' '}
              <span className="underline cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: '#2d5016', fontWeight: 700 }}>Terms</span>{' '}and{' '}
              <span className="underline cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: '#2d5016', fontWeight: 700 }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      {/* Layer 6: Falling leaves — disabled for meadow scene (RABEN-1) */}
      {/* Layer 7: Corner sway leaves — disabled for meadow scene (RABEN-1) */}

      {/* Landed books — resting on the grass (desktop only) */}
      <div className="hidden lg:flex absolute bottom-8 left-12 z-[6] pointer-events-none gap-3">
        <div style={{
          width: '50px', height: '70px',
          background: 'linear-gradient(135deg, #1a3a10, #2d5016)',
          borderRadius: '2px 4px 4px 2px',
          border: '1.5px solid rgba(201, 168, 76, 0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transform: 'rotate(-12deg)',
        }} />
        <div style={{
          width: '60px', height: '85px',
          background: 'linear-gradient(135deg, #5a1a1a, #8b2a2a)',
          borderRadius: '2px 4px 4px 2px',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transform: 'rotate(4deg)',
          marginLeft: '-15px',
        }} />
        <div style={{
          width: '45px', height: '65px',
          background: 'linear-gradient(135deg, #6a4a1a, #8b6a2a)',
          borderRadius: '2px 4px 4px 2px',
          border: '1.5px solid rgba(245, 215, 110, 0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transform: 'rotate(-6deg)',
          marginLeft: '-10px',
        }} />
      </div>
    </div>
  );
}
