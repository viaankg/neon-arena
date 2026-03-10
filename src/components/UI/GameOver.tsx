import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { motion } from 'motion/react';
import { Trophy, Skull, RotateCcw } from 'lucide-react';

export const GameOver = () => {
  const { gameState, resetGame, players } = useGameStore();

  if (gameState !== 'VICTORY' && gameState !== 'DEFEAT') return null;

  const isVictory = gameState === 'VICTORY';
  const totalScore = players.reduce((acc, p) => acc + p.score, 0);

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className={`mb-8 inline-flex p-6 rounded-full ${isVictory ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {isVictory ? <Trophy size={64} /> : <Skull size={64} />}
        </div>

        <h2 className={`text-6xl font-black italic mb-2 ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
          {isVictory ? 'VICTORY' : 'DEFEAT'}
        </h2>
        <p className="text-zinc-500 uppercase tracking-widest text-sm mb-12">
          {isVictory ? 'Arena Cleared Successfully' : 'Combatant Terminated'}
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Final Score</div>
          <div className="text-4xl font-bold text-white">{totalScore}</div>
        </div>

        <button 
          onClick={resetGame}
          className="flex items-center justify-center gap-3 w-full py-5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
        >
          <RotateCcw size={20} />
          <span>Return to Base</span>
        </button>
      </motion.div>
    </div>
  );
};
