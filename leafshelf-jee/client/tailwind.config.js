/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Text
        ink: '#1C1917',
        // Backgrounds
        paper: {
          DEFAULT: '#FAFAF8',
          warm: '#F5F5F0',
        },
        // Primary green
        forest: {
          DEFAULT: '#14532D',  // hover state
          dark: '#1B4332',     // primary
          mid: '#356851',
          light: '#aec5b6',
        },
        // Accent
        gold: {
          DEFAULT: '#D4A853',
          dark: '#b08d3f',
        },
        rust: '#a8542b',
        // Semantic aliases matching the design spec
        primary: '#1B4332',
        'primary-hover': '#14532D',
        border: '#E5E7EB',
        muted: '#6B7280',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.08)',
        card: '0 1px 4px rgba(0,0,0,0.06)',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))' },
          '100%': { transform: 'rotate(calc(calc(var(--angle) * 1deg) + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(calc(var(--angle) * -1deg) - 360deg))' },
        },
      },
      animation: {
        orbit: 'orbit calc(var(--duration, 20) * 1s) linear infinite',
      },
      width: {
        sidebar: '220px',
      },
      minWidth: {
        sidebar: '220px',
      },
    },
  },
  plugins: [],
};
