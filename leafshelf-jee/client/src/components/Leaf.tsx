type Props = { className?: string };

export default function Leaf({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f3f32" />
          <stop offset="1" stopColor="#356851" />
        </linearGradient>
      </defs>
      <path
        d="M 12 48 Q 12 16 50 12 Q 56 30 36 50 Q 22 54 12 48 Z"
        fill="url(#leafGrad)"
      />
      <path
        d="M 16 46 L 46 18"
        stroke="#c8a558"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
