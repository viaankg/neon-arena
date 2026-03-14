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

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Ensure the window has focus before requesting lock
    if (!document.hasFocus()) {
      window.focus();
    }

    try {
      // Request pointer lock on the body when the overlay is clicked
      if (!document.pointerLockElement) {
        const promise = document.body.requestPointerLock() as any;
        
        // Handle modern promise-based requestPointerLock
        if (promise && typeof promise.then === 'function') {
          promise.catch((err: any) => {
            // Silence common benign errors
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError' || err.message?.includes('exited the lock')) {
              return;
            }
            console.warn('Pointer lock request failed:', err);
          });
        }
      }
    } catch (error) {
      // Catch synchronous errors
    }
  };

  if (isLocked) return null;

  return (
    <div 
      onClick={handleClick}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer transition-all group"
    >
      <div className="text-center p-12 border border-white/10 rounded-3xl bg-white/5 shadow-2xl transform transition-transform group-hover:scale-105">
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
