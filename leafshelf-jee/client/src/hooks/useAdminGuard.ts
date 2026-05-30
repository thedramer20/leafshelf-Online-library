import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuth } from '../lib/adminAuth';

export function useAdminGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);
}
