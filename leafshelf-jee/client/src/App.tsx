import { useEffect, useState } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Leaf from './components/Leaf';
import ChatBot from './components/ChatBot';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import AdminSidebar from './components/AdminSidebar';
import { AudioPlayerProvider } from './lib/audioPlayer';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import BookReader from './pages/BookReader';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Register from './pages/Register';
import MyLibrary from './pages/MyLibrary';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import AdminBorrowings from './pages/AdminBorrowings';
import AdminCategories from './pages/AdminCategories';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminAudit from './pages/AdminAudit';
import AdminLogin from './pages/AdminLogin';
import Downloads from './pages/Downloads';
import Audiobooks from './pages/Audiobooks';
import NotFound from './pages/NotFound';
import WelcomePage from './pages/WelcomePage';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <AudioPlayerProvider>
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed slide-in on mobile, normal on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 md:relative md:z-auto md:block transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar — hamburger + logo */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Leaf className="w-7 h-7 flex-shrink-0" />
          <span className="font-bold text-[17px] text-[#1B4332]">LeafShelf</span>
        </div>

        {/* Topbar — desktop only */}
        <div className="hidden md:block">
          <Topbar />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatBot />
      <GlobalAudioPlayer />
    </div>
    </AudioPlayerProvider>
  );
}

function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Full-screen pages — no sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin layout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/borrowings" element={<AdminBorrowings />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
      </Route>

      {/* Sidebar layout pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/books/:id/read" element={<BookReader />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/library" element={<MyLibrary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/audiobooks" element={<Audiobooks />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
