import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useT } from '../hooks/useT';
import type { Lang } from '../lib/i18n';
import { getReadingPrefs, saveReadingPrefs } from '../lib/readingPrefs';
import { getReadingGoal, saveReadingGoal } from '../lib/api';
import { getReadingStats, getReadingStatsDisplay } from '../lib/readingStats';
import { getDownloads } from '../lib/api';

type Tab = 'profile' | 'account' | 'notifications' | 'privacy' | 'reading' | 'security';

const ST_ANIMS = `
@keyframes stHeroGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes stFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes stSlideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes stPanelIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes stSavedPop{0%{transform:translateY(-6px);opacity:0}15%{transform:translateY(0);opacity:1}85%{opacity:1}100%{opacity:0}}
@keyframes stAvatarPulse{0%,100%{box-shadow:0 0 0 0 rgba(82,183,136,0.4)}70%{box-shadow:0 0 0 8px rgba(82,183,136,0)}}
`;

const TAB_ICONS: Record<Tab, string> = {
  profile: '👤',
  account: '⚙️',
  notifications: '🔔',
  privacy: '🔒',
  reading: '📖',
  security: '🛡️',
};

const TAB_LABELS: Record<Tab, string> = {
  profile: 'Profile',
  account: 'Account',
  notifications: 'Notifications',
  privacy: 'Privacy',
  reading: 'Reading',
  security: 'Security',
};

const TABS: Tab[] = ['profile', 'account', 'notifications', 'privacy', 'reading', 'security'];

const DEVICES = [
  { name: 'MacBook Pro', icon: '💻', active: true, lastSeen: 'Now' },
  { name: 'iPhone 14', icon: '📱', active: true, lastSeen: '2 hours ago' },
  { name: 'iPad Air', icon: '📟', active: false, lastSeen: '3 days ago' },
];

const SESSIONS = [
  { device: 'Chrome on Windows', location: 'Current session', time: 'Active now', current: true },
  { device: 'Safari on iPhone', location: 'Mobile', time: '2 hours ago', current: false },
];

function Toggle({ checked, onChange, size = 'md' }: { checked: boolean; onChange: (v: boolean) => void; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 32 : 40;
  const h = size === 'sm' ? 18 : 22;
  const d = size === 'sm' ? 12 : 16;
  const gap = Math.round((h - d) / 2);
  const tx = w - d - gap;
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{
      position: 'relative', display: 'inline-flex', flexShrink: 0,
      width: w, height: h, borderRadius: h,
      background: checked ? 'linear-gradient(135deg,#1B4332,#2D6A4F)' : '#CBD5E1',
      transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      border: 'none', cursor: 'pointer', outline: 'none',
      boxShadow: checked ? '0 2px 8px rgba(27,67,50,0.35)' : 'inset 0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <span style={{
        position: 'absolute', top: gap, left: checked ? tx : gap,
        width: d, height: d, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
        transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: '1px solid #F0FDF4' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2e1a', margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Card({ title, icon, children, style }: { title: string; icon?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, border: '1px solid #E8F5E9',
      boxShadow: '0 1px 8px rgba(27,67,50,0.06)', padding: 24,
      animation: 'stPanelIn 0.35s ease both',
      ...style,
    }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1B4332', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function StyledInput({ label, value, onChange, type = 'text', placeholder, readOnly }: {
  label: string; value?: string; onChange?: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</label>
      <input
        type={type} defaultValue={value} placeholder={placeholder} readOnly={readOnly}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
          border: focus ? '1.5px solid #52B788' : '1.5px solid #E8F5E9',
          background: readOnly ? '#F6FAF8' : 'white',
          color: '#1a2e1a', outline: 'none', boxSizing: 'border-box',
          boxShadow: focus ? '0 0 0 3px rgba(82,183,136,0.12)' : 'none',
          transition: 'all 0.2s',
        }}
      />
    </div>
  );
}

function SavedBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: 'white',
      padding: '12px 28px', borderRadius: 50, fontSize: 14, fontWeight: 600,
      boxShadow: '0 8px 30px rgba(27,67,50,0.35)', zIndex: 9999,
      animation: 'stSavedPop 2.5s ease forwards',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 16 }}>✓</span> Settings saved successfully!
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { lang, setLang } = useT();
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const stats = getReadingStats();
  const { timeStr } = getReadingStatsDisplay(stats);
  const dlCount = getDownloads().length;

  const [notifs, setNotifs] = useState({
    releases: true, reminders: true, recs: true, promos: false,
    pushAll: true, pushLoans: true, pushNews: false,
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: false, showActivity: true, dataAnalytics: true, shareHistory: false,
  });
  const savedPrefs = getReadingPrefs();
  const [reading, setReading] = useState({
    fontSize: savedPrefs.fontSize,
    lineSpacing: savedPrefs.lineSpacing,
    mode: savedPrefs.theme as string,
    font: savedPrefs.font as string,
    autoplay: true, wifiOnly: true,
    autoBookmark: savedPrefs.autoBookmark,
    nightLight: savedPrefs.nightLight,
  });
  const [security, setSecurity] = useState({
    twoFactor: false, loginAlerts: true,
  });
  const [goal, setGoal] = useState(() => getReadingGoal());

  const initials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'May 2026';

  function handleSave() {
    saveReadingPrefs({
      fontSize: reading.fontSize, lineSpacing: reading.lineSpacing,
      theme: reading.mode as 'sepia' | 'light' | 'dark',
      font: reading.font as 'serif' | 'sans' | 'mono',
      autoBookmark: reading.autoBookmark, nightLight: reading.nightLight,
    });
    saveReadingGoal(goal);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ minHeight: '100%', background: '#F6FAF8' }}>
      <style>{ST_ANIMS}</style>
      <SavedBanner show={saved} />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#071a0f 0%,#0e2318 20%,#1B4332 50%,#2D6A4F 75%,#071a0f 100%)',
        backgroundSize: '200% 200%', animation: 'stHeroGrad 8s ease infinite',
        padding: '32px 32px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* background leaf pattern */}
        {['🍃','🌿','☘️','🍃','🌱'].map((l, i) => (
          <span key={i} style={{
            position: 'absolute', fontSize: 24 + i * 6, opacity: 0.06,
            top: ['10%','60%','20%','75%','45%'][i], left: ['5%','12%','88%','82%','50%'][i],
            animation: `stAvatarPulse ${3 + i}s ease-in-out infinite`,
            userSelect: 'none', pointerEvents: 'none',
          }}>{l}</span>
        ))}

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, animation: 'stFadeUp 0.5s ease' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#52B788,#2D6A4F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
            border: '3px solid rgba(255,255,255,0.25)',
            boxShadow: '0 0 0 0 rgba(82,183,136,0.4)', animation: 'stAvatarPulse 2.5s ease-in-out infinite',
            flexShrink: 0,
          }}>{initials}</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: '0 0 4px', fontFamily: 'Fraunces, serif' }}>
              {user?.name ?? 'Reader'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#A7F3D0', fontWeight: 600 }}>⭐ Premium Member</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Member since {memberSince}</span>
            </div>
          </div>
          {/* Quick stats */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Day Streak', value: `🔥 ${stats.streak}` },
              { label: 'Books Read', value: `📚 ${stats.completedCount}` },
              { label: 'Favorites', value: `🌿 ${stats.savedCount}` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
                padding: '10px 16px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E8F5E9',
        boxShadow: '0 2px 12px rgba(27,67,50,0.06)', position: 'sticky', top: 0, zIndex: 10,
        marginTop: -1,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t} type="button" onClick={() => setTab(t)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '14px 18px',
              fontSize: 13, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? '#1B4332' : '#6B7280',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t ? '2.5px solid #1B4332' : '2.5px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: 15 }}>{TAB_ICONS[t]}</span>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>

        {/* ── Main Content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <>
              <Card title="Profile Information" icon="👤">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <StyledInput label="Full Name" value={user?.name ?? ''} />
                  <StyledInput label="Email Address" value={user?.email ?? ''} type="email" />
                  <StyledInput label="Phone Number" value="+1 (555) 000-0000" type="tel" />
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Preferred Language</label>
                    <select value={lang} onChange={e => setLang(e.target.value as Lang)} style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                      border: '1.5px solid #E8F5E9', background: 'white', color: '#1a2e1a',
                      outline: 'none', boxSizing: 'border-box',
                    }}>
                      <option value="en">English</option>
                      <option value="ar">العربية (Arabic)</option>
                      <option value="fr">Français (French)</option>
                      <option value="zh">中文 (Chinese)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Bio</label>
                  <textarea rows={3} defaultValue="Avid reader and book enthusiast." style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                    border: '1.5px solid #E8F5E9', background: 'white', color: '#1a2e1a',
                    outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }} />
                </div>
              </Card>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={handleSave} style={{
                  padding: '11px 28px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(27,67,50,0.3)', transition: 'all 0.2s',
                }}>Save Changes</button>
                <button type="button" style={{
                  padding: '11px 28px', background: 'white', color: '#6B7280',
                  border: '1.5px solid #E8F5E9', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </>
          )}

          {/* ── ACCOUNT ── */}
          {tab === 'account' && (
            <>
              <Card title="Account Details" icon="⚙️">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <StyledInput label="Username" value={user?.name ?? ''} />
                  <StyledInput label="Email Address" value={user?.email ?? ''} type="email" />
                </div>
              </Card>

              <Card title="Subscription Plan" icon="⭐">
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 12, marginBottom: 16,
                  background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
                  border: '1.5px solid #FDE68A',
                }}>
                  <div>
                    <p style={{ fontWeight: 800, color: '#92400E', fontSize: 15, margin: '0 0 3px' }}>⭐ Premium Member</p>
                    <p style={{ fontSize: 12, color: '#B45309', margin: 0 }}>Unlimited reads · Offline access · Priority support</p>
                  </div>
                  <span style={{ fontSize: 11, background: '#FDE68A', color: '#92400E', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>Active</span>
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Next billing date', value: 'June 27, 2026' },
                    { label: 'Plan', value: 'Monthly · $9.99' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{label}</span><span style={{ fontWeight: 700, color: '#1a2e1a' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <button type="button" style={{ marginTop: 16, fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Cancel Subscription</button>
              </Card>

              <Card title="Danger Zone" icon="⚠️" style={{ border: '1.5px solid #FEE2E2', background: '#FFF5F5' }}>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button type="button" style={{
                  padding: '10px 20px', background: 'white', color: '#DC2626',
                  border: '1.5px solid #FECACA', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>🗑 Delete Account</button>
              </Card>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={handleSave} style={{
                  padding: '11px 28px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(27,67,50,0.3)',
                }}>Save Changes</button>
                <button type="button" style={{
                  padding: '11px 28px', background: 'white', color: '#6B7280',
                  border: '1.5px solid #E8F5E9', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <>
              <Card title="Email Notifications" icon="📧">
                <div>
                  {[
                    { key: 'releases' as const, label: 'New book releases', desc: 'Get notified when books in your genres are added' },
                    { key: 'reminders' as const, label: 'Borrow reminders', desc: 'Reminders when books are due soon' },
                    { key: 'recs' as const, label: 'Recommendations', desc: 'Personalized book suggestions for you' },
                    { key: 'promos' as const, label: 'Promotions & Updates', desc: 'LeafShelf news and special offers' },
                  ].map(({ key, label, desc }) => (
                    <SettingRow key={key} label={label} desc={desc}>
                      <Toggle checked={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                    </SettingRow>
                  ))}
                </div>
              </Card>

              <Card title="Push Notifications" icon="📲">
                <div>
                  {[
                    { key: 'pushAll' as const, label: 'Enable push notifications', desc: 'Receive real-time alerts on your device' },
                    { key: 'pushLoans' as const, label: 'Loan due alerts', desc: 'Push alert 2 days before a book is due' },
                    { key: 'pushNews' as const, label: 'Library news', desc: 'Updates about new collections and events' },
                  ].map(({ key, label, desc }) => (
                    <SettingRow key={key} label={label} desc={desc}>
                      <Toggle checked={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                    </SettingRow>
                  ))}
                </div>
              </Card>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={handleSave} style={{
                  padding: '11px 28px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(27,67,50,0.3)',
                }}>Save Changes</button>
                <button type="button" style={{
                  padding: '11px 28px', background: 'white', color: '#6B7280',
                  border: '1.5px solid #E8F5E9', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </>
          )}

          {/* ── PRIVACY ── */}
          {tab === 'privacy' && (
            <>
              <Card title="Profile Visibility" icon="👁">
                <div>
                  {[
                    { key: 'publicProfile' as const, label: 'Public profile', desc: 'Allow other readers to find and view your profile' },
                    { key: 'showActivity' as const, label: 'Show reading activity', desc: 'Display what you are currently reading' },
                  ].map(({ key, label, desc }) => (
                    <SettingRow key={key} label={label} desc={desc}>
                      <Toggle checked={privacy[key]} onChange={v => setPrivacy(p => ({ ...p, [key]: v }))} />
                    </SettingRow>
                  ))}
                </div>
              </Card>

              <Card title="Data & Personalisation" icon="📊">
                <div>
                  {[
                    { key: 'dataAnalytics' as const, label: 'Usage analytics', desc: 'Help improve LeafShelf by sharing anonymous usage data' },
                    { key: 'shareHistory' as const, label: 'Share reading history', desc: 'Used to generate personalised recommendations' },
                  ].map(({ key, label, desc }) => (
                    <SettingRow key={key} label={label} desc={desc}>
                      <Toggle checked={privacy[key]} onChange={v => setPrivacy(p => ({ ...p, [key]: v }))} />
                    </SettingRow>
                  ))}
                </div>
              </Card>

              <Card title="Your Data" icon="📦">
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Download a copy of all data LeafShelf holds about you, including your reading history and profile.</p>
                <button type="button" style={{
                  padding: '10px 20px', background: 'white', color: '#1B4332',
                  border: '1.5px solid #52B788', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>⬇ Request Data Export</button>
              </Card>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={handleSave} style={{
                  padding: '11px 28px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(27,67,50,0.3)',
                }}>Save Changes</button>
                <button type="button" style={{
                  padding: '11px 28px', background: 'white', color: '#6B7280',
                  border: '1.5px solid #E8F5E9', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </>
          )}

          {/* ── READING PREFERENCES ── */}
          {tab === 'reading' && (
            <>
              <Card title="Display" icon="🖥">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  {/* Font Size */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Font Size</label>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#1B4332', background: '#D1FAE5', padding: '2px 10px', borderRadius: 20 }}>{reading.fontSize}px</span>
                    </div>
                    <input type="range" min={12} max={24} value={reading.fontSize} onChange={e => setReading(r => ({ ...r, fontSize: +e.target.value }))} style={{ width: '100%', accentColor: '#1B4332' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}><span>Small</span><span>Large</span></div>
                  </div>

                  {/* Line Spacing */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Line Spacing</label>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#1B4332', background: '#D1FAE5', padding: '2px 10px', borderRadius: 20 }}>{reading.lineSpacing}×</span>
                    </div>
                    <input type="range" min={1} max={2.5} step={0.1} value={reading.lineSpacing} onChange={e => setReading(r => ({ ...r, lineSpacing: +e.target.value }))} style={{ width: '100%', accentColor: '#1B4332' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}><span>Compact</span><span>Spacious</span></div>
                  </div>

                  {/* Reading Mode + Font */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Reading Mode</label>
                      <select value={reading.mode} onChange={e => setReading(r => ({ ...r, mode: e.target.value }))} style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                        border: '1.5px solid #E8F5E9', background: 'white', color: '#1a2e1a', outline: 'none',
                      }}>
                        <option value="sepia">☕ Sepia</option>
                        <option value="light">☀️ Day (Light)</option>
                        <option value="dark">🌙 Night (Dark)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Font Style</label>
                      <select value={reading.font} onChange={e => setReading(r => ({ ...r, font: e.target.value }))} style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                        border: '1.5px solid #E8F5E9', background: 'white', color: '#1a2e1a', outline: 'none',
                      }}>
                        <option value="serif">Serif</option>
                        <option value="sans">Sans-serif</option>
                        <option value="mono">Monospace</option>
                      </select>
                    </div>
                  </div>

                  {/* Reading Mode Preview */}
                  <div style={{
                    padding: '16px 20px', borderRadius: 12,
                    background: reading.mode === 'dark' ? '#0f1a0f' : reading.mode === 'sepia' ? '#FDF6E3' : '#FFFFFF',
                    border: `1.5px solid ${reading.mode === 'dark' ? '#1B4332' : '#E8F5E9'}`,
                  }}>
                    <p style={{
                      fontSize: reading.fontSize, lineHeight: reading.lineSpacing,
                      fontFamily: reading.font === 'serif' ? 'Fraunces, Georgia, serif' : reading.font === 'mono' ? 'monospace' : 'DM Sans, sans-serif',
                      color: reading.mode === 'dark' ? '#D1FAE5' : '#1a2e1a',
                      margin: 0,
                    }}>
                      "The more that you read, the more things you will know. The more that you learn, the more places you'll go." — Dr. Seuss
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Playback & Downloads" icon="⬇️">
                <div>
                  {[
                    { key: 'autoplay' as const, label: 'Audiobook Autoplay', desc: 'Automatically play next chapter when one ends' },
                    { key: 'wifiOnly' as const, label: 'Download over Wi-Fi only', desc: 'Save mobile data when downloading books' },
                    { key: 'autoBookmark' as const, label: 'Auto-bookmark', desc: 'Save your position when you close a book' },
                    { key: 'nightLight' as const, label: 'Night light filter', desc: 'Reduce blue light during evening reading' },
                  ].map(({ key, label, desc }) => (
                    <SettingRow key={key} label={label} desc={desc}>
                      <Toggle checked={reading[key] as boolean} onChange={v => setReading(r => ({ ...r, [key]: v }))} />
                    </SettingRow>
                  ))}
                </div>
              </Card>

              <Card title="Reading Goal" icon="🎯">
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                        {stats.completedCount} of {goal.yearly} books this year
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1B4332', background: '#D1FAE5', padding: '2px 10px', borderRadius: 20 }}>
                        {Math.round(Math.min(100, (stats.completedCount / Math.max(1, goal.yearly)) * 100))}%
                      </span>
                    </div>
                    <div style={{ height: 10, background: '#E8F5E9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, Math.round((stats.completedCount / Math.max(1, goal.yearly)) * 100))}%`,
                        background: 'linear-gradient(90deg,#52B788,#1B4332)',
                        borderRadius: 999,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
                      {stats.completedCount >= goal.yearly
                        ? '🎉 Goal reached! Amazing reading this year.'
                        : `${goal.yearly - stats.completedCount} more book${goal.yearly - stats.completedCount === 1 ? '' : 's'} to reach your goal`}
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#52B788', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Yearly Target</label>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#1B4332', background: '#D1FAE5', padding: '2px 12px', borderRadius: 20 }}>
                        {goal.yearly} books
                      </span>
                    </div>
                    <input type="range" min={1} max={52} value={goal.yearly}
                      title={`Yearly reading goal: ${goal.yearly} books`}
                      onChange={e => setGoal({ yearly: +e.target.value })}
                      style={{ width: '100%', accentColor: '#1B4332' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                      <span>1 book</span><span>52 books</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={handleSave} style={{
                  padding: '11px 28px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(27,67,50,0.3)',
                }}>Save Changes</button>
                <button type="button" style={{
                  padding: '11px 28px', background: 'white', color: '#6B7280',
                  border: '1.5px solid #E8F5E9', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </>
          )}

          {/* ── SECURITY ── */}
          {tab === 'security' && (
            <>
              <Card title="Change Password" icon="🔑">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <StyledInput label="Current Password" type="password" placeholder="Enter current password" />
                  <StyledInput label="New Password" type="password" placeholder="At least 8 characters" />
                  <StyledInput label="Confirm New Password" type="password" placeholder="Repeat new password" />
                  <button type="button" onClick={handleSave} style={{
                    alignSelf: 'flex-start', padding: '10px 24px',
                    background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: 'white',
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(27,67,50,0.3)',
                  }}>🔑 Update Password</button>
                </div>
              </Card>

              <Card title="Two-Factor Authentication" icon="🛡️">
                <SettingRow label="Enable 2FA" desc="Add an extra layer of security to your account">
                  <Toggle checked={security.twoFactor} onChange={v => setSecurity(s => ({ ...s, twoFactor: v }))} />
                </SettingRow>
                {security.twoFactor && (
                  <div style={{
                    marginTop: 12, padding: '12px 16px', background: '#F0FDF4',
                    border: '1.5px solid #86EFAC', borderRadius: 10, fontSize: 13, color: '#166534',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>✓</span> 2FA is enabled. Scan the QR code in your authenticator app or use your backup codes.
                  </div>
                )}
              </Card>

              <Card title="Active Sessions" icon="💻">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {SESSIONS.map(({ device, location, time, current }) => (
                    <SettingRow key={device} label={device} desc={`${location} · ${time}`}>
                      {current
                        ? <span style={{ fontSize: 11, background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>Current</span>
                        : <button type="button" style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Revoke</button>
                      }
                    </SettingRow>
                  ))}
                </div>
                <button type="button" style={{ marginTop: 8, fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                  Sign out all other sessions
                </button>
              </Card>

              <Card title="Login Alerts" icon="🔔">
                <SettingRow label="Login alert emails" desc="Get an email when a new device signs into your account">
                  <Toggle checked={security.loginAlerts} onChange={v => setSecurity(s => ({ ...s, loginAlerts: v }))} />
                </SettingRow>
              </Card>
            </>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile Card */}
          <div style={{
            background: 'linear-gradient(160deg,#071a0f 0%,#1B4332 60%,#2D6A4F 100%)',
            borderRadius: 18, padding: 20, color: 'white',
            boxShadow: '0 8px 30px rgba(27,67,50,0.25)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg,#52B788,#2D6A4F)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: 'white',
                margin: '0 auto 12px', border: '2.5px solid rgba(255,255,255,0.2)',
              }}>{initials}</div>
              <p style={{ fontWeight: 800, fontSize: 16, margin: '0 0 3px' }}>{user?.name ?? 'Reader'}</p>
              <p style={{ fontSize: 12, color: '#FDE68A', fontWeight: 600, margin: '0 0 3px' }}>⭐ Premium Member</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Member since {memberSince}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🔥 {stats.streak}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>📚 {stats.completedCount}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Read</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Currently Reading', value: String(stats.currentlyReading) },
                { label: 'Total Pages Read', value: stats.totalPages > 0 ? stats.totalPages.toLocaleString() : '0' },
                { label: 'Reading Time', value: timeStr || '0m' },
                { label: 'Favorites', value: String(stats.savedCount) },
                { label: 'Downloads', value: String(dlCount) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#A7F3D0' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Devices */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8F5E9', padding: 18, boxShadow: '0 1px 8px rgba(27,67,50,0.06)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1B4332', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              💻 Connected Devices
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DEVICES.map(({ name, icon, active, lastSeen }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: active ? '#D1FAE5' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2e1a', margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 11, color: active ? '#059669' : '#9CA3AF', margin: '1px 0 0', fontWeight: 500 }}>
                      {active ? '● active' : `○ ${lastSeen}`}
                    </p>
                  </div>
                  {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
            <button type="button" style={{
              marginTop: 14, fontSize: 12, color: '#1B4332', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 700, padding: 0,
            }}>+ Add New Device</button>
          </div>

          {/* Quick Links */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8F5E9', padding: 18, boxShadow: '0 1px 8px rgba(27,67,50,0.06)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1B4332', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { icon: '🔑', label: 'Change Password', action: () => setTab('security') },
                { icon: '🔔', label: 'Notification Settings', action: () => setTab('notifications') },
                { icon: '📖', label: 'Reading Preferences', action: () => setTab('reading') },
                { icon: '🛡️', label: 'Enable 2FA', action: () => setTab('security') },
              ].map(({ icon, label, action }) => (
                <button key={label} type="button" onClick={action} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 500,
                  transition: 'background 0.15s', textAlign: 'left',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F0FDF4')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: 15 }}>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
