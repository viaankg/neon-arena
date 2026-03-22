import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, Keyboard, Zap, Target } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    title: "Movement",
    description: "Use WASD keys to move your operative. Press SPACE to jump and C to slide.",
    icon: <Keyboard className="text-cyan-400" size={32} />,
    keys: ["W", "A", "S", "D", "SPACE", "C"]
  },
  {
    title: "Combat",
    description: "Aim with your MOUSE. LEFT CLICK to fire. RIGHT CLICK to Aim Down Sights (ADS) for better precision.",
    icon: <Target className="text-red-400" size={32} />,
    keys: ["MOUSE", "L-CLICK", "R-CLICK"]
  },
  {
    title: "Arsenal",
    description: "Switch between Primary, Secondary, and Melee weapons using 1, 2, and 3 keys. Press R to reload.",
    icon: <Zap className="text-yellow-400" size={32} />,
    keys: ["1", "2", "3", "R"]
  },
  {
    title: "Abilities",
    description: "Activate your tactical abilities: Q, E, and F for your selected loadout.",
    icon: <Zap className="text-purple-400" size={32} />,
    keys: ["Q", "E", "F"]
  }
];

export const Tutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { startGame, resetGame } = useGameStore();

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      startGame();
    }
  };

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          className="max-w-md w-full bg-zinc-900/90 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              {TUTORIAL_STEPS[currentStep].icon}
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                {TUTORIAL_STEPS[currentStep].title}
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </p>
            </div>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed mb-8">
            {TUTORIAL_STEPS[currentStep].description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {TUTORIAL_STEPS[currentStep].keys.map(key => (
              <span key={key} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                {key}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={nextStep}
              className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? "Begin Mission" : "Next Protocol"}
            </button>
            <button
              onClick={resetGame}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all border border-white/10"
            >
              Abort
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
