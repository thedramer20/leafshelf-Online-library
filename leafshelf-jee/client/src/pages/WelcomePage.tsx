import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useFirstLogin } from '../hooks/useFirstLogin';
import { Particles } from '../components/magicui/particles';
import { OrbitingCircles } from '../components/magicui/orbiting-circles';
import { BlurFade } from '../components/magicui/blur-fade';
import { BorderBeam } from '../components/magicui/border-beam';
import Leaf from '../components/Leaf';
import { VintageBookCover } from '../components/VintageBookCover';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { isFirstTime, markAsSeen } = useFirstLogin();
  const [isExiting, setIsExiting] = useState(false);

  function handleEnter() {
    setIsExiting(true);
    setTimeout(() => navigate('/'), 800);
  }

  useEffect(() => {
    markAsSeen();
    const delay = isFirstTime ? 5000 : 1500;
    const timer = setTimeout(() => handleEnter(), delay);
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

      {/* Skip button */}
      <button
        onClick={handleEnter}
        className="absolute top-6 right-6 text-xs text-[#f5f0e8]/30 hover:text-[#f5f0e8]/70 transition-colors z-20"
      >
        Skip →
      </button>

      {/* Side accent text (desktop only) */}
      <BlurFade delay={2.2} inView>
        <p
          className="hidden lg:block absolute left-8 top-1/2 text-[10px] tracking-[0.3em] text-green-300/25 uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateY(50%)' }}
        >
          Stories that inspire
        </p>
      </BlurFade>
      <BlurFade delay={2.3} inView>
        <p
          className="hidden lg:block absolute right-8 top-1/2 text-[10px] tracking-[0.3em] text-green-300/25 uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%)' }}
        >
          Knowledge that grows
        </p>
      </BlurFade>

      {/* Layer 4: Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Small label */}
        <BlurFade delay={0.4} inView>
          <p className="text-xs font-medium tracking-[0.4em] text-green-300/60 mb-6 uppercase">
            Welcome to
          </p>
        </BlurFade>

        {/* Hero text row: Leaf + icon + Shelf */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6">
          <BlurFade delay={0.7} inView direction="left">
            <span
              className="text-5xl sm:text-7xl lg:text-8xl text-[#f5f0e8] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Leaf
            </span>
          </BlurFade>

          {/* Leaf centerpiece */}
          <BlurFade delay={1.0} inView>
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
              <OrbitingCircles className="size-1.5 border-none bg-green-500/80" radius={50} duration={14} />
              <OrbitingCircles className="size-1 border-none bg-amber-400/60" radius={62} duration={20} reverse />
              <div
                className="relative z-10"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(45,106,46,0.7))',
                  animation: 'spin 20s linear infinite',
                }}
              >
                <Leaf className="w-14 h-14 sm:w-20 sm:h-20" />
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={1.3} inView direction="right">
            <span
              className="text-5xl sm:text-7xl lg:text-8xl text-[#f5f0e8] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Shelf
            </span>
          </BlurFade>
        </div>

        {/* Subtitle */}
        <BlurFade delay={1.7} inView>
          <p
            className="text-base sm:text-lg text-[#f5f0e8]/50 font-light italic tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your next chapter awaits
          </p>
        </BlurFade>

        {/* Vintage book — premium card */}
        <BlurFade delay={1.9} inView>
          <div className="mt-8 flex justify-center"
               style={{ filter: 'drop-shadow(0 20px 50px rgba(201,168,76,0.3))' }}>
            <VintageBookCover title="LeafShelf" subtitle="Premium" size="md" />
          </div>
        </BlurFade>

        {/* Feature hints */}
        <BlurFade delay={2.0} inView>
          <div className="flex gap-8 mt-10 text-green-200/40 text-xs tracking-wider uppercase">
            <span>📖 Endless stories</span>
            <span>📚 Your library</span>
            <span>🎧 Read or listen</span>
          </div>
        </BlurFade>

        {/* Enter CTA */}
        <BlurFade delay={2.5} inView>
          <button
            onClick={handleEnter}
            className="relative mt-12 px-8 py-3 rounded-full bg-[#f5f0e8]/5 backdrop-blur border border-[#c9a84c]/30 text-[#f5f0e8] text-sm font-medium tracking-wide hover:bg-[#f5f0e8]/10 transition-colors group overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Enter your library
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            <BorderBeam size={80} duration={6} colorFrom="#c9a84c" colorTo="#2d6a2e" />
          </button>
        </BlurFade>
      </div>

      {/* Cream flash transition overlay */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 8 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="w-32 h-32 rounded-full bg-[#f5f0e8]/95 shadow-[0_0_120px_60px_rgba(245,240,232,0.9)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
