import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, MousePointer2, Keyboard, Move, Crosshair, Zap, RotateCcw, Shield, Target, ShoppingBag } from 'lucide-react';

export const ControlsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open automatically on mount for 5 seconds to show controls to new players
    setIsOpen(true);
    const timer = setTimeout(() => setIsOpen(false), 5000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setIsOpen(prev => !prev);
        clearTimeout(timer); // Cancel auto-close if user interacts
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    let direction = 1;
    const scrollSpeed = 0.5;

    const autoScroll = () => {
      if (!isOpen) return;
      
      scrollAmount += scrollSpeed * direction;
      scrollContainer.scrollTop = scrollAmount;

      if (scrollAmount >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        direction = -1;
      } else if (scrollAmount <= 0) {
        direction = 1;
      }

      requestAnimationFrame(autoScroll);
    };

    const animationId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationId);
  }, [isOpen]);

  const controls = [
    { key: 'WASD', action: 'Move', icon: <Move size={14} /> },
    { key: 'Space', action: 'Jump', icon: <Keyboard size={14} /> },
    { key: 'Ctrl', action: 'Slide', icon: <Keyboard size={14} /> },
    { key: 'Mouse', action: 'Aim', icon: <MousePointer2 size={14} /> },
    { key: 'L-Click', action: 'Shoot', icon: <Crosshair size={14} /> },
    { key: 'R-Click', action: 'ADS', icon: <Crosshair size={14} /> },
    { key: 'R', action: 'Reload', icon: <RotateCcw size={14} /> },
    { key: '1-3', action: 'Switch', icon: <Keyboard size={14} /> },
    { key: 'B', action: 'Loadout', icon: <ShoppingBag size={14} /> },
    { key: 'M', action: 'Controls', icon: <HelpCircle size={14} /> },
    { key: 'Q', action: 'Speed', icon: <Zap size={14} className="text-cyan-400" /> },
    { key: 'E', action: 'Rewind', icon: <RotateCcw size={14} className="text-purple-400" /> },
    { key: 'F', action: 'Shield', icon: <Shield size={14} className="text-blue-400" /> },
    { key: 'C', action: 'Stun', icon: <Target size={14} className="text-orange-400" /> },
  ];

  return (
    <div className="relative pointer-events-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white"
      >
        <HelpCircle size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">Controls (M)</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-64 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Input Reference</h3>
            </div>
            <div 
              ref={scrollRef}
              className="max-h-[400px] overflow-y-auto p-2 space-y-1"
            >
              {controls.map((control, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white/30 group-hover:text-white/60 transition-colors">
                      {control.icon}
                    </div>
                    <span className="text-xs text-white/80">{control.action}</span>
                  </div>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-cyan-400 min-w-[40px] text-center border border-white/5">
                    {control.key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
