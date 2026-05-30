import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuth, ADMIN_USERNAME, ADMIN_PASSWORD } from '../lib/adminAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const ok = adminAuth.login(username, password);
      if (ok) {
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid username or password');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
      setLoading(false);
    }, 400);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1.5px solid #c8b89a',
    borderRadius: 10,
    fontSize: 14,
    background: '#fffdf8',
    color: '#1a1209',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontWeight: 500,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5ede0 0%, #ede0c8 40%, #e8d5b0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background circles */}
      <div style={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(139, 101, 48, 0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(45, 80, 22, 0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(201, 168, 76, 0.06)', pointerEvents: 'none' }} />

      {/* Decorative book spines on the left */}
      <div style={{ position: 'absolute', left: 40, bottom: 60, display: 'flex', alignItems: 'flex-end', gap: 6, opacity: 0.35, pointerEvents: 'none' }}>
        {[
          { h: 110, w: 24, color: '#2d5016' },
          { h: 140, w: 18, color: '#8b3a1a' },
          { h: 95, w: 22, color: '#6a4a1a' },
          { h: 125, w: 20, color: '#1a3a5c' },
          { h: 105, w: 16, color: '#2d5016' },
          { h: 150, w: 26, color: '#5a1a4a' },
          { h: 90, w: 20, color: '#8b6a1a' },
        ].map((b, i) => (
          <div key={i} style={{ width: b.w, height: b.h, background: b.color, borderRadius: '2px 3px 2px 2px', boxShadow: '2px 2px 6px rgba(0,0,0,0.25)' }} />
        ))}
      </div>

      {/* Decorative book spines on the right */}
      <div style={{ position: 'absolute', right: 40, bottom: 60, display: 'flex', alignItems: 'flex-end', gap: 6, opacity: 0.35, pointerEvents: 'none' }}>
        {[
          { h: 100, w: 20, color: '#8b3a1a' },
          { h: 130, w: 22, color: '#2d5016' },
          { h: 115, w: 18, color: '#6a4a1a' },
          { h: 145, w: 24, color: '#1a3a5c' },
          { h: 85, w: 16, color: '#5a1a4a' },
          { h: 120, w: 20, color: '#8b6a1a' },
          { h: 95, w: 26, color: '#2d5016' },
        ].map((b, i) => (
          <div key={i} style={{ width: b.w, height: b.h, background: b.color, borderRadius: '2px 3px 2px 2px', boxShadow: '2px 2px 6px rgba(0,0,0,0.25)' }} />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255, 252, 245, 0.97)',
          borderRadius: 20,
          border: '1px solid rgba(200, 184, 154, 0.6)',
          boxShadow: '0 20px 60px rgba(100, 70, 20, 0.18), 0 4px 20px rgba(0,0,0,0.08)',
          padding: '40px 40px 36px',
          animation: shake ? 'adminShake 0.5s ease-in-out' : undefined,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #1B4332 0%, #2d5016 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 8px 24px rgba(27, 67, 50, 0.35)',
          }}>
            <svg width="30" height="30" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a4.5 4.5 0 014.5 4.5v2.25H18a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 18.75v-9A1.5 1.5 0 016 8.25h1.5V6A4.5 4.5 0 0112 1.5zm0 2.25A2.25 2.25 0 009.75 6v2.25h4.5V6A2.25 2.25 0 0012 3.75zm0 8.25a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
            </svg>
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: '#1B4332', letterSpacing: '-0.3px' }}>
            LeafShelf
          </div>
          <div style={{ fontSize: 13, color: '#8B6914', fontWeight: 600, marginTop: 2, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Admin Portal
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d4c4a0, transparent)', marginBottom: 24 }} />

        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2d1a06', margin: '0 0 4px' }}>
          Sign in to Admin Panel
        </h2>
        <p style={{ fontSize: 13, color: '#7a6a4a', margin: '0 0 22px', fontWeight: 500 }}>
          Restricted access — authorized administrators only
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8,
            padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#3d2a10', marginBottom: 6 }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#8b7a5a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1B4332'}
                onBlur={e => e.target.style.borderColor = '#c8b89a'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#3d2a10', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#8b7a5a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = '#1B4332'}
                onBlur={e => e.target.style.borderColor = '#c8b89a'}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8b7a5a', padding: 2 }}
              >
                {showPw
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#5a8a5a' : 'linear-gradient(135deg, #1B4332 0%, #2d5016 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(27, 67, 50, 0.35)',
              transition: 'opacity 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
          </button>
        </form>

        {/* Credentials hint */}
        <div style={{
          marginTop: 20,
          background: 'rgba(201, 168, 76, 0.12)',
          border: '1px dashed rgba(201, 168, 76, 0.5)',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}>
          <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" fill="none" stroke="#8B6914" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div style={{ fontSize: 12, color: '#7a5c14', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>Demo credentials</span><br />
            Username: <code style={{ background: 'rgba(139, 105, 20, 0.12)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>{ADMIN_USERNAME}</code>
            {' · '}
            Password: <code style={{ background: 'rgba(139, 105, 20, 0.12)', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>{ADMIN_PASSWORD}</code>
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <a
            href="/"
            style={{ fontSize: 13, color: '#5a7a4a', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1B4332')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5a7a4a')}
          >
            ← Back to Library
          </a>
        </div>
      </div>

      <style>{`
        @keyframes adminShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
