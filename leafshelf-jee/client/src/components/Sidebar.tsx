import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Leaf from './Leaf';
import { useT } from '../hooks/useT';

function HomeIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 18v-6a9 9 0 0118 0v6M3 18a3 3 0 003 3h1a3 3 0 003-3v-3a3 3 0 00-3-3H3v6zM21 18a3 3 0 01-3 3h-1a3 3 0 01-3-3v-3a3 3 0 013-3h4v6z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 5.385 8.024 9.916 9 10.484.925-.556 9-5.07 9-10.484z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function NavItem({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-[#F0FDF4] text-[#1B4332] font-semibold [&>svg]:text-[#1B4332]'
            : 'text-[#374151] hover:bg-[#F0FDF4] hover:text-[#1B4332] [&>svg]:text-[#6B7280] hover:[&>svg]:text-[#1B4332]'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}


export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <aside className="w-[220px] h-screen flex flex-col bg-white border-r border-border flex-shrink-0 overflow-hidden shadow-soft">
      {/* Logo */}
      <div className="px-5 py-6 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="w-9 h-9 flex-shrink-0" />
          <div>
            <div className="font-bold text-[18px] text-[#1B4332] leading-tight">LeafShelf</div>
            <div className="text-[11px] text-[#6B7280] leading-tight">{t('brand.tagline')}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        <NavItem to="/" icon={<HomeIcon />} label={t('nav.discover')} end />
        <NavItem to="/categories" icon={<GridIcon />} label={t('nav.categories')} />
        <NavItem to="/books" icon={<BookOpenIcon />} label={t('nav.browse')} />

        <NavItem to="/library" icon={<BookmarkIcon />} label={t('nav.library')} />

        <NavItem to="/downloads" icon={<DownloadIcon />} label={t('nav.downloads')} />
        <NavItem to="/audiobooks" icon={<HeadphonesIcon />} label={t('nav.audiobooks')} />
        <NavItem to="/favorites" icon={<HeartIcon />} label={t('nav.favorites')} />

        <div className="pt-2 mt-2 border-t border-gray-100 space-y-0.5">
          <NavItem to="/settings" icon={<SettingsIcon />} label={t('nav.settings')} />
          <NavItem to="/support" icon={<SupportIcon />} label={t('nav.support')} />

          {user ? (
            <button
              onClick={() => void handleSignOut()}
              title={t('nav.logout')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-[#374151] [&>svg]:text-[#6B7280] hover:bg-red-50 hover:text-red-600 hover:[&>svg]:text-red-500 w-full text-left transition-all"
            >
              <LogoutIcon />
              <span>{t('nav.logout')}</span>
            </button>
          ) : (
            <NavItem to="/login" icon={<LoginIcon />} label={t('topbar.signIn')} />
          )}
        </div>
      </nav>

      {/* Premium card */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-xl leading-none mb-2">📚🌿</div>
          <p className="text-[13px] font-bold text-[#1B4332]">{t('premium.title')}</p>
          <p className="text-[11px] text-[#6B7280] mt-1 mb-3 leading-snug">
            {t('premium.sub')}
          </p>
          <button type="button" className="w-full bg-[#1B4332] text-white rounded-lg py-2 text-[13px] font-semibold hover:bg-[#163728] transition-colors">
            {t('premium.cta')}
          </button>
        </div>
      </div>
    </aside>
  );
}
