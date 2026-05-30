type BookColor = 'forest' | 'burgundy' | 'amber' | 'navy' | 'cream';

interface Props {
  startX: number;
  size: number;
  delay: number;
  duration: number;
  rotationSpeed: number;
  color: BookColor;
}

const COLOR_MAP: Record<BookColor, { bg: string; border: string; spine: string }> = {
  forest:   { bg: 'linear-gradient(135deg, #1a3a10, #2d5016, #1a3a10)', border: 'rgba(201, 168, 76, 0.45)', spine: '#0f2a08' },
  burgundy: { bg: 'linear-gradient(135deg, #5a1a1a, #8b2a2a, #5a1a1a)', border: 'rgba(212, 175, 55, 0.45)', spine: '#3a0a0a' },
  amber:    { bg: 'linear-gradient(135deg, #6a4a1a, #8b6a2a, #6a4a1a)', border: 'rgba(245, 215, 110, 0.45)', spine: '#4a3010' },
  navy:     { bg: 'linear-gradient(135deg, #1a2a4a, #1e3a6a, #1a2a4a)', border: 'rgba(150, 180, 220, 0.45)', spine: '#0f1a30' },
  cream:    { bg: 'linear-gradient(135deg, #c8b89a, #d4c4a0, #c8b89a)', border: 'rgba(139, 100, 50, 0.45)', spine: '#a09070' },
};

export function FallingBook({ startX, size, delay, duration, rotationSpeed, color }: Props) {
  const height = Math.round(size * 1.4);
  const { bg, border, spine } = COLOR_MAP[color];
  const spinDuration = (360 / rotationSpeed).toFixed(2);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${startX}%`,
        top: 0,
        width: size,
        animation: `bookFall ${duration}s linear ${delay}s infinite`,
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          width: size,
          height,
          background: bg,
          borderRadius: '2px 5px 5px 2px',
          border: `1.5px solid ${border}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.35), inset 0 1px 4px rgba(255,230,150,0.1)`,
          position: 'relative',
          animation: `bookRotate ${spinDuration}s linear ${delay}s infinite`,
          willChange: 'transform',
        }}
      >
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
          background: spine, borderRadius: '2px 0 0 2px',
        }} />
        <div style={{
          position: 'absolute', inset: '7px',
          border: `1px solid ${border}`,
          borderRadius: '1px',
        }} />
      </div>
    </div>
  );
}
