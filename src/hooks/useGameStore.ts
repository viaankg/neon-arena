import { create } from 'zustand';

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
  'ak47': { id: 'ak47', name: 'AK-47', type: 'PRIMARY', damage: 25, fireRate: 0.1, recoil: 0.05, magazineSize: 30, reloadTime: 2, isAutomatic: true },
  'shark': { id: 'shark', name: 'Shark Blaster', type: 'PRIMARY', damage: 35, fireRate: 0.2, recoil: 0.03, magazineSize: 20, reloadTime: 2.5, isEnergy: true, projectileSpeed: 50 },
  'sniper': { id: 'sniper', name: 'Sniper', type: 'PRIMARY', damage: 100, fireRate: 1.5, recoil: 0.2, magazineSize: 5, reloadTime: 3.5, projectileSpeed: 200 },
  'candy': { id: 'candy', name: 'Candy Blaster', type: 'PRIMARY', damage: 20, fireRate: 0.15, recoil: 0.02, magazineSize: 40, reloadTime: 1.8, isEnergy: true, projectileSpeed: 40 },
  'dual': { id: 'dual', name: 'Dual Energy Blasters', type: 'SECONDARY', damage: 15, fireRate: 0.1, recoil: 0.02, magazineSize: 30, reloadTime: 1.5, isEnergy: true },
  'pistol': { id: 'pistol', name: 'Pistol', type: 'SECONDARY', damage: 20, fireRate: 0.3, recoil: 0.03, magazineSize: 12, reloadTime: 1.2 },
  'pumpkin': { id: 'pumpkin', name: 'Pumpkin Powerer', type: 'SECONDARY', damage: 60, fireRate: 1.0, recoil: 0.1, magazineSize: 3, reloadTime: 3, isExplosive: true, projectileSpeed: 30 },
  'c4': { id: 'c4', name: 'C4', type: 'SECONDARY', damage: 120, fireRate: 2.0, recoil: 0, magazineSize: 1, reloadTime: 4, isExplosive: true },
  'knife': { id: 'knife', name: 'Knife', type: 'MELEE', damage: 50, fireRate: 0.5, recoil: 0, magazineSize: 1, reloadTime: 0, isMelee: true },
  'karambit': { id: 'karambit', name: 'Karambit', type: 'MELEE', damage: 45, fireRate: 0.4, recoil: 0, magazineSize: 1, reloadTime: 0, isMelee: true },
  'radiant': { id: 'radiant', name: 'Radiant Daggers', type: 'MELEE', damage: 40, fireRate: 0.3, recoil: 0, magazineSize: 1, reloadTime: 0, isMelee: true },
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
  'REWIND': { id: 'REWIND', name: 'Time Rewind', cooldown: 15, duration: 0 },
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
  isDead: boolean;
  isSliding: boolean;
  isADS: boolean;
}

export type GameMode = 'SINGLE' | 'TWO_PLAYER';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface BotState {
  id: string;
  health: number;
  position: [number, number, number];
}

interface GameStore {
  mode: GameMode;
  difficulty: Difficulty;
  gameState: 'MENU' | 'PLAYING' | 'VICTORY' | 'DEFEAT' | 'TUTORIAL';
  players: PlayerState[];
  bots: BotState[];
  botCount: number;
  scoreLimit: number;
  playerPositions: Record<number, [number, number, number]>;
  hitMarker: { active: boolean; playerId: number };
  muzzleFlash: { active: boolean; playerId: number };
  
  setMode: (mode: GameMode) => void;
  setDifficulty: (diff: Difficulty) => void;
  startGame: () => void;
  startTutorial: () => void;
  resetGame: () => void;
  damagePlayer: (id: number, amount: number) => void;
  damageBot: (id: string, amount: number, sourcePlayerId: number) => void;
  addScore: (playerId: number, amount: number) => void;
  useAbility: (playerId: number, ability: AbilityType) => void;
  reloadWeapon: (playerId: number) => void;
  switchWeapon: (playerId: number, slot: number) => void;
  setADS: (playerId: number, isADS: boolean) => void;
  setSliding: (playerId: number, isSliding: boolean) => void;
  updatePlayerPosition: (id: number, pos: [number, number, number]) => void;
  triggerHitMarker: (playerId: number) => void;
  triggerMuzzleFlash: (playerId: number) => void;
}

