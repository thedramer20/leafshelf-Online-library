import { useEffect, useRef, useState } from 'react';
import { useAdminGuard } from '../hooks/useAdminGuard';

const SETTINGS_KEY = 'leafshelf:admin:settings';

interface SysSettings {
  libraryName: string;
  libraryEmail: string;
  loanDurationDays: number;
  maxLoansPerUser: number;
  lateFeePerDay: number;
  allowGuestBrowse: boolean;
  allowSelfRegister: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  overdueReminders: boolean;
  reminderDaysBefore: number;
  maxRenewals: number;
  itemsPerPage: number;
  defaultLanguage: string;
  timezone: string;
}

const DEFAULTS: SysSettings = {
  libraryName: 'LeafShelf Library',
  libraryEmail: 'admin@leafshelf.com',
  loanDurationDays: 14,
  maxLoansPerUser: 5,
  lateFeePerDay: 0.25,
  allowGuestBrowse: true,
  allowSelfRegister: true,
  maintenanceMode: false,
  emailNotifications: true,
  overdueReminders: true,
  reminderDaysBefore: 2,
  maxRenewals: 2,
  itemsPerPage: 12,
  defaultLanguage: 'en',
  timezone: 'UTC',
};

function loadSettings(): SysSettings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') }; } catch { return { ...DEFAULTS }; }
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{title}</h2>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{desc}</p>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? '#1B4332' : '#D1D5DB',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function AdminSettings() {
  useAdminGuard();
  const [settings, setSettings] = useState<SysSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function set<K extends keyof SysSettings>(key: K, value: SysSettings[K]) {
    setSettings(s => ({ ...s, [key]: value }));
  }

  function handleSave() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setSettings({ ...DEFAULTS });
    localStorage.removeItem(SETTINGS_KEY);
    setSaved(true);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 8,
    fontSize: 13, outline: 'none', width: 240, boxSizing: 'border-box',
  };
  const numStyle: React.CSSProperties = { ...inputStyle, width: 100 };

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#F9FAFB' }}>
      {saved && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: '#1B4332', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
          Settings saved successfully.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1B4332', margin: 0 }}>System Settings</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Configure library-wide preferences and policies</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={handleReset} style={{ padding: '9px 16px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#6B7280' }}>
            Reset Defaults
          </button>
          <button type="button" onClick={handleSave} style={{ padding: '9px 18px', background: '#1B4332', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
            Save Settings
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760 }}>
        {/* Maintenance mode banner */}
        {settings.maintenanceMode && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>Maintenance Mode is ON</div>
              <div style={{ fontSize: 12, color: '#B45309' }}>The library is currently inaccessible to regular users.</div>
            </div>
          </div>
        )}

        <Section title="Library Information" desc="Basic details shown to your users">
          <Field label="Library Name" desc="Displayed in the header and emails">
            <input style={inputStyle} value={settings.libraryName} onChange={e => set('libraryName', e.target.value)} />
          </Field>
          <Field label="Admin Email" desc="Used for system notifications">
            <input style={inputStyle} type="email" value={settings.libraryEmail} onChange={e => set('libraryEmail', e.target.value)} />
          </Field>
          <Field label="Default Language">
            <select style={inputStyle} value={settings.defaultLanguage} onChange={e => set('defaultLanguage', e.target.value)}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
              <option value="zh">Chinese</option>
            </select>
          </Field>
          <Field label="Timezone">
            <select style={inputStyle} value={settings.timezone} onChange={e => set('timezone', e.target.value)}>
              {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Shanghai'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Loan Policies" desc="Rules for borrowing books">
          <Field label="Loan Duration" desc="Default number of days per loan">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input style={numStyle} type="number" min={1} max={90} value={settings.loanDurationDays} onChange={e => set('loanDurationDays', Number(e.target.value))} />
              <span style={{ fontSize: 13, color: '#6B7280' }}>days</span>
            </div>
          </Field>
          <Field label="Max Active Loans" desc="Per user at the same time">
            <input style={numStyle} type="number" min={1} max={20} value={settings.maxLoansPerUser} onChange={e => set('maxLoansPerUser', Number(e.target.value))} />
          </Field>
          <Field label="Late Fee" desc="Charged per day after due date">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>$</span>
              <input style={{ ...numStyle, width: 80 }} type="number" min={0} step={0.05} value={settings.lateFeePerDay} onChange={e => set('lateFeePerDay', Number(e.target.value))} />
              <span style={{ fontSize: 13, color: '#6B7280' }}>/day</span>
            </div>
          </Field>
          <Field label="Max Renewals" desc="How many times a loan can be renewed">
            <input style={numStyle} type="number" min={0} max={10} value={settings.maxRenewals} onChange={e => set('maxRenewals', Number(e.target.value))} />
          </Field>
        </Section>

        <Section title="Access Control" desc="Who can access the library and how">
          <Field label="Guest Browse" desc="Allow non-logged-in users to browse books">
            <Toggle checked={settings.allowGuestBrowse} onChange={v => set('allowGuestBrowse', v)} />
          </Field>
          <Field label="Self Registration" desc="Users can create their own accounts">
            <Toggle checked={settings.allowSelfRegister} onChange={v => set('allowSelfRegister', v)} />
          </Field>
          <Field label="Maintenance Mode" desc="Temporarily disable access for all non-admins">
            <Toggle checked={settings.maintenanceMode} onChange={v => set('maintenanceMode', v)} />
          </Field>
        </Section>

        <Section title="Notifications" desc="Automated email reminders and alerts">
          <Field label="Email Notifications" desc="Send transactional emails (borrow, return confirmations)">
            <Toggle checked={settings.emailNotifications} onChange={v => set('emailNotifications', v)} />
          </Field>
          <Field label="Overdue Reminders" desc="Notify users before their loan expires">
            <Toggle checked={settings.overdueReminders} onChange={v => set('overdueReminders', v)} />
          </Field>
          {settings.overdueReminders && (
            <Field label="Reminder Days Before" desc="How many days before due date to send reminder">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input style={numStyle} type="number" min={1} max={14} value={settings.reminderDaysBefore} onChange={e => set('reminderDaysBefore', Number(e.target.value))} />
                <span style={{ fontSize: 13, color: '#6B7280' }}>days</span>
              </div>
            </Field>
          )}
        </Section>

        <Section title="Display" desc="Pagination and UI preferences">
          <Field label="Items Per Page" desc="Books shown per page in catalog">
            <select style={{ ...inputStyle, width: 120 }} value={settings.itemsPerPage} onChange={e => set('itemsPerPage', Number(e.target.value))}>
              {[6, 12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </Section>
      </div>
    </div>
  );
}
