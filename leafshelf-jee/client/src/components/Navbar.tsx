import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Leaf from './Leaf';

export default function Navbar() {
  const { user, signOut } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition ${isActive ? 'text-forest-dark font-medium' : 'text-forest-mid hover:text-forest-dark'}`;

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-paper/85 border-b border-forest-dark/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-forest-dark font-serif text-xl">
          <Leaf className="w-6 h-6" />
          Leaf<span className="text-gold-dark">Shelf</span>
        </Link>

        <nav className="flex items-center gap-7 text-sm flex-wrap">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/books" className={linkClass}>Catalog</NavLink>
          {user && <NavLink to="/library" className={linkClass}>My Library</NavLink>}

          {user ? (
            <div className="flex items-center gap-4">
              <NavLink to="/profile" className={linkClass}>
                <span className="text-forest-mid">{user.name.split(' ')[0]}</span>
              </NavLink>
              <button onClick={() => void signOut()} className="text-sm text-forest-mid hover:text-rust transition">
                Sign out
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Sign in</NavLink>
              <Link to="/register" className="btn-primary py-2 px-4 text-xs">Join</Link>
            </>
          )}

          <a href="/classic" className="text-sm text-gold-dark hover:text-gold transition" title="Classic JSP view">
            Classic →
          </a>
        </nav>
      </div>
    </header>
  );
}
