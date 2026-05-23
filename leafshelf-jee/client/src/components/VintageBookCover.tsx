interface Props {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const dimensions = {
  sm: { w: 80,  h: 110 },
  md: { w: 140, h: 190 },
  lg: { w: 220, h: 300 },
};

export function VintageBookCover({ title, subtitle, size = 'md', className, onClick }: Props) {
  const { w, h } = dimensions[size];
  const leafSize  = size === 'sm' ? '16px' : '28px';
  const titleSize = size === 'sm' ? '11px' : size === 'md' ? '14px' : '18px';
  const subSize   = size === 'sm' ? '8px'  : '10px';

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: w,
        height: h,
        background: 'linear-gradient(135deg, #1a3a10 0%, #2d5016 30%, #1f3812 50%, #2d5016 70%, #1a3a10 100%)',
        borderRadius: '2px 6px 6px 2px',
        border: '2px solid rgba(201, 168, 76, 0.4)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 2px 8px rgba(255, 230, 150, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', inset: '8px',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: '2px',
        pointerEvents: 'none',
      }} />
      <span style={{ fontSize: leafSize }}>🍃</span>
      <h4 style={{
        fontFamily: "'Playfair Display', serif",
        color: '#f5e9c0',
        fontWeight: 800,
        fontSize: titleSize,
        marginTop: '6px',
        textAlign: 'center',
        textShadow: '0 0 8px rgba(201,168,76,0.4)',
        lineHeight: 1.2,
      }}>{title}</h4>
      {subtitle && (
        <p style={{
          color: 'rgba(201, 168, 76, 0.7)',
          fontSize: subSize,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginTop: '4px',
          textAlign: 'center',
        }}>{subtitle}</p>
      )}
    </div>
  );
}
