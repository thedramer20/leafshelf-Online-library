import { useState } from 'react';
import { useAuth } from '../lib/auth';

type Tab = 'profile' | 'account' | 'notifications' | 'privacy' | 'reading' | 'security';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'reading', label: 'Reading Preferences' },
  { id: 'security', label: 'Security' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-forest-dark' : 'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

function InputField({ label, defaultValue, type = 'text' }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} defaultValue={defaultValue}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest-dark/20 focus:border-forest-dark transition-all" />
    </div>
  );
}

const DEVICES = [
  { name: 'MacBook Pro', type: 'laptop', active: true, lastSeen: 'Now' },
  { name: 'iPhone 14', type: 'phone', active: true, lastSeen: '2 hours ago' },
  { name: 'iPad Air', type: 'tablet', active: false, lastSeen: '3 days ago' },
];

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [notifs, setNotifs] = useState({ releases: true, reminders: true, recs: true, promos: false });
  const [saved, setSaved] = useState(false);

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024';

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Left sub-nav */}
      <aside className="w-48 flex-shrink-0">
        <h2 className="font-serif text-lg font-bold text-ink mb-4">Settings</h2>
        <nav className="space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? 'bg-[#1B4332] text-white font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-forest-dark'
              }`}>
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main form area */}
      <div className="flex-1 min-w-0 space-y-5">
        {saved && (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 text-sm">
            ✓ Settings saved successfully!
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <>
            <div className="bg-white rounded-card border border-border shadow-soft p-6">
              <h3 className="font-semibold text-sm text-ink mb-4">Profile Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <InputField label="Full Name" defaultValue={user?.name ?? ''} />
                <InputField label="Email Address" defaultValue={user?.email ?? ''} type="email" />
                <InputField label="Phone Number" defaultValue="+1 (555) 000-0000" type="tel" />
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Preferred Language</label>
                  <select defaultValue="en" className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-ink focus:outline-none focus:border-forest-dark transition-all">
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Theme Preference</label>
                  <select defaultValue="light" className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-ink focus:outline-none focus:border-forest-dark transition-all">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Reading Goal (books/month)</label>
                  <input type="number" defaultValue={16} min={1} max={100}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-ink focus:outline-none focus:border-forest-dark transition-all" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-card border border-border shadow-soft p-6">
              <h3 className="font-semibold text-sm text-ink mb-4">Email Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'releases' as const, label: 'New book releases', desc: 'Get notified when books in your genres are added' },
                  { key: 'reminders' as const, label: 'Borrow reminders', desc: 'Reminders when books are due soon' },
                  { key: 'recs' as const, label: 'Recommendations', desc: 'Personalized book suggestions for you' },
                  { key: 'promos' as const, label: 'Promotions & Updates', desc: 'LeafShelf news and special offers' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{label}</p>
                      <p className="text-xs text-muted">{desc}</p>
                    </div>
                    <Toggle checked={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-card border border-border shadow-soft p-6">
              <h3 className="font-semibold text-sm text-ink mb-4">Change Password</h3>
              <div className="space-y-3">
                <InputField label="Current Password" defaultValue="" type="password" />
                <InputField label="New Password" defaultValue="" type="password" />
                <InputField label="Confirm New Password" defaultValue="" type="password" />
                <button className="px-5 py-2.5 bg-forest-dark text-white text-sm font-semibold rounded-lg hover:bg-forest transition-colors">
                  Update Password
                </button>
              </div>
            </div>

            <div className="bg-white rounded-card border border-border shadow-soft p-6">
              <h3 className="font-semibold text-sm text-ink mb-4">Reading Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Font Size</label>
                  <input type="range" min={12} max={24} defaultValue={16} className="w-full accent-forest-dark" />
                  <div className="flex justify-between text-xs text-muted mt-1"><span>Small</span><span>Large</span></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Reading Mode</label>
                  <select defaultValue="day" className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-ink focus:outline-none focus:border-forest-dark">
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="sepia">Sepia</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Audiobook Autoplay</p>
                    <p className="text-xs text-muted">Automatically play next chapter</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">Download over Wi-Fi only</p>
                    <p className="text-xs text-muted">Save mobile data</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} className="px-6 py-2.5 bg-forest-dark text-white text-sm font-semibold rounded-lg hover:bg-forest transition-colors shadow-soft">
                Save Changes
              </button>
              <button className="px-6 py-2.5 border border-border text-sm font-medium text-ink rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </>
        )}

        {tab !== 'profile' && (
          <div className="bg-white rounded-card border border-border shadow-soft p-8 text-center">
            <p className="text-4xl mb-3">⚙️</p>
            <p className="font-semibold text-ink mb-1">{TABS.find(t => t.id === tab)?.label} Settings</p>
            <p className="text-sm text-muted">This section is coming soon</p>
          </div>
        )}
      </div>

      {/* Right profile panel */}
      <aside className="w-60 flex-shrink-0 space-y-4">
        <div className="bg-white rounded-card border border-border shadow-soft p-5">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-forest-dark flex items-center justify-center text-white text-xl font-bold mb-3">
              {initials}
            </div>
            <p className="font-bold text-ink">{user?.name ?? 'Reader'}</p>
            <p className="text-xs text-gold-dark font-semibold mt-0.5">⭐ Premium Member</p>
            <p className="text-xs text-muted mt-1">Member since {memberSince}</p>
          </div>
          <div className="flex justify-around border-t border-gray-50 pt-4 mb-4">
            <div className="text-center">
              <p className="font-bold text-ink">🔥 12</p>
              <p className="text-[10px] text-muted">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-ink">📚 28</p>
              <p className="text-[10px] text-muted">Books Read</p>
            </div>
          </div>
          <div className="space-y-2 text-sm border-t border-gray-50 pt-4">
            {[
              { label: 'Books in Library', value: '14' },
              { label: 'Audiobooks', value: '3' },
              { label: 'Favorites', value: '48' },
              { label: 'Downloads', value: '68' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-muted text-xs">{label}</span>
                <span className="font-semibold text-xs text-ink">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Devices */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-3">Connected Devices</h3>
          <div className="space-y-3">
            {DEVICES.map(({ name, active, lastSeen }) => (
              <div key={name} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">{name}</p>
                  <p className="text-[10px] text-muted">{active ? '● active' : `○ ${lastSeen}`}</p>
                </div>
              </div>
            ))}
            <button className="text-xs text-forest-dark hover:text-forest font-medium transition-colors">+ Add New Device</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
