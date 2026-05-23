import { useState } from 'react';
import { motion } from 'motion/react';

interface Book3DProps {
  onComplete?: () => void;
}

export function Book3D({ onComplete }: Book3DProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    { title: 'Endless Stories', desc: 'Explore thousands of books across genres', icon: '📖' },
    { title: 'Your Library', desc: 'Save favorites, track progress, keep in sync', icon: '📚' },
    { title: 'Read or Listen', desc: 'Enjoy eBooks and audiobooks anywhere', icon: '🎧' },
  ];

  function handleClick() {
    if (isOpen) {
      const pageCount = pages.length;
      for (let i = pageCount - 1; i >= 0; i--) {
        setTimeout(() => setCurrentPage(i), (pageCount - 1 - i) * 400);
      }
      setTimeout(() => setIsOpen(false), pageCount * 400 + 300);
    } else {
      setIsOpen(true);
      pages.forEach((_, i) => {
        setTimeout(() => setCurrentPage(i + 1), 800 + i * 1000);
      });
      setTimeout(() => onComplete?.(), 800 + pages.length * 1000 + 500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D book with warm glow */}
      <div className="relative" style={{ perspective: '1200px' }}>
        {/* Warm glow behind book */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-64 h-80 rounded-full opacity-30 blur-3xl pointer-events-none
                        bg-gradient-to-b from-[#c9a84c]/30 to-[#2d6a2e]/20" />
        <div
          onClick={handleClick}
          className="relative cursor-pointer"
          style={{
            width: '220px',
            height: '300px',
            transformStyle: 'preserve-3d',
            animation: isOpen ? 'none' : 'bookFloat 4s ease-in-out infinite',
          }}
        >
          {/* Bookmark ribbon */}
          <div
            className="absolute pointer-events-none z-20"
            style={{
              top: '-12px',
              right: '24px',
              width: '14px',
              height: '60px',
              background: 'linear-gradient(to bottom, #8b1a1a, #c0312f, #8b1a1a)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset -1px 0 2px rgba(0,0,0,0.3)',
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)',
            }}
          />

          {/* Front Cover */}
          <motion.div
            animate={{ rotateY: isOpen ? -160 : 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 rounded-r-lg rounded-l-sm shadow-2xl"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              zIndex: 10,
            }}
          >
            {/* Cover front face */}
            <div
              className="absolute inset-0 rounded-r-lg rounded-l-sm flex flex-col items-center justify-center p-6 gap-3"
              style={{
                background: `
                  linear-gradient(135deg, #1a3a10 0%, #2d5016 30%, #1f3812 50%, #2d5016 70%, #1a3a10 100%),
                  radial-gradient(ellipse at 30% 30%, rgba(255, 220, 130, 0.15) 0%, transparent 50%)
                `,
                backgroundBlendMode: 'overlay',
                border: '2px solid rgba(201, 168, 76, 0.4)',
                boxShadow: 'inset 0 2px 8px rgba(255, 230, 150, 0.15), inset 0 -2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {/* Inner gold border frame */}
              <div className="absolute inset-3 rounded border border-[#c9a84c]/30 pointer-events-none" />
              {/* Decorative corner flourishes */}
              <div className="absolute top-2 left-2 text-[#c9a84c]/50 text-xs">❦</div>
              <div className="absolute top-2 right-2 text-[#c9a84c]/50 text-xs">❦</div>
              <div className="absolute bottom-2 left-2 text-[#c9a84c]/50 text-xs">❦</div>
              <div className="absolute bottom-2 right-2 text-[#c9a84c]/50 text-xs">❦</div>
              {/* Leaf icon with gold halo */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#c9a84c]/20 blur-md scale-150" />
                <span className="relative text-4xl">🍃</span>
              </div>
              {/* Title with embossed gold effect */}
              <h3
                className="text-xl font-bold tracking-wide mt-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#f5e9c0',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6), 0 0 12px rgba(201, 168, 76, 0.4)',
                }}
              >
                LeafShelf
              </h3>
              {/* Subtitle */}
              <p
                className="text-[10px] tracking-[0.4em] uppercase"
                style={{ color: 'rgba(201, 168, 76, 0.7)' }}
              >
                Online Library
              </p>
              {/* Ornamental divider */}
              <div className="w-12 h-px mt-2"
                   style={{ background: 'linear-gradient(to right, transparent, #c9a84c, transparent)' }} />
              {/* Call to action */}
              <p
                className="text-[9px] tracking-wider mt-1 italic"
                style={{ color: 'rgba(201, 168, 76, 0.6)' }}
              >
                {isOpen ? '✦ tap to close ✦' : '✦ tap to open ✦'}
              </p>
            </div>
            {/* Spine — thicker, more detailed */}
            <div className="absolute left-0 top-0 bottom-0 w-4 rounded-l-sm"
                 style={{
                   background: 'linear-gradient(to right, #0a1a0a, #1a3a10 40%, #2d5016)',
                   boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.5)',
                 }} />
          </motion.div>

          {/* Pages */}
          {pages.map((page, i) => (
            <motion.div
              key={i}
              animate={{ rotateY: currentPage > i ? -160 : 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 rounded-r-lg"
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                zIndex: 9 - i,
                left: `${(i + 1) * 2}px`,
              }}
            >
              <div className="absolute inset-0 rounded-r-lg bg-[#f5f0e8]
                              border border-[#e0d8c8] flex flex-col items-center
                              justify-center p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    currentPage > i ? { opacity: 0, y: -20 } :
                    currentPage === i && isOpen ? { opacity: 1, y: 0 } :
                    { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <span className="text-3xl mb-3 block">{page.icon}</span>
                  <h4 className="text-[#2d5016] text-lg font-bold mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}>
                    {page.title}
                  </h4>
                  <p className="text-[#5a7a4a] text-sm leading-relaxed">
                    {page.desc}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Back Cover */}
          <div
            className="absolute inset-0 rounded-r-lg rounded-l-sm
                        bg-gradient-to-br from-[#1a3a1a] to-[#142810]
                        border border-[#3d6a2e]/30"
            style={{ zIndex: 0, left: `${(pages.length + 1) * 2}px` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={currentPage >= pages.length ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-6"
              >
                <h4 className="text-[#f5f0e8] text-lg font-bold mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                  Welcome to LeafShelf
                </h4>
                <p className="text-[#f5f0e8]/50 text-sm mb-4">
                  Your next chapter awaits →
                </p>
                <div className="w-8 h-8 mx-auto rounded-full bg-[#c9a84c]/20
                                flex items-center justify-center animate-pulse">
                  <span className="text-[#c9a84c]">→</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Book shadow */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2
                        w-48 h-4 bg-black/30 rounded-full blur-xl transition-all duration-300"
            style={{ opacity: isOpen ? 0.1 : 0.3 }}
          />
        </div>
      </div>

      {/* Hint label — pulsing */}
      {!isOpen && (
        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#f5f0e8]/40 text-xs tracking-wider mt-4"
        >
          Click the book to begin
        </motion.p>
      )}
    </div>
  );
}
