import React, { useEffect } from 'react';
import { useGameStore, WEAPONS, ABILITIES } from '../../hooks/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Shield, Zap, RotateCcw, Target, LogOut } from 'lucide-react';
import { ControlsDropdown } from './ControlsDropdown';

export const HUD = ({ playerId }: { playerId: number }) => {
  const { players, resetGame } = useGameStore();
  const player = players.find(p => p.id === playerId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        resetGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame]);

  if (!player) return null;

  const currentWeapon = WEAPONS[player.weapons[player.currentWeaponSlot]];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 font-mono text-white select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-start">
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="text-xs opacity-50 uppercase tracking-widest mb-1">Score</div>
            <div className="text-3xl font-bold text-emerald-400">{player.score}</div>
          </div>
          
          <button 
            onClick={resetGame}
            className="pointer-events-auto flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md px-4 py-3 rounded-xl border border-red-500/30 transition-all text-red-400 group"
            title="Press ESC to Quit"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Quit (ESC)</span>
          </button>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex gap-4">
            {Object.entries(player.abilityCooldowns).map(([key, cd]) => (
              <div key={key} className={`bg-black/50 backdrop-blur-md p-3 rounded-xl border ${cd > 0 ? 'border-red-500/50' : 'border-cyan-500/50'} flex flex-col items-center min-w-[80px]`}>
                <div className="mb-1">
                  {key === 'SPEED' && <Zap size={20} className={cd > 0 ? 'text-gray-500' : 'text-cyan-400'} />}
                  {key === 'REWIND' && <RotateCcw size={20} className={cd > 0 ? 'text-gray-500' : 'text-purple-400'} />}
                  {key === 'SHIELD' && <Shield size={20} className={cd > 0 ? 'text-gray-500' : 'text-blue-400'} />}
                  {key === 'STUN' && <Target size={20} className={cd > 0 ? 'text-gray-500' : 'text-orange-400'} />}
                </div>
                <div className="text-[10px] opacity-50">{key}</div>
                {cd > 0 && <div className="text-sm font-bold text-red-400">{cd.toFixed(1)}s</div>}
              </div>
            ))}
          </div>
          <ControlsDropdown />
        </div>
      </div>

      {/* Crosshair */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 transition-opacity ${player.isADS && currentWeapon.id === 'sniper' ? 'opacity-0' : 'opacity-80'}`}>
        <div className="relative">
          <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-cyan-400/50" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-cyan-400/50" />
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-3 h-[1px] bg-cyan-400/50" />
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-3 h-[1px] bg-cyan-400/50" />
        </div>
      </div>

      {/* Hit Marker Visual */}
      <AnimatePresence>
        {useGameStore(state => state.hitMarker.active && state.hitMarker.playerId === playerId) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="relative w-8 h-8">
              <div className="absolute top-0 left-0 w-3 h-[2px] bg-white rotate-45 origin-left shadow-[0_0_10px_white]" />
              <div className="absolute top-0 right-0 w-3 h-[2px] bg-white -rotate-45 origin-right shadow-[0_0_10px_white]" />
              <div className="absolute bottom-0 left-0 w-3 h-[2px] bg-white -rotate-45 origin-left shadow-[0_0_10px_white]" />
              <div className="absolute bottom-0 right-0 w-3 h-[2px] bg-white rotate-45 origin-right shadow-[0_0_10px_white]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sniper Scope Overlay */}
      <AnimatePresence>
        {player.isADS && currentWeapon.id === 'sniper' && (
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            {/* Scope Circle */}
            <div className="relative w-[80vh] h-[80vh] border-[2px] border-white/20 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
              {/* Crosshair Lines */}
              <div className="absolute w-full h-[1px] bg-black/80" />
              <div className="absolute h-full w-[1px] bg-black/80" />
              
              {/* Center Dot */}
              <div className="w-1 h-1 bg-red-500 rounded-full shadow-[0_0_5px_red]" />
              
              {/* Vignette effect inside scope */}
              <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
            </div>
            
            {/* Black bars on sides to hide the rest of the world */}
            <div className="absolute inset-0 flex justify-between -z-10">
               <div className="w-[calc(50%-40vh)] h-full bg-black" />
               <div className="w-[calc(50%-40vh)] h-full bg-black" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-between -z-10">
               <div className="w-full h-[calc(50%-40vh)] bg-black" />
               <div className="w-full h-[calc(50%-40vh)] bg-black" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        <div className="w-64">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs opacity-50 uppercase tracking-widest">Health</div>
            <div className="text-2xl font-bold">{player.health}</div>
          </div>
          <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-500 to-emerald-500"
              initial={{ width: '100%' }}
              animate={{ width: `${player.health}%` }}
              transition={{ type: 'spring', bounce: 0 }}
            />
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs opacity-50 uppercase tracking-widest mb-1">{currentWeapon.name}</div>
          <div className="flex items-baseline justify-end gap-2">
            {player.reloadingUntil > Date.now() ? (
              <span className="text-2xl font-bold text-orange-400 animate-pulse">RELOADING...</span>
            ) : (
              <>
                <span className="text-5xl font-bold text-cyan-400">{player.ammo[currentWeapon.id]}</span>
                <span className="text-xl opacity-30">/ {currentWeapon.magazineSize}</span>
              </>
            )}
          </div>
          <div className="mt-2 flex gap-1 justify-end">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-8 h-1 rounded-full ${player.currentWeaponSlot === i ? 'bg-cyan-400' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Damage Indicator Overlay */}
      <AnimatePresence>
        {player.health < 30 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 bg-red-900/20 pointer-events-none border-[20px] border-red-900/30"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
