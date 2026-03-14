import { create } from 'zustand';
import { soundManager } from '../services/SoundManager';

export type WeaponType = 'PRIMARY' | 'SECONDARY' | 'MELEE';

export interface WeaponStats {
  id: string;
  name: string;
  type: WeaponType;
  damage: number;
  fireRate: number;
  recoil: number;
  magazineSize: number;
  reloadTime: number;
  projectileSpeed?: number;
  isAutomatic?: boolean;
  isEnergy?: boolean;
  isExplosive?: boolean;
  isMelee?: boolean;
}

export const WEAPONS: Record<string, WeaponStats> = {
  'ak47': { id: 'ak47', name: 'AK-47', type: 'PRIMARY', damage: 10, fireRate: 0.1, recoil: 0.05, magazineSize: 30, reloadTime: 2, isAutomatic: true },
  'shark': { id: 'shark', name: 'Shark Blaster', type: 'PRIMARY', damage: 35, fireRate: 0.5, recoil: 0.03, magazineSize: 20, reloadTime: 2.5, isEnergy: true, projectileSpeed: 50 },
  'sniper': { id: 'sniper', name: 'Sniper', type: 'PRIMARY', damage: 100, fireRate: 1.5, recoil: 0.2, magazineSize: 5, reloadTime: 3.5, projectileSpeed: 200 },
  'candy': { id: 'candy', name: 'Candy Blaster', type: 'PRIMARY', damage: 20, fireRate: 0.5, recoil: 0.02, magazineSize: 40, reloadTime: 1.8, isEnergy: true, projectileSpeed: 40 },
  'dual': { id: 'dual', name: 'Dual Energy Blasters', type: 'SECONDARY', damage: 15, fireRate: 0.5, recoil: 0.02, magazineSize: 30, reloadTime: 1.5, isEnergy: true },
  'pistol': { id: 'pistol', name: 'Pistol', type: 'SECONDARY', damage: 20, fireRate: 0.5, recoil: 0.03, magazineSize: 12, reloadTime: 1.2 },
  'pumpkin': { id: 'pumpkin', name: 'Pumpkin Powerer', type: 'SECONDARY', damage: 60, fireRate: 1.0, recoil: 0.1, magazineSize: 3, reloadTime: 3, isExplosive: true, projectileSpeed: 30 },
  'c4': { id: 'c4', name: 'C4', type: 'SECONDARY', damage: 120, fireRate: 2.0, recoil: 0, magazineSize: 1, reloadTime: 4, isExplosive: true },
  'knife': { id: 'knife', name: 'Knife', type: 'MELEE', damage: 50, fireRate: 0.5, recoil: 0, magazineSize: 1, reloadTime: 0, isMelee: true },
  'karambit': { id: 'karambit', name: 'Karambit', type: 'MELEE', damage: 45, fireRate: 0.5, recoil: 0, magazineSize: 1, reloadTime: 0, isMelee: true },
  'radiant': { id: 'radiant', name: 'Radiant Daggers', type: 'MELEE', damage: 40, fireRate: 0.5, recoil: 0, magazineSize: 1, reloadTime: 0, isMelee: true },
  'katana': { id: 'katana', name: 'Katana', type: 'MELEE', damage: 70, fireRate: 0.7, recoil: 0, magazineSize: 1, reloadTime: 0, isMelee: true },
};

export type AbilityType = 'SPEED' | 'REWIND' | 'SHIELD' | 'STUN';

export interface AbilityStats {
  id: AbilityType;
  name: string;
  cooldown: number;
  duration: number;
}

export const ABILITIES: Record<AbilityType, AbilityStats> = {
  'SPEED': { id: 'SPEED', name: 'Speed Boost', cooldown: 10, duration: 5 },
  'REWIND': { id: 'REWIND', name: 'Time Rewind', cooldown: 15, duration: 0.1 },
  'SHIELD': { id: 'SHIELD', name: 'Shield', cooldown: 20, duration: 6 },
  'STUN': { id: 'STUN', name: 'Stun Pulse', cooldown: 12, duration: 0.5 },
};

export interface PlayerState {
  id: number;
  health: number;
  maxHealth: number;
  score: number;
  currentWeaponSlot: number; // 0: primary, 1: secondary, 2: melee
  weapons: string[]; // IDs
  ammo: Record<string, number>;
  abilityCooldowns: Record<AbilityType, number>;
  activeAbilities: Record<AbilityType, number>;
  positionHistory: [number, number, number][];
  isDead: boolean;
  isSliding: boolean;
  isADS: boolean;
  lastDamageTime: number;
  reloadingUntil: number;
}

