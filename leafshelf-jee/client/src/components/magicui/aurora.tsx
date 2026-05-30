import { cn } from '../../lib/utils';

interface AuroraProps {
  className?: string;
  colors?: string[];
  speed?: 'slow' | 'medium' | 'fast';
  blur?: 'light' | 'medium' | 'heavy';
  intensity?: number;
}

const speedMap = { slow: '20s', medium: '12s', fast: '7s' };
const blurMap = { light: '40px', medium: '70px', heavy: '120px' };

export function Aurora({
  className,
  colors = ['#2d6a2e', '#c9a84c', '#1a5c1a', '#8b6914', '#3d8a3e', '#a07820'],
  speed = 'slow',
  blur = 'medium',
  intensity = 0.45,
}: AuroraProps) {
  const dur = speedMap[speed];
  const blurPx = blurMap[blur];

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {colors.map((color, i) => {
        const offset = (360 / colors.length) * i;
        const xStart = 20 + (i * 15) % 60;
        const yStart = 20 + (i * 12) % 60;
        const duration = parseFloat(dur) + i * 3;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${500 + i * 80}px`,
              height: `${400 + i * 60}px`,
              left: `${xStart}%`,
              top: `${yStart}%`,
              background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
              opacity: intensity,
              filter: `blur(${blurPx})`,
              transform: `rotate(${offset}deg)`,
              animation: `auroraFloat${i % 3} ${duration}s ease-in-out infinite`,
              animationDelay: `${-i * 2.5}s`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes auroraFloat0 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33%       { transform: translate(80px, -60px) scale(1.15) rotate(15deg); }
          66%       { transform: translate(-40px, 40px) scale(0.92) rotate(-8deg); }
        }
        @keyframes auroraFloat1 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33%       { transform: translate(-70px, 50px) scale(1.1) rotate(-12deg); }
          66%       { transform: translate(60px, -70px) scale(1.05) rotate(20deg); }
        }
        @keyframes auroraFloat2 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33%       { transform: translate(40px, 80px) scale(0.95) rotate(25deg); }
          66%       { transform: translate(-80px, -30px) scale(1.12) rotate(-15deg); }
        }
      `}</style>
    </div>
  );
}
