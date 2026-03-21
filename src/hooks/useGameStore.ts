import { create } from 'zustand';
import { Vector3 } from 'three';
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

export type AbilityType = 'GRAPPLE' | 'VOLT' | 'ORB' | 'KUNAI' | 'ARCANE_FIST' | 'SCYTHE' | 'SPEED' | 'REWIND' | 'SHIELD' | 'STUN';

export interface AbilityStats {
  id: AbilityType;
  name: string;
  description: string;
  cooldown: number;
  duration: number;
}

export const ABILITIES: Record<AbilityType, AbilityStats> = {
  'GRAPPLE': { id: 'GRAPPLE', name: 'Grapple Hook', description: 'Pull yourself towards surfaces', cooldown: 5, duration: 2.0 },
  'VOLT': { id: 'VOLT', name: 'Volt Chain', description: 'Chain lightning between enemies', cooldown: 12, duration: 0.2 },
  'ORB': { id: 'ORB', name: 'Gravity Orb', description: 'Pull enemies into a vortex', cooldown: 15, duration: 3 },
  'KUNAI': { id: 'KUNAI', name: 'Kunai Storm', description: 'Throw a volley of kunai', cooldown: 8, duration: 0.5 },
  'ARCANE_FIST': { id: 'ARCANE_FIST', name: 'Arcane Fist', description: 'Dash forward and oneshot enemies', cooldown: 6, duration: 0.3 },
  'SCYTHE': { id: 'SCYTHE', name: 'Ghost Scythe', description: 'Dash forward and slash enemies for 50% health', cooldown: 4, duration: 0.4 },
  'SPEED': { id: 'SPEED', name: 'Speed Boost', description: 'Increase movement speed', cooldown: 10, duration: 5 },
  'REWIND': { id: 'REWIND', name: 'Time Rewind', description: 'Return to previous position', cooldown: 15, duration: 0.1 },
  'SHIELD': { id: 'SHIELD', name: 'Energy Shield', description: 'Block incoming damage', cooldown: 20, duration: 6 },
  'STUN': { id: 'STUN', name: 'Stun Pulse', description: 'Stun nearby enemies', cooldown: 12, duration: 0.5 },
};

export interface PlayerState {
  id: number;
  health: number;
  maxHealth: number;
  score: number;
  currentWeaponSlot: number; // 0: primary, 1: secondary, 2: melee
  weapons: string[]; // IDs
  ammo: Record<string, number>;
  abilityCooldowns: Record<string, number>;
  activeAbilities: Record<string, number>;
  selectedAbilities: AbilityType[]; // 3 slots
  positionHistory: [number, number, number][];
  isDead: boolean;
  isSliding: boolean;
  isADS: boolean;
  lastDamageTime: number;
  reloadingUntil: number;
  grappleData: { active: boolean; target: [number, number, number] | null };
  dashRequest: [number, number, number] | null;
}

export type GameMode = 'SINGLE' | 'TWO_PLAYER';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type MapType = 'NEON' | 'CYBER' | 'VOID';

export interface BotState {
  id: string;
  health: number;
  position: [number, number, number];
  lastDamageTime: number;
  lastScytheHit: number;
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
  useAbility: (playerId: number, ability: AbilityType, direction?: [number, number, number]) => void;
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
  removeImpact: (id: string) => void;
  addTracer: (start: [number, number, number], end: [number, number, number]) => void;
  addProjectile: (projectile: { position: [number, number, number]; velocity: [number, number, number]; ownerId: number; weaponId: string }) => void;
  updateProjectiles: (delta: number) => void;
  setBots: (bots: BotState[]) => void;
  setWeapon: (playerId: number, slot: number, weaponId: string) => void;
  setAbility: (playerId: number, slot: number, abilityId: AbilityType) => void;
  setGrapple: (playerId: number, active: boolean, target: [number, number, number] | null) => void;
  setLoadoutOpen: (open: boolean) => void;
}

const LOADOUT_KEY = 'neon_arena_loadout';