export type GameMode = 'SINGLE' | 'TWO_PLAYER';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type MapType = 'NEON' | 'CYBER' | 'VOID';

export interface BotState {
  id: string;
  health: number;
  position: [number, number, number];
  lastDamageTime: number;
  isStunned: boolean;
}

interface GameStore {
  mode: GameMode;
  difficulty: Difficulty;
  selectedMap: MapType;
  gameState: 'MENU' | 'PLAYING' | 'VICTORY' | 'DEFEAT' | 'TUTORIAL';
  players: PlayerState[];
  bots: BotState[];
  botCount: number;
  scoreLimit: number;
  playerPositions: Record<number, [number, number, number]>;
  hitMarker: { active: boolean; playerId: number };
  muzzleFlash: { active: boolean; playerId: number };
  impacts: { id: string; position: [number, number, number]; color: string; isExplosion?: boolean; ownerId?: number; radius?: number; damagePerSecond?: number }[];
  tracers: { id: string; start: [number, number, number]; end: [number, number, number] }[];
  projectiles: { id: string; position: [number, number, number]; velocity: [number, number, number]; ownerId: number; weaponId: string }[];
  isLoadoutOpen: boolean;
  
  setMode: (mode: GameMode) => void;
  setDifficulty: (diff: Difficulty) => void;
  setMap: (map: MapType) => void;
  startGame: () => void;
  startTutorial: () => void;
  resetGame: () => void;
  damagePlayer: (id: number, amount: number) => void;
  damageBot: (id: string, amount: number, sourcePlayerId: number, impactPos?: [number, number, number]) => void;
  addScore: (playerId: number, amount: number) => void;
  useAbility: (playerId: number, ability: AbilityType) => void;
  reloadWeapon: (playerId: number) => void;
  switchWeapon: (playerId: number, slot: number) => void;
  setADS: (playerId: number, isADS: boolean) => void;
  setSliding: (playerId: number, isSliding: boolean) => void;
  updatePlayerPosition: (id: number, pos: [number, number, number]) => void;
  updateBotPosition: (id: string, pos: [number, number, number]) => void;
  tick: (delta: number) => void;
  triggerHitMarker: (playerId: number) => void;
  triggerMuzzleFlash: (playerId: number) => void;
  addImpact: (position: [number, number, number], color: string, isExplosion?: boolean, ownerId?: number, radius?: number, damagePerSecond?: number) => void;
  addTracer: (start: [number, number, number], end: [number, number, number]) => void;
  addProjectile: (projectile: { position: [number, number, number]; velocity: [number, number, number]; ownerId: number; weaponId: string }) => void;
  updateProjectiles: (delta: number) => void;
  setWeapon: (playerId: number, slot: number, weaponId: string) => void;
  setLoadoutOpen: (open: boolean) => void;
}

const createInitialPlayer = (id: number): PlayerState => ({
  id,
  health: 100,
  maxHealth: 100,
  score: 0,
  currentWeaponSlot: 0,
  weapons: ['ak47', 'pistol', 'knife'],
  ammo: { 'ak47': 30, 'pistol': 12, 'shark': 20, 'sniper': 5, 'candy': 40, 'dual': 30, 'pumpkin': 3, 'c4': 1, 'karambit': 1, 'radiant': 1, 'katana': 1 },
  abilityCooldowns: { SPEED: 0, REWIND: 0, SHIELD: 0, STUN: 0 },
  activeAbilities: { SPEED: 0, REWIND: 0, SHIELD: 0, STUN: 0 },
  positionHistory: [],
  isDead: false,
  isSliding: false,
  isADS: false,
  lastDamageTime: 0,
  reloadingUntil: 0,
});

