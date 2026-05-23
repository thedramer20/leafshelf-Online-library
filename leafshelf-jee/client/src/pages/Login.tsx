import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import Leaf from '../components/Leaf';
import { useFirstLogin } from '../hooks/useFirstLogin';
import { Particles } from '../components/magicui/particles';
import { Book3D } from '../components/Book3D';

type Tab = 'login' | 'register';
type LocationState = { from?: { pathname: string } };

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
      <label htmlFor={id} className="block text-sm font-semibold text-[#1a3a10] mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9a7a] pointer-events-none">{icon}</span>
        <input
          id={id} type={isPassword && show ? 'text' : type}
          value={value} onChange={onChange}
          required={required} autoComplete={autoComplete} placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-[#c9d4b8]
            bg-white text-[#1a2e1a] text-sm placeholder:text-[#8a9a7a] font-medium
            focus:ring-2 focus:ring-[#2d6a2e] focus:border-[#2d6a2e]
            outline-none transition-all"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7a4a] hover:text-[#2d5016]">
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
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const { isFirstTime } = useFirstLogin();
  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
      navigate(isFirstTime ? '/welcome' : from, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError(null);
    try {
      await signUp(regName.trim(), regEmail.trim().toLowerCase(), regPassword);
      navigate('/welcome', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally { setLoading(false); }
  }

  const switchTab = (t: Tab) => { setTab(t); setError(null); };

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
      {/* Layer 1: Full-page nature background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80')`,
        }}
      />
      {/* Layer 2: Dark green overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a0a]/70 via-[#1a2e1a]/60 to-[#0f1a0f]/80" />
      {/* Layer 3: Particles */}
      <Particles className="absolute inset-0 z-10" quantity={40} ease={90} color="#2d6a2e" size={0.5} refresh={false} />
      <Particles className="absolute inset-0 z-10" quantity={10} ease={70} color="#c9a84c" size={0.8} refresh={false} />
      {/* Layer 4: Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,20,10,0.6) 100%)' }} />

      {/* Layer 5: Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-between max-w-7xl mx-auto px-8 lg:px-16 py-12">
        {/* LEFT: Book + brand (desktop only) */}
        <div className="hidden lg:flex flex-col items-center gap-8 flex-1">
          <div id="book-area">
            <Book3D onComplete={() => {
              document.querySelector('#login-form')?.scrollIntoView({ behavior: 'smooth' });
            }} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#f5f0e8]"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              LeafShelf
            </h1>
            <p className="text-[#f5f0e8]/50 text-sm mt-1">Online Library</p>
            <p className="text-[#c9a84c]/60 text-xs mt-3 italic tracking-wide">
              Your next chapter awaits
            </p>
          </div>
        </div>

        {/* RIGHT: Glassmorphism form card */}
        <div className="w-full max-w-md lg:max-w-lg flex-shrink-0">
          <div id="login-form" className="backdrop-blur-2xl bg-[#f5f0e8]/96 rounded-3xl shadow-2xl border border-[#d4c9a8]/40 p-8 lg:p-10">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <Leaf className="w-8 h-8" />
              <span className="font-serif text-lg font-bold text-forest-dark">Leaf<span className="text-gold-dark">Shelf</span></span>
            </div>

            {/* Mobile leaf decoration — visible only when book is hidden */}
            <div className="flex justify-center mb-4 lg:hidden">
              <span className="text-3xl">🍃</span>
            </div>

            {/* Tabs */}
            <div className="flex mb-7 border-b border-[#d4c9a8]">
              <button
                onClick={() => switchTab('login')}
                className={`pb-3 px-1 mr-6 text-base font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  tab === 'login' ? 'text-[#1a3a10] font-bold border-[#2d5016]' : 'text-[#8a9a7a] border-transparent hover:text-[#1a3a10]'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`pb-3 px-1 text-base font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  tab === 'register' ? 'text-[#1a3a10] font-bold border-[#2d5016]' : 'text-[#8a9a7a] border-transparent hover:text-[#1a3a10]'
                }`}
              >
                Create Account
              </button>
            </div>

            {tab === 'login' ? (
              <>
                <h2 className="text-2xl font-bold text-[#1a3a10] mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                  Sign in to your account
                </h2>
                <p className="text-sm text-[#3a5a2a] mt-1 mb-6">Enter your credentials to access your library</p>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email" required label="Email Address" icon={envelopeIcon} />
                  <InputField id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password" required label="Password" icon={lockIcon} />

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-sm text-[#1a3a10] cursor-pointer select-none">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#d4c9a8] accent-[#2d5016]" />
                      Remember me
                    </label>
                    <button type="button" className="text-sm text-[#2d5016] font-semibold hover:underline transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#2d5016] text-white text-base font-bold hover:bg-[#1a3a10] active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-[#2d5016]/30 mt-1 flex items-center justify-center gap-2">
                    {loading ? 'Signing in…' : <><span>Log In</span><span>📖</span></>}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#c9d4b8]" />
                  <span className="text-sm text-[#5a7a4a] font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-[#c9d4b8]" />
                </div>

                <div className="flex flex-col">
                  {socialButtons.map(({ icon, label }) => (
                    <button key={label} type="button"
                      className="w-full py-3 rounded-xl border-2 border-[#c9d4b8] bg-white text-[#1a3a10] text-sm font-semibold hover:bg-[#f0ebe0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-2">
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[#1a3a10] mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                  Create your account
                </h2>
                <p className="text-sm text-[#3a5a2a] mt-1 mb-6">Join thousands of readers on LeafShelf</p>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-4">
                  <InputField id="reg-name" type="text" value={regName} onChange={e => setRegName(e.target.value)}
                    placeholder="John Doe" autoComplete="name" required label="Full Name" icon={userIcon} />
                  <InputField id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email" required label="Email Address" icon={envelopeIcon} />
                  <InputField id="reg-password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="new-password" required label="Password" icon={lockIcon} />
                  <InputField id="reg-confirm" type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                    placeholder="••••••••" autoComplete="new-password" required label="Confirm Password" icon={lockIcon} />

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#2d5016] text-white text-base font-bold hover:bg-[#1a3a10] active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-[#2d5016]/30 mt-1 flex items-center justify-center">
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#c9d4b8]" />
                  <span className="text-sm text-[#5a7a4a] font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-[#c9d4b8]" />
                </div>
                <div className="flex flex-col">
                  {socialButtons.map(({ icon, label }) => (
                    <button key={label} type="button"
                      className="w-full py-3 rounded-xl border-2 border-[#c9d4b8] bg-white text-[#1a3a10] text-sm font-semibold hover:bg-[#f0ebe0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-2">
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="mt-5 text-center text-sm text-[#3a5a2a]">
              {tab === 'login' ? (
                <>Don't have an account?{' '}<button onClick={() => switchTab('register')} className="text-[#2d5016] font-bold hover:underline">Create Account</button></>
              ) : (
                <>Already have an account?{' '}<button onClick={() => switchTab('login')} className="text-[#2d5016] font-bold hover:underline">Log In</button></>
              )}
            </p>
            <p className="mt-3 text-center text-xs text-[#5a7a4a]">
              By continuing, you agree to our{' '}
              <span className="text-[#2d5016] font-medium underline cursor-pointer hover:text-[#1a3a10] transition-colors">Terms</span>{' '}and{' '}
              <span className="text-[#2d5016] font-medium underline cursor-pointer hover:text-[#1a3a10] transition-colors">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      {/* Layer 6: Falling leaf shapes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-green-300/10 pointer-events-none z-10"
          style={{
            left: `${10 + i * 15}%`,
            top: '-30px',
            fontSize: `${16 + i * 3}px`,
            animation: `leafFall ${9 + i * 3}s linear ${i * 1.8}s infinite`,
          }}
        >
          🍂
        </div>
      ))}
    </div>
  );
}