const loadSavedLoadout = () => {
  try {
    const saved = localStorage.getItem(LOADOUT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load loadout', e);
  }
  return null;
};

const saveLoadout = (weapons: string[], abilities: AbilityType[]) => {
  try {
    localStorage.setItem(LOADOUT_KEY, JSON.stringify({ weapons, abilities }));
  } catch (e) {
    console.error('Failed to save loadout', e);
  }
};

const createInitialPlayer = (id: number): PlayerState => {
  const saved = loadSavedLoadout();
  return {
    id,
    health: 100,
    maxHealth: 100,
    score: 0,
    currentWeaponSlot: 0,
    weapons: (id === 0 && saved?.weapons) ? saved.weapons : ['ak47', 'pistol', 'knife'],
    ammo: { 'ak47': 30, 'pistol': 12, 'shark': 20, 'sniper': 5, 'candy': 40, 'dual': 30, 'pumpkin': 3, 'c4': 1, 'karambit': 1, 'radiant': 1, 'katana': 1 },
    abilityCooldowns: {},
    activeAbilities: {},
    selectedAbilities: (id === 0 && saved?.abilities) ? saved.abilities : ['SPEED', 'REWIND', 'SHIELD'],
    positionHistory: [],
    isDead: false,
    isSliding: false,
    isADS: false,
    lastDamageTime: 0,
    reloadingUntil: 0,
    grappleData: { active: false, target: null },
    dashRequest: null,
  };
};

export const EMPTY_ARRAY: any[] = [];

export const useGameStore = create<GameStore>((set, get) => ({
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
          lastScytheHit: 0,
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
    if (!player || player.isDead) return state;

    // Shield check
    if (player.activeAbilities.SHIELD > 0) return state;

    const now = Date.now();
    if (now - player.lastDamageTime < 1000) return state;

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
    if (!bot || bot.health <= 0) return state;

    const now = Date.now();
    const newHealth = Math.max(0, bot.health - amount);
    if (newHealth === bot.health && !impactPos) return state;

    const newBots = state.bots.map(b => b.id === id ? { ...b, health: newHealth, lastDamageTime: now } : b);
    
    soundManager.playBotDamage();
    soundManager.playHit();
    
    let newState: any = { bots: newBots };

    if (impactPos) {
      const impactId = Math.random().toString();
      newState.impacts = [...state.impacts, { id: impactId, position: impactPos, color: 'yellow' }];
      setTimeout(() => {
        get().removeImpact(impactId);
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

  useAbility: (playerId, ability, direction) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isDead || player.abilityCooldowns[ability] > 0) return state;

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
      }
    }

    if (ability === 'STUN' || ability === 'VOLT') {
      // Stun nearby bots
      const playerPos = state.playerPositions[playerId];
      if (playerPos) {
        newState.bots = state.bots.map(bot => {
          const dx = bot.position[0] - playerPos[0];
          const dy = bot.position[1] - playerPos[1];
          const dz = bot.position[2] - playerPos[2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < (ability === 'VOLT' ? 20 : 15)) {
            return { ...bot, isStunned: true };
          }
          return bot;
        });
        
        // Clear stun after 3 seconds
        setTimeout(() => {
          get().setBots(get().bots.map(b => ({ ...b, isStunned: false })));
        }, 3000);
      }
    }

    if (ability === 'ORB') {
      const playerPos = state.playerPositions[playerId];
      if (playerPos) {
        const impactId = Math.random().toString();
        const newImpact = { id: impactId, position: [playerPos[0], playerPos[1], playerPos[2]], color: 'purple', isExplosion: true, ownerId: playerId, radius: 20, damagePerSecond: 40 };
        setTimeout(() => {
          get().removeImpact(impactId);
        }, 3000);
        return {
          players: state.players.map(p => p.id === playerId ? {
            ...p,
            abilityCooldowns: { ...p.abilityCooldowns, [ability]: abilityStats.cooldown },
            activeAbilities: { ...p.activeAbilities, [ability]: abilityStats.duration }
          } : p),
          impacts: [...state.impacts, newImpact]
        };
      }
    }

    if (ability === 'KUNAI') {
      const playerPos = state.playerPositions[playerId];
      if (playerPos) {
        const baseDir = direction ? new Vector3(...direction) : new Vector3(0, 0, -1);
        const right = new Vector3(0, 1, 0).cross(baseDir).normalize();
        
        for (let i = -1; i <= 1; i++) {
          const spreadDir = baseDir.clone().add(right.clone().multiplyScalar(i * 0.2)).normalize();
          const velocity = spreadDir.multiplyScalar(50);
          
          get().addProjectile({
            position: [playerPos[0], playerPos[1] + 0.5, playerPos[2]],
            velocity: [velocity.x, velocity.y, velocity.z],
            ownerId: playerId,
            weaponId: 'kunai'
          });
        }
      }
    }

    if (ability === 'SCYTHE') {
      const playerPos = state.playerPositions[playerId];
      if (playerPos && direction) {
        const dashDir = new Vector3(...direction).normalize();
        const impactId = Math.random().toString();
        const newImpact = { id: impactId, position: [playerPos[0], playerPos[1], playerPos[2]], color: '#ff4444', isExplosion: true, ownerId: playerId, radius: 6, damagePerSecond: 0 };
        setTimeout(() => {
          get().removeImpact(impactId);
        }, 500);
        
        return {
          players: state.players.map(p => p.id === playerId ? {
            ...p,
            abilityCooldowns: { ...p.abilityCooldowns, [ability]: abilityStats.cooldown },
            activeAbilities: { ...p.activeAbilities, [ability]: abilityStats.duration },
            dashRequest: [dashDir.x * 40, dashDir.y * 3, dashDir.z * 40]
          } : p),
          impacts: [...state.impacts, newImpact]
        };
      }
    }

    if (ability === 'ARCANE_FIST') {
      const playerPos = state.playerPositions[playerId];
      if (playerPos && direction) {
        const dashDir = new Vector3(...direction).normalize();
        const impactId = Math.random().toString();
        const newImpact = { id: impactId, position: [playerPos[0], playerPos[1], playerPos[2]], color: '#a020f0', isExplosion: true, ownerId: playerId, radius: 4, damagePerSecond: 0 };
        setTimeout(() => {
          get().removeImpact(impactId);
        }, 500);
        
        return {
          players: state.players.map(p => p.id === playerId ? {
            ...p,
            abilityCooldowns: { ...p.abilityCooldowns, [ability]: abilityStats.cooldown },
            activeAbilities: { ...p.activeAbilities, [ability]: abilityStats.duration },
            dashRequest: [dashDir.x * 50, dashDir.y * 5, dashDir.z * 50]
          } : p),
          impacts: [...state.impacts, newImpact]
        };
      }
    }

    return newState;
  }),

  reloadWeapon: (playerId) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isDead || Date.now() < player.reloadingUntil) return state;

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

  switchWeapon: (playerId, slot) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.currentWeaponSlot === slot) return state;
    return {
      players: state.players.map(p => p.id === playerId ? { ...p, currentWeaponSlot: slot } : p)
    };
  }),

  setADS: (playerId, isADS) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isADS === isADS) return state;
    return {
      players: state.players.map(p => p.id === playerId ? { ...p, isADS } : p)
    };
  }),

  setSliding: (playerId, isSliding) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isSliding === isSliding) return state;
    return {
      players: state.players.map(p => p.id === playerId ? { ...p, isSliding } : p)
    };
  }),

  updatePlayerPosition: (id, pos) => set((state) => {
    const player = state.players.find(p => p.id === id);
    if (!player) return state;
    
    // Only update if position changed significantly to reduce state updates
    const lastPos = player.positionHistory[player.positionHistory.length - 1];
    if (lastPos && 
        Math.abs(pos[0] - lastPos[0]) < 0.001 && 
        Math.abs(pos[1] - lastPos[1]) < 0.001 && 
        Math.abs(pos[2] - lastPos[2]) < 0.001) {
      return state;
    }

    const lastGlobalPos = state.playerPositions[id];
    const globalPosChanged = !lastGlobalPos || 
                             Math.abs(pos[0] - lastGlobalPos[0]) > 0.001 || 
                             Math.abs(pos[1] - lastGlobalPos[1]) > 0.001 || 
                             Math.abs(pos[2] - lastGlobalPos[2]) > 0.001;

    const newState: any = {
      players: state.players.map(p => p.id === id ? {
        ...p,
        positionHistory: [...p.positionHistory.slice(-180), pos] // Keep last 3 seconds at 60fps
      } : p)
    };

    if (globalPosChanged) {
      newState.playerPositions = { ...state.playerPositions, [id]: pos };
    }

    return newState;
  }),

  updateBotPosition: (id, pos) => set((state) => {
    const bot = state.bots.find(b => b.id === id);
    if (!bot) return state;

    // Only update if position changed significantly
    if (Math.abs(pos[0] - bot.position[0]) < 0.001 && 
        Math.abs(pos[1] - bot.position[1]) < 0.001 && 
        Math.abs(pos[2] - bot.position[2]) < 0.001) {
      return state;
    }

    return {
      bots: state.bots.map(b => b.id === id ? { ...b, position: pos } : b)
    };
  }),

  tick: (delta) => set((state) => {
    if (state.gameState !== 'PLAYING' && state.gameState !== 'TUTORIAL') return state;

    // Update projectiles
    let newProjectiles = state.projectiles;
    if (state.projectiles.length > 0) {
      newProjectiles = state.projectiles.map(p => ({
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
    }

    let nextBots = state.bots;
    let nextPlayers = state.players;
    let botsChanged = false;
    let playersChanged = false;

    // Explosion damage logic
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
            botsChanged = true;
            const newHealth = Math.max(0, bot.health - damage);
            if (newHealth <= 0 && bot.health > 0) {
              playersChanged = true;
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
            playersChanged = true;
            return { ...player, health: Math.max(0, player.health - damage), lastDamageTime: Date.now() };
          }
          return player;
        });
      }
    });

    // Update cooldowns
    const updatedPlayers = nextPlayers.map(p => {
      const hasCooldowns = Object.values(p.abilityCooldowns).some(v => v > 0);
      const hasAbilities = Object.values(p.activeAbilities).some(v => v > 0);
      
      if (!hasCooldowns && !hasAbilities) return p;
      
      playersChanged = true;
      
      const newCooldowns: Record<string, number> = {};
      Object.entries(p.abilityCooldowns).forEach(([k, v]) => {
        newCooldowns[k] = Math.max(0, v - delta);
      });
      
      const newActive: Record<string, number> = {};
      Object.entries(p.activeAbilities).forEach(([k, v]) => {
        newActive[k] = Math.max(0, v - delta);
      });

      const isGrappleEnding = p.grappleData.active && newActive.GRAPPLE === 0;

      let currentScore = p.score;
      // Arcane Fist Oneshot Logic
      if (newActive.ARCANE_FIST > 0) {
        const playerPos = state.playerPositions[p.id];
        if (playerPos) {
          nextBots = nextBots.map(bot => {
            if (bot.health <= 0) return bot;
            const dist = Math.sqrt(
              (bot.position[0] - playerPos[0])**2 +
              (bot.position[1] - playerPos[1])**2 +
              (bot.position[2] - playerPos[2])**2
            );
            if (dist < 5) {
              botsChanged = true;
              currentScore += 100;
              return { ...bot, health: 0, lastDamageTime: Date.now() };
            }
            return bot;
          });
        }
      }

      // Scythe Dash Damage Logic
      if (newActive.SCYTHE > 0) {
        const playerPos = state.playerPositions[p.id];
        if (playerPos) {
          nextBots = nextBots.map(bot => {
            if (bot.health <= 0) return bot;
            // Only damage if not recently damaged by scythe to prevent multi-hit in one dash
            const timeSinceLastScythe = Date.now() - (bot.lastScytheHit || 0);
            if (timeSinceLastScythe < 500) return bot;

            const dist = Math.sqrt(
              (bot.position[0] - playerPos[0])**2 +
              (bot.position[1] - playerPos[1])**2 +
              (bot.position[2] - playerPos[2])**2
            );
            if (dist < 6) {
              botsChanged = true;
              const damage = 50;
              const newHealth = Math.max(0, bot.health - damage);
              if (newHealth <= 0 && bot.health > 0) {
                currentScore += 100;
              }
              return { ...bot, health: newHealth, lastDamageTime: Date.now(), lastScytheHit: Date.now() };
            }
            return bot;
          });
        }
      }

      return {
        ...p,
        score: currentScore,
        abilityCooldowns: newCooldowns,
        activeAbilities: newActive,
        dashRequest: null, // Clear dash request after it's been processed by physics
        grappleData: isGrappleEnding ? { active: false, target: null } : p.grappleData
      };
    });

    const projectilesChanged = newProjectiles !== state.projectiles;
    const allBotsDead = nextBots.length > 0 && nextBots.every(b => b.health <= 0);
    const victoryTriggered = allBotsDead && state.gameState === 'PLAYING';

    if (!projectilesChanged && !botsChanged && !playersChanged && !victoryTriggered) return state;

    const newState: any = {};
    if (projectilesChanged) newState.projectiles = newProjectiles;
    if (botsChanged) newState.bots = nextBots;
    if (playersChanged) newState.players = updatedPlayers;
    if (victoryTriggered) newState.gameState = 'VICTORY';

    return newState;
  }),

  triggerHitMarker: (playerId) => {
    set({ hitMarker: { active: true, playerId } });
    setTimeout(() => set({ hitMarker: { active: false, playerId: -1 } }), 100);
  },

  triggerMuzzleFlash: (playerId) => {
    set({ muzzleFlash: { active: true, playerId } });
    setTimeout(() => set({ muzzleFlash: { active: false, playerId: -1 } }), 50);
  },

  removeImpact: (id) => set((state) => {
    const exists = state.impacts.some(i => i.id === id);
    if (!exists) return state;
    return {
      impacts: state.impacts.filter(i => i.id !== id)
    };
  }),

  addImpact: (position, color, isExplosion, ownerId, radius, damagePerSecond) => set((state) => {
    const id = Math.random().toString();
    const newImpacts = [...state.impacts, { id, position, color, isExplosion, ownerId, radius, damagePerSecond }];
    const duration = color === 'purple' ? 3000 : (isExplosion ? 1000 : 500);
    setTimeout(() => {
      get().removeImpact(id);
    }, duration);
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

  setBots: (bots) => set((state) => {
    if (state.bots === bots) return state;
    return { bots };
  }),

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

  setWeapon: (playerId, slot, weaponId) => set((state) => {
    const updatedPlayers = state.players.map(p => {
      if (p.id !== playerId) return p;
      const newWeapons = [...p.weapons];
      newWeapons[slot] = weaponId;
      
      if (playerId === 0) {
        saveLoadout(newWeapons, p.selectedAbilities);
      }
      
      return { 
        ...p, 
        weapons: newWeapons,
        ammo: { ...p.ammo, [weaponId]: WEAPONS[weaponId].magazineSize }
      };
    });
    return { players: updatedPlayers };
  }),

  setAbility: (playerId, slot, abilityId) => set((state) => {
    const updatedPlayers = state.players.map(p => {
      if (p.id !== playerId) return p;
      const newAbilities = [...p.selectedAbilities];
      newAbilities[slot] = abilityId;
      
      if (playerId === 0) {
        saveLoadout(p.weapons, newAbilities);
      }
      
      return { 
        ...p, 
        selectedAbilities: newAbilities 
      };
    });
    return { players: updatedPlayers };
  }),

  setGrapple: (playerId, active, target) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return state;
    if (player.grappleData.active === active && 
        JSON.stringify(player.grappleData.target) === JSON.stringify(target)) return state;
    return {
      players: state.players.map(p => p.id === playerId ? { ...p, grappleData: { active, target: target as [number, number, number] | null } } : p)
    };
  }),

  setLoadoutOpen: (isLoadoutOpen) => set((state) => {
    if (state.isLoadoutOpen === isLoadoutOpen) return state;
    return { isLoadoutOpen };
  }),
}));
