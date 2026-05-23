import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import Leaf from '../components/Leaf';

/* ── Icons ──────────────────────────────────────────────── */

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

function PersonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ShelfIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ── Shared input wrapper with left icon ─────────────────── */
function InputField({
  id, type, value, onChange, placeholder, autoComplete, required, minLength, icon, label,
}: {
  id: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; autoComplete: string;
  required?: boolean; minLength?: number;
  icon: React.ReactNode; label: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
        <input
          id={id} type={type} value={value} onChange={onChange}
          required={required} autoComplete={autoComplete}
          placeholder={placeholder} minLength={minLength}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm text-ink
            focus:outline-none focus:ring-2 focus:ring-forest-dark/20 focus:border-forest-dark
            transition-all placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

/* ── Book stack illustration ─────────────────────────────── */
function BookStack() {
  return (
    <div className="flex justify-center mt-auto pt-10">
      <div className="relative w-48 h-36">
        <div className="absolute bottom-0 left-6 w-32 h-9  bg-forest-dark/20 rounded border border-forest-dark/10 rotate-[-6deg]" />
        <div className="absolute bottom-5 left-4 w-36 h-10 bg-gold/30        rounded border border-gold/20      rotate-[-2deg]" />
        <div className="absolute bottom-11 left-2 w-40 h-11 bg-forest-dark/30 rounded border border-forest-dark/15 rotate-[1deg]" />
        <div className="absolute bottom-18 left-5 w-32 h-9  bg-gold/20        rounded border border-gold/15      rotate-[4deg]" />
      </div>
    </div>
  );
}

/* ── Left branding panel ─────────────────────────────────── */
function BrandingPanel({ heading, sub, bullets }: {
  heading: string; sub: string;
  bullets: { icon: React.ReactNode; text: string }[];
}) {
  return (
    <div className="hidden md:flex md:w-1/2 flex-col p-12 relative overflow-hidden"
      style={{ backgroundColor: '#F5F0E8' }}>
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.07] bg-forest-dark -translate-y-1/4 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.05] bg-forest-dark translate-y-1/4 -translate-x-1/4" />

      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <Leaf className="w-9 h-9" />
        <div>
          <div className="font-serif text-lg font-bold text-forest-dark leading-tight">
            Leaf<span className="text-gold-dark">Shelf</span>
          </div>
          <div className="text-[11px] text-gray-500 leading-tight">Online Library</div>
        </div>
      </div>

      <div className="relative z-10 mt-16">
        <h1 className="font-serif text-4xl font-bold text-forest-dark leading-snug mb-3">
          {heading}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-10">{sub}</p>

        <ul className="space-y-5">
          {bullets.map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="w-8 h-8 rounded-lg bg-forest-dark/10 flex items-center justify-center text-forest-dark flex-shrink-0">
                {icon}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <BookStack />
    </div>
  );
}

/* ── Register page ───────────────────────────────────────── */
export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      navigate('/library', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const bullets = [
    { icon: <BookIcon />,        text: 'Access 24+ curated books' },
    { icon: <ShelfIcon />,       text: 'Borrow up to 14 days per book' },
    { icon: <CheckCircleIcon />, text: 'No fees, no algorithms' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <BrandingPanel
        heading={"Join thousands\nof readers."}
        sub="Create your free account and start building your personal digital library today."
        bullets={bullets}
      />

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center bg-paper px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <Leaf className="w-8 h-8" />
            <span className="font-serif text-lg font-bold text-forest-dark">
              Leaf<span className="text-gold-dark">Shelf</span>
            </span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-border shadow-soft p-8">

            {/* Tabs */}
            <div className="flex mb-7 border-b border-border">
              <Link to="/login"
                className="pb-3 px-1 mr-6 text-sm text-muted hover:text-ink border-b-2 border-transparent -mb-px whitespace-nowrap transition-colors">
                Log In
              </Link>
              <button className="pb-3 px-1 text-sm font-semibold text-forest-dark border-b-2 border-forest-dark -mb-px whitespace-nowrap">
                Create Account
              </button>
            </div>

            <h2 className="text-xl font-semibold text-ink mb-1">Create your account</h2>
            <p className="text-sm text-muted mb-6">It takes a minute — your shelf awaits</p>

            {error && (
              <div className="bg-rust/10 text-rust border border-rust/20 rounded-lg px-4 py-3 mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <InputField
                id="name" type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name" autoComplete="name"
                required minLength={2} label="Full Name" icon={<PersonIcon />}
              />
              <InputField
                id="email" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" autoComplete="email"
                required label="Email Address" icon={<EnvelopeIcon />}
              />
              <InputField
                id="password" type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters" autoComplete="new-password"
                required minLength={6} label="Password" icon={<LockIcon />}
              />
              <InputField
                id="confirm" type="password" value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat your password" autoComplete="new-password"
                required minLength={6} label="Confirm Password" icon={<ShieldIcon />}
              />

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-forest-dark text-white text-sm font-semibold
                  hover:bg-forest transition-colors disabled:opacity-60 shadow-soft mt-1"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted">or sign up with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social buttons */}
            <div className="flex gap-2">
              {[
                { icon: <GoogleIcon />,   label: 'Google' },
                { icon: <AppleIcon />,    label: 'Apple' },
                { icon: <FacebookIcon />, label: 'Facebook' },
              ].map(({ icon, label }) => (
                <button
                  key={label} type="button"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg
                    border border-border bg-white text-xs font-medium text-gray-600
                    hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-dark font-semibold hover:text-forest transition-colors">
              Sign in
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-muted/60">
            By creating an account, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-muted transition-colors">Terms</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-muted transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
