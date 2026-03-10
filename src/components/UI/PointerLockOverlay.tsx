import React, { useState, useEffect } from 'react';

export const PointerLockOverlay: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(!!document.pointerLockElement);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  if (isLocked) return null;

  return (
    <div 
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none transition-all group"
    >
      <div className="text-center p-12 border border-white/10 rounded-3xl bg-white/5 shadow-2xl transform transition-transform group-hover:scale-105 pointer-events-none">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/20 rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-thin tracking-[0.3em] uppercase mb-2 text-white">Neural Link Severed</h2>
        <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-8">Synchronize to resume combat operations</p>
        <div className="px-6 py-3 border border-white/20 rounded-full inline-block text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white group-hover:border-white/40 transition-colors">
          Click to Initialize
        </div>
      </div>
    </div>
  );
};
