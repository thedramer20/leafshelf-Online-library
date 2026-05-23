import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirstLogin } from '../hooks/useFirstLogin';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { markAsSeen } = useFirstLogin();

  useEffect(() => {
    markAsSeen();
    const timer = setTimeout(() => navigate('/'), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1a0f 0%, #1a2e1a 50%, #0f140f 100%)' }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <p className="text-[#f5f0e8] text-lg">Welcome scene loading...</p>
      </div>
    </div>
  );
}
