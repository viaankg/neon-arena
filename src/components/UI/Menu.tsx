import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { motion } from 'motion/react';
import { Play, Users, Settings, Trophy, Skull } from 'lucide-react';

export const Menu = () => {
  const { mode, setMode, difficulty, setDifficulty, startGame, gameState } = useGameStore();

  if (gameState !== 'MENU') return null;

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center p-8 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
        <div className="grid grid-cols-12 h-full w-full gap-4 p-4">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-lg border border-white/5" />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full bg-zinc-900/80 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black italic tracking-tighter text-white mb-2">
            NEON <span className="text-cyan-400">ARENA</span>
          </h1>
          <p className="text-zinc-500 uppercase tracking-[0.3em] text-xs">High Octane Combat Simulation</p>
        </div>

        <div className="space-y-8">
          {/* Mode Selection */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 block">Game Mode</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('SINGLE')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${mode === 'SINGLE' ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                <Play size={20} />
                <span className="font-bold">Single Player</span>
              </button>
              <button 
                onClick={() => setMode('TWO_PLAYER')}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${mode === 'TWO_PLAYER' ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                <Users size={20} />
                <span className="font-bold">Split Screen</span>
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 block">Bot Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                <button 
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-3 rounded-lg border text-xs font-bold transition-all ${difficulty === d ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={startGame}
            className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] uppercase tracking-widest"
          >
            Deploy to Arena
          </button>

          <button 
            onClick={() => useGameStore.getState().startTutorial()}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-all border border-white/10 uppercase tracking-widest"
          >
            Training Simulation
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between text-[10px] text-zinc-600 uppercase tracking-widest">
          <span>v1.0.4-stable</span>
          <span>System Ready</span>
        </div>
      </motion.div>
    </div>
  );
};
