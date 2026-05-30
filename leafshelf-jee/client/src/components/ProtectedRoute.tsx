import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (user) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] text-sm shadow-soft">
          Loading your library...
        </div>
      </div>
    );
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
}