export const useGameStore = create<GameStore>((set) => ({
  mode: 'SINGLE',
  difficulty: 'MEDIUM',
  selectedMap: 'NEON',
  gameState: 'MENU',
  players: [createInitialPlayer(0)],
  bots: [],
  botCount: 5,
  scoreLimit: 1000,
  playerPositions: {},
  hitMarker: { active: false, playerId: -1 },
  muzzleFlash: { active: false, playerId: -1 },
  impacts: [],
  tracers: [],
  projectiles: [],
  isLoadoutOpen: false,

  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setMap: (selectedMap) => set({ selectedMap }),
  
  startGame: () => set((state) => {
    const existingPlayer = state.players[0] || createInitialPlayer(0);
    const players = state.mode === 'SINGLE' 
      ? [existingPlayer] 
      : [existingPlayer, createInitialPlayer(1)];
    
    return {
      gameState: 'PLAYING',
      players,
      bots: Array.from({ length: state.botCount }).map((_, i) => {
        const angle = (i / state.botCount) * Math.PI * 2;
        const radius = 30 + Math.random() * 20;
        return {
          id: `bot-${i}`,
          health: 100,
          position: [Math.cos(angle) * radius, 2, Math.sin(angle) * radius],
          lastDamageTime: 0,
          isStunned: false
        };
      }),
      playerPositions: {},
    };
  }),

  startTutorial: () => set(() => ({
    gameState: 'TUTORIAL',
    players: [createInitialPlayer(0)],
    bots: [],
    playerPositions: {},
  })),

  resetGame: () => set({ gameState: 'MENU', players: [], bots: [], playerPositions: {} }),

  damagePlayer: (id, amount) => set((state) => {
    const player = state.players.find(p => p.id === id);
    if (!player || player.isDead) return {};

    // Shield check
    if (player.activeAbilities.SHIELD > 0) return {};

    const now = Date.now();
    if (now - player.lastDamageTime < 1000) return {};

    soundManager.playBotDamage(); // Reuse for player damage for now
    
    const isDead = player.health - amount <= 0;
    const updatedPlayers = state.players.map(p => p.id === id ? { 
      ...p, 
      health: Math.max(0, p.health - amount), 
      isDead: isDead,
      lastDamageTime: now
    } : p);

    if (isDead) {
      return {
        players: updatedPlayers,
        gameState: 'DEFEAT'
      };
    }
    
    return {
      players: updatedPlayers
    };
  }),

  damageBot: (id, amount, sourcePlayerId, impactPos) => set((state) => {
    const bot = state.bots.find(b => b.id === id);
    if (!bot || bot.health <= 0) return {};

    const now = Date.now();
    const newHealth = Math.max(0, bot.health - amount);
    const newBots = state.bots.map(b => b.id === id ? { ...b, health: newHealth, lastDamageTime: now } : b);
    
    soundManager.playBotDamage();
    soundManager.playHit();
    
    let newState: any = { bots: newBots };

    if (impactPos) {
      const impactId = Math.random().toString();
      newState.impacts = [...state.impacts, { id: impactId, position: impactPos, color: 'yellow' }];
      setTimeout(() => {
        set(s => ({ impacts: s.impacts.filter(i => i.id !== impactId) }));
      }, 500);
    }

    if (newHealth <= 0) {
      soundManager.playExplosion();
      const updatedPlayers = state.players.map(p => p.id === sourcePlayerId ? { ...p, score: p.score + 100 } : p);
      
      // Check if all bots are dead
      const allBotsDead = newBots.every(b => b.health <= 0);
      
      if (allBotsDead) {
        return { 
          bots: newBots, 
          players: updatedPlayers,
          gameState: 'VICTORY' 
        };
      }
      
      return { bots: newBots, players: updatedPlayers };
    }

    return newState;
  }),

  addScore: (playerId, amount) => set((state) => {
    const newPlayers = state.players.map(p => p.id === playerId ? { ...p, score: p.score + amount } : p);
    const totalScore = newPlayers.reduce((acc, p) => acc + p.score, 0);
    if (totalScore >= state.scoreLimit) {
      return { players: newPlayers, gameState: 'VICTORY' };
    }
    return { players: newPlayers };
  }),

  useAbility: (playerId, ability) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isDead || player.abilityCooldowns[ability] > 0) return {};

    const abilityStats = ABILITIES[ability];
    let newState: any = {
      players: state.players.map(p => p.id === playerId ? {
        ...p,
        abilityCooldowns: { ...p.abilityCooldowns, [ability]: abilityStats.cooldown },
        activeAbilities: { ...p.activeAbilities, [ability]: abilityStats.duration }
      } : p)
    };

    // Special logic for instant abilities
    if (ability === 'REWIND') {
      const history = player.positionHistory;
      if (history.length > 0) {
        // Teleport back to 3 seconds ago (approx 180 frames at 60fps)
        const targetPos = history[0];
        newState.playerPositions = { ...state.playerPositions, [playerId]: targetPos };
        // We'll need the Player component to react to this position change
        // For now, we just update the store's position
      }
    }

    if (ability === 'STUN') {
      // Stun nearby bots
      const playerPos = state.playerPositions[playerId];
      if (playerPos) {
        newState.bots = state.bots.map(bot => {
          const dx = bot.position[0] - playerPos[0];
          const dy = bot.position[1] - playerPos[1];
          const dz = bot.position[2] - playerPos[2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < 15) {
            return { ...bot, isStunned: true };
          }
          return bot;
        });
        
        // Clear stun after 3 seconds
        setTimeout(() => {
          set(s => ({
            bots: s.bots.map(b => ({ ...b, isStunned: false }))
          }));
        }, 3000);
      }
    }

    return newState;
  }),

  reloadWeapon: (playerId) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isDead || Date.now() < player.reloadingUntil) return {};

    const weaponId = player.weapons[player.currentWeaponSlot];
    const weapon = WEAPONS[weaponId];
    
    soundManager.playReload();
    
    setTimeout(() => {
      set((s) => ({
        players: s.players.map(p => {
          if (p.id !== playerId) return p;
          const wId = p.weapons[p.currentWeaponSlot];
          return { ...p, ammo: { ...p.ammo, [wId]: WEAPONS[wId].magazineSize } };
        })
      }));
    }, weapon.reloadTime * 1000);

    return {
      players: state.players.map(p => {
        if (p.id !== playerId) return p;
        return { 
          ...p, 
          reloadingUntil: Date.now() + (weapon.reloadTime * 1000)
        };
      })
    };
  }),

  switchWeapon: (playerId, slot) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, currentWeaponSlot: slot } : p)
  })),

  setADS: (playerId, isADS) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, isADS } : p)
  })),

  setSliding: (playerId, isSliding) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, isSliding } : p)
  })),

  updatePlayerPosition: (id, pos) => set((state) => ({
    playerPositions: { ...state.playerPositions, [id]: pos },
    players: state.players.map(p => p.id === id ? {
      ...p,
      positionHistory: [...p.positionHistory.slice(-180), pos] // Keep last 3 seconds at 60fps
    } : p)
  })),

  updateBotPosition: (id, pos) => set((state) => ({
    bots: state.bots.map(b => b.id === id ? { ...b, position: pos } : b)
  })),

  tick: (delta) => set((state) => {
    // Update projectiles
    const newProjectiles = state.projectiles.map(p => ({
      ...p,
      position: [
        p.position[0] + p.velocity[0] * delta,
        p.position[1] + p.velocity[1] * delta,
        p.position[2] + p.velocity[2] * delta
      ] as [number, number, number]
    })).filter(p => {
      const dist = Math.sqrt(p.position[0]**2 + p.position[1]**2 + p.position[2]**2);
      return dist < 200;
    });

    // Explosion damage logic
    state.impacts.forEach(impact => {
      if (impact.isExplosion && impact.radius && impact.damagePerSecond && impact.ownerId !== undefined) {
        const damage = impact.damagePerSecond * delta;
        
        // Damage bots
        state.bots.forEach(bot => {
          if (bot.health <= 0) return;
          const dist = Math.sqrt(
            (bot.position[0] - impact.position[0])**2 +
            (bot.position[1] - impact.position[1])**2 +
            (bot.position[2] - impact.position[2])**2
          );
          if (dist <= impact.radius) {
            // We can't call damageBot directly here because we are inside a set()
            // But we can update the bots array in the new state
          }
        });
      }
    });

    // Actually, it's better to calculate the new bots/players state here
    let nextBots = [...state.bots];
    let nextPlayers = [...state.players];

    state.impacts.forEach(impact => {
      if (impact.isExplosion && impact.radius && impact.damagePerSecond && impact.ownerId !== undefined) {
        const damage = impact.damagePerSecond * delta;
        
        nextBots = nextBots.map(bot => {
          if (bot.health <= 0) return bot;
          const dist = Math.sqrt(
            (bot.position[0] - impact.position[0])**2 +
            (bot.position[1] - impact.position[1])**2 +
            (bot.position[2] - impact.position[2])**2
          );
          if (dist <= impact.radius) {
            const newHealth = Math.max(0, bot.health - damage);
            if (newHealth <= 0 && bot.health > 0) {
              // Bot died from explosion
              nextPlayers = nextPlayers.map(p => p.id === impact.ownerId ? { ...p, score: p.score + 100 } : p);
            }
            return { ...bot, health: newHealth, lastDamageTime: Date.now() };
          }
          return bot;
        });

        nextPlayers = nextPlayers.map(player => {
          if (player.isDead || player.id === impact.ownerId) return player;
          const playerPos = state.playerPositions[player.id];
          if (!playerPos) return player;
          
          const dist = Math.sqrt(
            (playerPos[0] - impact.position[0])**2 +
            (playerPos[1] - impact.position[1])**2 +
            (playerPos[2] - impact.position[2])**2
          );
          if (dist <= impact.radius) {
            return { ...player, health: Math.max(0, player.health - damage), lastDamageTime: Date.now() };
          }
          return player;
        });
      }
    });

    return {
      projectiles: newProjectiles,
      bots: nextBots,
      players: nextPlayers.map(p => ({
        ...p,
        abilityCooldowns: {
          SPEED: Math.max(0, p.abilityCooldowns.SPEED - delta),
          REWIND: Math.max(0, p.abilityCooldowns.REWIND - delta),
          SHIELD: Math.max(0, p.abilityCooldowns.SHIELD - delta),
          STUN: Math.max(0, p.abilityCooldowns.STUN - delta),
        },
        activeAbilities: {
          SPEED: Math.max(0, p.activeAbilities.SPEED - delta),
          REWIND: Math.max(0, p.activeAbilities.REWIND - delta),
          SHIELD: Math.max(0, p.activeAbilities.SHIELD - delta),
          STUN: Math.max(0, p.activeAbilities.STUN - delta),
        }
      }))
    };
  }),

  triggerHitMarker: (playerId) => {
    set({ hitMarker: { active: true, playerId } });
    setTimeout(() => set({ hitMarker: { active: false, playerId: -1 } }), 100);
  },

  triggerMuzzleFlash: (playerId) => {
    set({ muzzleFlash: { active: true, playerId } });
    setTimeout(() => set({ muzzleFlash: { active: false, playerId: -1 } }), 50);
  },

  addImpact: (position, color, isExplosion, ownerId, radius, damagePerSecond) => set((state) => {
    const id = Math.random().toString();
    const newImpacts = [...state.impacts, { id, position, color, isExplosion, ownerId, radius, damagePerSecond }];
    setTimeout(() => {
      set(s => ({ impacts: s.impacts.filter(i => i.id !== id) }));
    }, isExplosion ? 1000 : 500);
    return { impacts: newImpacts };
  }),

  addTracer: (start: [number, number, number], end: [number, number, number]) => set((state) => {
    const id = Math.random().toString();
    const newTracers = [...state.tracers, { id, start, end }];
    setTimeout(() => {
      set(s => ({ tracers: s.tracers.filter(t => t.id !== id) }));
    }, 100);
    return { tracers: newTracers };
  }),

  addProjectile: (projectile) => set((state) => ({
    projectiles: [...state.projectiles, { ...projectile, id: Math.random().toString() }]
  })),

  updateProjectiles: (delta) => set((state) => {
    const newProjectiles = state.projectiles.map(p => ({
      ...p,
      position: [
        p.position[0] + p.velocity[0] * delta,
        p.position[1] + p.velocity[1] * delta,
        p.position[2] + p.velocity[2] * delta
      ] as [number, number, number]
    })).filter(p => {
      // Remove projectiles that go too far
      const dist = Math.sqrt(p.position[0]**2 + p.position[1]**2 + p.position[2]**2);
      return dist < 200;
    });
    return { projectiles: newProjectiles };
  }),

  setWeapon: (playerId, slot, weaponId) => set((state) => ({
    players: state.players.map(p => {
      if (p.id !== playerId) return p;
      const newWeapons = [...p.weapons];
      newWeapons[slot] = weaponId;
      return { 
        ...p, 
        weapons: newWeapons,
        // Reset ammo for the new weapon
        ammo: { ...p.ammo, [weaponId]: WEAPONS[weaponId].magazineSize }
      };
    })
  })),
  setLoadoutOpen: (isLoadoutOpen) => set({ isLoadoutOpen }),
}));
