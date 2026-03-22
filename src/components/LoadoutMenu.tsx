import React, { useState } from 'react';
import { useGameStore, WEAPONS, WeaponType, ABILITIES, AbilityType, WEAPON_PRICES, ABILITY_PRICES, SKINS } from '../hooks/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sword, Crosshair, Shield, Zap, Gem, Lock, Palette } from 'lucide-react';

interface LoadoutMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoadoutMenu: React.FC<LoadoutMenuProps> = ({ isOpen, onClose }) => {
  const { players, gems, unlockedWeapons, unlockedAbilities, unlockedSkins, selectedSkins, setWeapon, setAbility, buyWeapon, buyAbility, buySkin, setSkin, syncUserStats } = useGameStore();
  const player = players[0]; // Assume single player for now
  const [activeTab, setActiveTab] = useState<'WEAPONS' | 'ABILITIES' | 'SKINS'>('WEAPONS');

  if (!player) return null;

  const renderWeaponCategory = (type: WeaponType, slot: number) => {
    const categoryWeapons = Object.values(WEAPONS).filter(w => w.type === type && (w.id !== 'admin_blaster' || unlockedWeapons.includes('admin_blaster')));
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
          {categoryWeapons.map(weapon => {
            const isUnlocked = unlockedWeapons.includes(weapon.id);
            const price = WEAPON_PRICES[weapon.id] || 0;
            const canAfford = gems >= price;

            return (
              <div key={weapon.id} className="relative group">
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    setWeapon(player.id, slot, weapon.id);
                    syncUserStats();
                  }}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-start ${
                    currentWeaponId === weapon.id
                      ? 'bg-white text-black border-white'
                      : isUnlocked
                        ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                        : 'bg-white/2 text-white/20 border-white/5 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm tracking-tight">{weapon.name}</div>
                      {!isUnlocked && <Lock size={10} className="text-white/20" />}
                    </div>
                    <div className={`text-[10px] uppercase tracking-wider mt-1 ${
                      currentWeaponId === weapon.id ? 'text-black/60' : 'text-white/40'
                    }`}>
                      DMG: {weapon.damage} • MAG: {weapon.magazineSize}
                    </div>
                  </div>
                  {currentWeaponId === weapon.id && (
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse mt-2" />
                  )}
                </button>

                {!isUnlocked && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      buyWeapon(weapon.id);
                      syncUserStats();
                    }}
                    disabled={!canAfford}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      canAfford 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <Gem size={12} />
                    {price}
                  </button>
                )}
              </div>
            );
          })}
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
            const isUnlocked = unlockedAbilities.includes(ability.id);
            const isSelectedInOtherSlot = player.selectedAbilities.some((a, i) => a === ability.id && i !== slot);
            const price = ABILITY_PRICES[ability.id] || 0;
            const canAfford = gems >= price;

            return (
              <div key={ability.id} className="relative group">
                <button
                  disabled={isSelectedInOtherSlot || !isUnlocked}
                  onClick={() => {
                    setAbility(player.id, slot, ability.id);
                    syncUserStats();
                  }}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex justify-between items-start ${
                    currentAbilityId === ability.id
                      ? 'bg-cyan-500 text-black border-cyan-400'
                      : isSelectedInOtherSlot 
                        ? 'bg-white/2 opacity-20 cursor-not-allowed border-transparent'
                        : isUnlocked
                          ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                          : 'bg-white/2 text-white/20 border-white/5 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm tracking-tight">{ability.name}</div>
                      {!isUnlocked && <Lock size={10} className="text-white/20" />}
                    </div>
                    <div className={`text-[10px] uppercase tracking-wider mt-1 ${
                      currentAbilityId === ability.id ? 'text-black/60' : 'text-white/40'
                    }`}>
                      {ability.description}
                    </div>
                  </div>
                  {currentAbilityId === ability.id && (
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse mt-2" />
                  )}
                </button>

                {!isUnlocked && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      buyAbility(ability.id);
                      syncUserStats();
                    }}
                    disabled={!canAfford}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      canAfford 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <Gem size={12} />
                    {price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSkins = () => {
    const allSkins = Object.values(SKINS);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(WEAPONS).map(weapon => {
          const weaponSkins = allSkins.filter(s => s.weaponId === weapon.id);
          const currentSkinId = selectedSkins[weapon.id];

          return (
            <div key={weapon.id} className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                {weapon.name}
              </h3>
              
              <div className="space-y-2">
                {/* Default Skin */}
                <button
                  onClick={() => {
                    setSkin(weapon.id, null);
                    syncUserStats();
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex justify-between items-center ${
                    !currentSkinId 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>Default Skin</span>
                  {!currentSkinId && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </button>

                {/* Custom Skins */}
                {weaponSkins.map(skin => {
                  const isUnlocked = unlockedSkins.includes(skin.id);
                  const isSelected = currentSkinId === skin.id;
                  const canAfford = gems >= skin.price;

                  return (
                    <div key={skin.id} className="relative">
                      <button
                        disabled={!isUnlocked}
                        onClick={() => {
                          setSkin(weapon.id, skin.id);
                          syncUserStats();
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex justify-between items-center ${
                          isSelected
                            ? 'bg-white text-black border-white'
                            : isUnlocked
                              ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                              : 'bg-white/2 text-white/20 border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: skin.color }} />
                          <span>{skin.name}</span>
                          {!isUnlocked && <Lock size={10} className="text-white/20" />}
                        </div>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </button>

                      {!isUnlocked && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            buySkin(skin.id);
                            syncUserStats();
                          }}
                          disabled={!canAfford}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest transition-all ${
                            canAfford 
                              ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
                              : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          <Gem size={10} />
                          {skin.price}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8"
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
                  <button 
                    onClick={() => setActiveTab('SKINS')}
                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'SKINS' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    Skins
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl">
                  <Gem size={20} className="text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-emerald-400 font-bold text-xl leading-none">{gems}</span>
                    <span className="text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold">Gems</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'WEAPONS' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {renderWeaponCategory('PRIMARY', 0)}
                  {renderWeaponCategory('SECONDARY', 1)}
                  {renderWeaponCategory('MELEE', 2)}
                </div>
              ) : activeTab === 'ABILITIES' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {renderAbilitySlot(0)}
                  {renderAbilitySlot(1)}
                  {renderAbilitySlot(2)}
                </div>
              ) : (
                renderSkins()
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
