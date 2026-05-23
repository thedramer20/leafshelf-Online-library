import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import Leaf from '../components/Leaf';
import { useFirstLogin } from '../hooks/useFirstLogin';

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
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>
        <input
          id={id} type={isPassword && show ? 'text' : type}
          value={value} onChange={onChange}
          required={required} autoComplete={autoComplete} placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white text-sm text-ink
            focus:outline-none focus:ring-2 focus:ring-forest-dark/20 focus:border-forest-dark
            transition-all placeholder:text-gray-400"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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

function BookStack() {
  return (
    <div className="flex justify-center mt-auto pt-8">
      <div className="relative w-52 h-40">
        <div className="absolute bottom-0 left-8 w-32 h-9 bg-forest-dark/20 rounded border border-forest-dark/10 rotate-[-6deg]" />
        <div className="absolute bottom-5 left-4 w-36 h-10 bg-gold/30 rounded border border-gold/20 rotate-[-2deg]" />
        <div className="absolute bottom-11 left-2 w-40 h-11 bg-forest-dark/30 rounded border border-forest-dark/15 rotate-[1deg]" />
        <div className="absolute bottom-[72px] left-6 w-32 h-9 bg-gold/20 rounded border border-gold/15 rotate-[4deg]" />
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
    <div className="flex h-screen overflow-hidden">
      {/* Left branding panel */}
      <div className="hidden md:flex md:w-1/2 flex-col p-12 relative overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.07] bg-forest-dark -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.05] bg-forest-dark translate-y-1/4 -translate-x-1/4" />

        <div className="flex items-center gap-3 relative z-10">
          <Leaf className="w-9 h-9" />
          <div>
            <div className="font-serif text-lg font-bold text-forest-dark leading-tight">Leaf<span className="text-gold-dark">Shelf</span></div>
            <div className="text-[11px] text-gray-500 leading-tight">Online Library</div>
          </div>
        </div>

        <div className="relative z-10 mt-16">
          <h1 className="font-serif text-[48px] font-bold text-forest-dark leading-snug mb-3">
            {tab === 'login' ? 'Welcome back' : 'Join LeafShelf'}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-10">
            {tab === 'login'
              ? 'Your next great read is waiting. Sign in or create an account to continue.'
              : 'Create your account and start exploring thousands of books today.'}
          </p>

          <ul className="space-y-5">
            {[
              { emoji: '📖', title: 'Endless stories', desc: 'Explore thousands of books across genres' },
              { emoji: '🔖', title: 'Your library, your way', desc: 'Save favorites, track progress, keep in sync' },
              { emoji: '🎧', title: 'Read or listen', desc: 'Enjoy books with eBooks and audiobooks' },
            ].map(({ emoji, title, desc }) => (
              <li key={title} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0">{emoji}</span>
                <div>
                  <div className="font-semibold text-forest-dark text-xs">{title}</div>
                  <div className="text-gray-500 text-xs">{desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <BookStack />

        <p className="text-xs text-[#9CA3AF] mt-auto pt-8">
          © 2024 LeafShelf Online Library. All rights reserved.{' '}
          <span className="underline cursor-pointer hover:text-gray-600 transition-colors">Terms of Service</span>
          {' · '}
          <span className="underline cursor-pointer hover:text-gray-600 transition-colors">Privacy Policy</span>
          {' · '}
          <span className="underline cursor-pointer hover:text-gray-600 transition-colors">Help Center</span>
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="w-full max-w-[420px]">

          <div className="flex items-center gap-2 mb-8 md:hidden">
            <Leaf className="w-8 h-8" />
            <span className="font-serif text-lg font-bold text-forest-dark">Leaf<span className="text-gold-dark">Shelf</span></span>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-[0_4px_24px_rgba(0,0,0,0.08)] max-w-[420px] p-8">
            {/* Tabs */}
            <div className="flex mb-7 border-b border-border">
              <button
                onClick={() => switchTab('login')}
                className={`pb-3 px-1 mr-6 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  tab === 'login' ? 'text-forest-dark border-forest-dark' : 'text-muted border-transparent hover:text-ink'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`pb-3 px-1 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  tab === 'register' ? 'text-forest-dark border-forest-dark' : 'text-muted border-transparent hover:text-ink'
                }`}
              >
                Create Account
              </button>
            </div>

            {tab === 'login' ? (
              <>
                <h2 className="text-xl font-semibold text-ink mb-1">Sign in to your account</h2>
                <p className="text-sm text-muted mb-6">Enter your credentials to access your library</p>

                {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email" required label="Email Address" icon={envelopeIcon} />
                  <InputField id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password" required label="Password" icon={lockIcon} />

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-forest-dark accent-forest-dark" />
                      Remember me
                    </label>
                    <button type="button" className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full h-12 rounded-lg bg-forest-dark text-white text-sm font-semibold hover:bg-forest transition-colors disabled:opacity-60 shadow-soft mt-1 flex items-center justify-center gap-2">
                    {loading ? 'Signing in…' : <><span>Log In</span><span>📖</span></>}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted">or continue with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="flex flex-col">
                  {socialButtons.map(({ icon, label }) => (
                    <button key={label} type="button"
                      className="w-full flex items-center justify-center gap-2 h-11 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 mb-2">
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-ink mb-1">Create your account</h2>
                <p className="text-sm text-muted mb-6">Join thousands of readers on LeafShelf</p>

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
                    className="w-full h-12 rounded-lg bg-forest-dark text-white text-sm font-semibold hover:bg-forest transition-colors disabled:opacity-60 shadow-soft mt-1 flex items-center justify-center">
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted">or continue with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex flex-col">
                  {socialButtons.map(({ icon, label }) => (
                    <button key={label} type="button"
                      className="w-full flex items-center justify-center gap-2 h-11 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 mb-2">
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-xs text-muted">
            {tab === 'login' ? (
              <>Don't have an account?{' '}<button onClick={() => switchTab('register')} className="text-forest-dark font-semibold hover:text-forest transition-colors">Create Account</button></>
            ) : (
              <>Already have an account?{' '}<button onClick={() => switchTab('login')} className="text-forest-dark font-semibold hover:text-forest transition-colors">Log In</button></>
            )}
          </p>
          <p className="mt-3 text-center text-xs text-muted/60">
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-muted transition-colors">Terms</span>{' '}and{' '}
            <span className="underline cursor-pointer hover:text-muted transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
