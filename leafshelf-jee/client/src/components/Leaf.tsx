type Props = { className?: string };

/*
 * Two-leaf botanical plant icon.
 * viewBox 0 0 100 100 — coordinates are in % of icon size for easy math.
 *
 * Left leaf:  tip ~(20,16), base ~(42,66), belly extends to x≈0
 * Right leaf: tip ~(80,14), base ~(58,64), belly extends to x≈100
 * Stem forks from ~(50,96) up to each leaf base.
 */
export default function Leaf({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Left leaf: very dark base → forest green tip */}
        <linearGradient id="ls-ll" x1="0.8" y1="1" x2="0.1" y2="0">
          <stop offset="0%"   stopColor="#071410" />
          <stop offset="45%"  stopColor="#1B4332" />
          <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>
        {/* Right leaf: dark green base → bright emerald tip */}
        <linearGradient id="ls-rl" x1="0.2" y1="1" x2="0.9" y2="0">
          <stop offset="0%"   stopColor="#163829" />
          <stop offset="50%"  stopColor="#2D6A4F" />
          <stop offset="100%" stopColor="#52B788" />
        </linearGradient>
        {/* Left shine: bright at upper-left, fades to transparent */}
        <linearGradient id="ls-ls" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%"   stopColor="#74C69D" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#74C69D" stopOpacity="0"    />
        </linearGradient>
        {/* Right shine: bright at upper-right, fades to transparent */}
        <linearGradient id="ls-rs" x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0%"   stopColor="#95D5B2" stopOpacity="0.5"  />
          <stop offset="100%" stopColor="#95D5B2" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* ────────────────────────────────────────────
          LEFT LEAF  (sits behind / darker)
          Outer (left) edge:  base (42,66) → belly x≈0 → tip (20,16)
          Inner (right) edge: tip (20,16) → tight curve → base (42,66)
      ──────────────────────────────────────────── */}
      <path
        d="M 42 66  C 10 62  0 32  20 16  C 30 8  42 24  42 66  Z"
        fill="url(#ls-ll)"
      />
      {/* Shine patch — upper portion of left leaf */}
      <path
        d="M 40 62  C 16 56  4 34  22 18  C 28 12  38 22  40 62  Z"
        fill="url(#ls-ls)"
      />
      {/* Central vein */}
      <path
        d="M 42 64  Q 28 40  22 18"
        stroke="rgba(255,255,255,0.26)" strokeWidth="1.4"
        strokeLinecap="round" fill="none"
      />
      {/* Side veins (3 pairs, radiating left) */}
      <path
        d="M 34 54 L 10 46   M 29 43 L 6 37   M 25 33 L 12 28"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.0"
        strokeLinecap="round" fill="none"
      />

      {/* ────────────────────────────────────────────
          RIGHT LEAF  (sits in front / brighter)
          Outer (right) edge: base (58,64) → belly x≈100 → tip (80,14)
          Inner (left) edge:  tip (80,14) → tight curve → base (58,64)
      ──────────────────────────────────────────── */}
      <path
        d="M 58 64  C 90 60  100 30  80 14  C 70 6  58 22  58 64  Z"
        fill="url(#ls-rl)"
      />
      {/* Shine patch — upper portion of right leaf */}
      <path
        d="M 60 60  C 84 54  96 28  78 14  C 70 6  60 20  60 60  Z"
        fill="url(#ls-rs)"
      />
      {/* Central vein */}
      <path
        d="M 58 62  Q 72 38  78 16"
        stroke="rgba(255,255,255,0.26)" strokeWidth="1.4"
        strokeLinecap="round" fill="none"
      />
      {/* Side veins (3 pairs, radiating right) */}
      <path
        d="M 66 52 L 90 44   M 71 41 L 94 35   M 75 31 L 88 26"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.0"
        strokeLinecap="round" fill="none"
      />

      {/* ────────────────────────────────────────────
          FORKED STEM
          Both branches start at the same bottom point and
          curve out to each leaf base.
      ──────────────────────────────────────────── */}
      {/* Left branch */}
      <path
        d="M 50 96  C 50 84  45 76  42 66"
        stroke="#071410" strokeWidth="3.8"
        strokeLinecap="round" fill="none"
      />
      {/* Right branch */}
      <path
        d="M 50 96  C 50 84  55 76  58 64"
        stroke="#0d1f15" strokeWidth="3.2"
        strokeLinecap="round" fill="none"
      />
      {/* Fork node dot */}
      <circle cx="50" cy="90" r="2.8" fill="#0d1f15" />
    </svg>
  );
}