const createInitialPlayer = (id: number): PlayerState => ({
  id,
  health: 100,
  maxHealth: 100,
  score: 0,
  currentWeaponSlot: 0,
  weapons: ['ak47', 'pistol', 'knife'],
  ammo: { 'ak47': 30, 'pistol': 12, 'shark': 20, 'sniper': 5, 'candy': 40, 'dual': 30, 'pumpkin': 3, 'c4': 1 },
  abilityCooldowns: { SPEED: 0, REWIND: 0, SHIELD: 0, STUN: 0 },
  isDead: false,
  isSliding: false,
  isADS: false,
});

export const useGameStore = create<GameStore>((set) => ({
  mode: 'SINGLE',
  difficulty: 'MEDIUM',
  gameState: 'MENU',
  players: [],
  bots: [],
  botCount: 5,
  scoreLimit: 1000,
  playerPositions: {},
  hitMarker: { active: false, playerId: -1 },
  muzzleFlash: { active: false, playerId: -1 },

  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  
  startGame: () => set((state) => ({
    gameState: 'PLAYING',
    players: state.mode === 'SINGLE' ? [createInitialPlayer(0)] : [createInitialPlayer(0), createInitialPlayer(1)],
    bots: Array.from({ length: state.botCount }).map((_, i) => ({
      id: `bot-${i}`,
      health: 100,
      position: [Math.random() * 40 - 20, 2, Math.random() * 40 - 20]
    })),
    playerPositions: {},
  })),

  startTutorial: () => set(() => ({
    gameState: 'TUTORIAL',
    players: [createInitialPlayer(0)],
    bots: [],
    playerPositions: {},
  })),

  resetGame: () => set({ gameState: 'MENU', players: [], bots: [], playerPositions: {} }),

  damagePlayer: (id, amount) => set((state) => ({
    players: state.players.map(p => p.id === id ? { ...p, health: Math.max(0, p.health - amount), isDead: p.health - amount <= 0 } : p)
  })),

  damageBot: (id, amount, sourcePlayerId) => set((state) => {
    const newBots = state.bots.map(b => b.id === id ? { ...b, health: Math.max(0, b.health - amount) } : b);
    const bot = state.bots.find(b => b.id === id);
    if (bot && bot.health > 0 && bot.health - amount <= 0) {
      // Bot died
      const newPlayers = state.players.map(p => p.id === sourcePlayerId ? { ...p, score: p.score + 100 } : p);
      return { bots: newBots, players: newPlayers };
    }
    return { bots: newBots };
  }),

  addScore: (playerId, amount) => set((state) => {
    const newPlayers = state.players.map(p => p.id === playerId ? { ...p, score: p.score + amount } : p);
    const totalScore = newPlayers.reduce((acc, p) => acc + p.score, 0);
    if (totalScore >= state.scoreLimit) {
      return { players: newPlayers, gameState: 'VICTORY' };
    }
    return { players: newPlayers };
  }),

  useAbility: (playerId, ability) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? {
      ...p,
      abilityCooldowns: { ...p.abilityCooldowns, [ability]: ABILITIES[ability].cooldown }
    } : p)
  })),

  reloadWeapon: (playerId) => set((state) => ({
    players: state.players.map(p => {
      if (p.id !== playerId) return p;
      const weaponId = p.weapons[p.currentWeaponSlot];
      return { ...p, ammo: { ...p.ammo, [weaponId]: WEAPONS[weaponId].magazineSize } };
    })
  })),

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
    playerPositions: { ...state.playerPositions, [id]: pos }
  })),

  triggerHitMarker: (playerId) => {
    set({ hitMarker: { active: true, playerId } });
    setTimeout(() => set({ hitMarker: { active: false, playerId: -1 } }), 100);
  },

  triggerMuzzleFlash: (playerId) => {
    set({ muzzleFlash: { active: true, playerId } });
    setTimeout(() => set({ muzzleFlash: { active: false, playerId: -1 } }), 50);
  },
}));
