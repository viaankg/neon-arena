import React, { useState } from 'react';
import { useGameStore, WEAPONS, WeaponType, ABILITIES, AbilityType } from '../hooks/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sword, Crosshair, Shield, Zap } from 'lucide-react';

interface LoadoutMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoadoutMenu: React.FC<LoadoutMenuProps> = ({ isOpen, onClose }) => {
  const { players, setWeapon, setAbility } = useGameStore();
  const player = players[0]; // Assume single player for now
  const [activeTab, setActiveTab] = useState<'WEAPONS' | 'ABILITIES'>('WEAPONS');

  if (!player) return null;

  const renderWeaponCategory = (type: WeaponType, slot: number) => {
    const categoryWeapons = Object.values(WEAPONS).filter(w => w.type === type);
    const currentWeaponId = player.weapons[slot];

    return (
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
          {type === 'PRIMARY' && <Crosshair size={14} />}
          {type === 'SECONDARY' && <Shield size={14} />}
          {type === 'MELEE' && <Sword size={14} />}
          {type}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {categoryWeapons.map(weapon => (
            <button
              key={weapon.id}
              onClick={() => setWeapon(player.id, slot, weapon.id)}
              className={`p-4 rounded-xl border transition-all text-left group ${
                currentWeaponId === weapon.id
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm tracking-tight">{weapon.name}</div>
                  <div className={`text-[10px] uppercase tracking-wider mt-1 ${
                    currentWeaponId === weapon.id ? 'text-black/60' : 'text-white/40'
                  }`}>
                    DMG: {weapon.damage} • MAG: {weapon.magazineSize}
                  </div>
                </div>
                {currentWeaponId === weapon.id && (
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderAbilitySlot = (slot: number) => {
    const currentAbilityId = player.selectedAbilities[slot];
    const allAbilities = Object.values(ABILITIES);

    return (
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
          <Zap size={14} />
          SLOT {slot + 1}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {allAbilities.map(ability => {
            const isSelectedInOtherSlot = player.selectedAbilities.some((a, i) => a === ability.id && i !== slot);
            return (
              <button
                key={ability.id}
                disabled={isSelectedInOtherSlot}
                onClick={() => setAbility(player.id, slot, ability.id)}
                className={`p-4 rounded-xl border transition-all text-left group ${
                  currentAbilityId === ability.id
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : isSelectedInOtherSlot 
                      ? 'bg-white/2 opacity-20 cursor-not-allowed border-transparent'
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm tracking-tight">{ability.name}</div>
                    <div className={`text-[10px] uppercase tracking-wider mt-1 ${
                      currentAbilityId === ability.id ? 'text-black/60' : 'text-white/40'
                    }`}>
                      {ability.description}
                    </div>
                  </div>
                  {currentAbilityId === ability.id && (
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-6xl bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-12">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter text-white">LOADOUT</h2>
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em] mt-1">Configure your arsenal</p>
                </div>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setActiveTab('WEAPONS')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'WEAPONS' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    Weapons
                  </button>
                  <button 
                    onClick={() => setActiveTab('ABILITIES')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'ABILITIES' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    Abilities
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'WEAPONS' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {renderWeaponCategory('PRIMARY', 0)}
                  {renderWeaponCategory('SECONDARY', 1)}
                  {renderWeaponCategory('MELEE', 2)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {renderAbilitySlot(0)}
                  {renderAbilitySlot(1)}
                  {renderAbilitySlot(2)}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-white/10 text-center">
              <button
                onClick={onClose}
                className="px-12 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform"
              >
                DEPLOY LOADOUT
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
