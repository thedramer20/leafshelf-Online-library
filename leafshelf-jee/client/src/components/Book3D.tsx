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
    if (isOpen) return;
    setIsOpen(true);
    pages.forEach((_, i) => {
      setTimeout(() => setCurrentPage(i + 1), 800 + i * 1000);
    });
    setTimeout(() => onComplete?.(), 800 + pages.length * 1000 + 500);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D book */}
      <div style={{ perspective: '1200px' }}>
        <div
          onClick={handleClick}
          className="relative cursor-pointer"
          style={{
            width: '220px',
            height: '300px',
            transformStyle: 'preserve-3d',
            animation: isOpen ? 'none' : 'bookFloat 3s ease-in-out infinite',
          }}
        >
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
            <div className="absolute inset-0 rounded-r-lg rounded-l-sm
                            bg-gradient-to-br from-[#1a3a1a] via-[#2d5016] to-[#1a3a1a]
                            border border-[#3d6a2e]/50 flex flex-col items-center justify-center
                            p-6 gap-3">
              <span className="text-4xl">🍃</span>
              <h3 className="text-[#f5f0e8] text-xl font-bold tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                LeafShelf
              </h3>
              <p className="text-[#f5f0e8]/50 text-xs tracking-widest uppercase">
                Online Library
              </p>
              <div className="w-16 h-px bg-[#c9a84c]/40 mt-2" />
              <p className="text-[#c9a84c]/60 text-[10px] tracking-wider mt-1">
                TAP TO OPEN
              </p>
            </div>
            {/* Cover spine edge */}
            <div className="absolute left-0 top-0 bottom-0 w-3
                            bg-gradient-to-r from-[#1a2e1a] to-[#2d5016] rounded-l-sm" />
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

      {/* Hint label */}
      {!isOpen && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[#f5f0e8]/40 text-xs tracking-wider animate-pulse"
        >
          Click the book to begin
        </motion.p>
      )}
    </div>
  );
}
