import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirstLogin } from '../hooks/useFirstLogin';
import { Particles } from '../components/magicui/particles';
import { OrbitingCircles } from '../components/magicui/orbiting-circles';
import Leaf from '../components/Leaf';

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
      {/* Layer 1: Green particles */}
      <Particles
        className="absolute inset-0"
        quantity={50}
        ease={80}
        color="#2d6a2e"
        refresh={false}
        size={0.5}
      />
      {/* Layer 2: Gold accent particles */}
      <Particles
        className="absolute inset-0"
        quantity={15}
        ease={60}
        color="#c9a84c"
        refresh={false}
        size={0.8}
      />
      {/* Layer 3: Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #2d6a2e 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Layer 4: Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Leaf centerpiece with orbiting elements */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-6">
          <OrbitingCircles className="size-2 border-none bg-green-500/80" radius={70} duration={14} />
          <OrbitingCircles className="size-1.5 border-none bg-amber-400/60" radius={85} duration={20} reverse />
          <OrbitingCircles className="size-1 border-none bg-green-300/50" radius={55} duration={10} />
          <div
            className="relative z-10"
            style={{
              filter: 'drop-shadow(0 0 25px rgba(45,106,46,0.7))',
              animation: 'spin 20s linear infinite',
            }}
          >
            <Leaf className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
