import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Users, Settings, Trophy, Skull, ShoppingBag, Gem, Globe, Plus, Loader2, LogOut, Search, ChevronRight, X } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../../utils/firestoreErrorHandler';

export const Menu = () => {
  const mode = useGameStore(state => state.mode);
  const setMode = useGameStore(state => state.setMode);
  const difficulty = useGameStore(state => state.difficulty);
  const setDifficulty = useGameStore(state => state.setDifficulty);
  const selectedMap = useGameStore(state => state.selectedMap);
  const setMap = useGameStore(state => state.setMap);
  const startGame = useGameStore(state => state.startGame);
  const gameState = useGameStore(state => state.gameState);
  const setLoadoutOpen = useGameStore(state => state.setLoadoutOpen);
  const gems = useGameStore(state => state.gems);
  const user = useGameStore(state => state.user);
  const setSessionId = useGameStore(state => state.setSessionId);

  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [arenaName, setArenaName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [maxWaves, setMaxWaves] = useState(5);

  useEffect(() => {
    if (mode !== 'MULTIPLAYER') return;

    setLoadingSessions(true);
    const q = query(
      collection(db, 'sessions'), 
      where('status', '==', 'waiting'),
      where('playerCount', '>', 0)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingSessions(false);
    });

    return unsubscribe;
  }, [mode]);

  const createSession = async () => {
    if (!user || !arenaName.trim()) return;
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        hostId: user.uid,
        hostName: user.displayName || 'Anonymous',
        arenaName: arenaName.trim(),
        status: 'waiting',
        map: selectedMap,
        difficulty: difficulty,
        maxPlayers: maxPlayers,
        maxWaves: maxWaves,
        playerCount: 0,
        createdAt: serverTimestamp()
      });
      setSessionId(docRef.id);
      useGameStore.getState().setIsHost(true);
      useGameStore.getState().setMaxWaves(maxWaves);
      startGame();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'sessions');
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.arenaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.hostName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const joinSession = (session: any) => {
    setSessionId(session.id);
    useGameStore.getState().setIsHost(false);
    if (session.maxWaves) {
      useGameStore.getState().setMaxWaves(session.maxWaves);
    }
    if (session.difficulty) {
      useGameStore.getState().setDifficulty(session.difficulty);
    }
    if (session.map) {
      setMap(session.map);
    }
    startGame();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  if (gameState !== 'MENU') return null;

  const maps = [
    { id: 'NEON', name: 'Neon Arena', desc: 'Standard combat zone' },
    { id: 'CYBER', name: 'Cyber City', desc: 'Vertical urban warfare' },
    { id: 'VOID', name: 'Void Chamber', desc: 'Open space combat' },
    { id: 'LAVA', name: 'Lava Pits', desc: 'Extreme heat environment' },
    { id: 'FOREST', name: 'Dark Forest', desc: 'Dense tactical cover' },
    { id: 'ICE', name: 'Ice Glacier', desc: 'Frozen wasteland' },
  ] as const;

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center p-8 overflow-hidden">
      {/* Gem Display Top Right */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl backdrop-blur-md">
        <Gem size={20} className="text-emerald-400" />
        <div className="flex flex-col">
          <span className="text-emerald-400 font-bold text-xl leading-none">{gems}</span>
          <span className="text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold">Gems</span>
        </div>
      </div>

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
        className="relative z-10 max-w-4xl w-full bg-zinc-900/80 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row gap-12"
      >
        <div className="flex-1">
          <div className="text-left mb-12">
            <h1 className="text-6xl font-black italic tracking-tighter text-white mb-2">
              NEON <span className="text-cyan-400">ARENA</span>
            </h1>
            <p className="text-zinc-500 uppercase tracking-[0.3em] text-xs">High Octane Combat Simulation</p>
          </div>

          <div className="space-y-8">
            {/* Mode Selection */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 block">Game Mode</label>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setMode('SINGLE')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${mode === 'SINGLE' ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                >
                  <Play size={20} />
                  <span className="font-bold">Solo</span>
                </button>
                <button 
                  onClick={() => setMode('TWO_PLAYER')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${mode === 'TWO_PLAYER' ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                >
                  <Users size={20} />
                  <span className="font-bold">Split</span>
                </button>
                <button 
                  onClick={() => setMode('MULTIPLAYER')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${mode === 'MULTIPLAYER' ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                >
                  <Globe size={20} />
                  <span className="font-bold">Online</span>
                </button>
              </div>
            </div>

            {/* Multiplayer Sessions */}
            <AnimatePresence>
              {mode === 'MULTIPLAYER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">Active Arenas</label>
                    <button 
                      onClick={() => {
                        setArenaName(`${user?.displayName || 'Operative'}'s Arena`);
                        setIsCreating(true);
                      }}
                      className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Plus size={14} />
                      CREATE NEW
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input 
                      type="text"
                      placeholder="Search arenas or hosts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {loadingSessions ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="animate-spin text-zinc-600" size={20} />
                      </div>
                    ) : filteredSessions.length === 0 ? (
                      <div className="text-center py-4 text-[10px] text-zinc-600 uppercase tracking-widest border border-dashed border-white/5 rounded-xl">
                        {searchTerm ? 'No matching arenas' : 'No active arenas found'}
                      </div>
                    ) : (
                      filteredSessions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => joinSession(s)}
                          className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{s.arenaName || `${s.hostName}'s Arena`}</span>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">{s.map} • {s.maxWaves ? `${s.maxWaves} WAVES` : s.difficulty} • {s.maxPlayers || 4} MAX</span>
                          </div>
                          <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[8px] font-bold rounded-lg uppercase tracking-widest">
                            Join
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Difficulty Selection (Solo only) */}
            {mode === 'SINGLE' && (
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
            )}

            <button 
              onClick={startGame}
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] uppercase tracking-widest"
            >
              Deploy to Arena
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLoadoutOpen(true);
                }}
                className="py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-all border border-white/10 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Loadout
              </button>
              <button 
                onClick={() => useGameStore.getState().startTutorial()}
                className="py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl transition-all border border-white/10 uppercase tracking-widest"
              >
                Training
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 space-y-6">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 block">Select Map</label>
          <div className="space-y-3">
            {maps.map((m) => (
              <button
                key={m.id}
                onClick={() => setMap(m.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all group ${selectedMap === m.id ? 'bg-white/10 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <div className={`text-sm font-black italic mb-1 transition-colors ${selectedMap === m.id ? 'text-cyan-400' : 'text-white'}`}>
                  {m.name}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{m.desc}</div>
              </button>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4 text-[10px] text-zinc-600 uppercase tracking-widest">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span>v1.0.5-stable</span>
                <span className="text-cyan-500/50">Map: {selectedMap}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all group"
              >
                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Logout</span>
              </button>
            </div>
            <div className="flex justify-between">
              <span>System Ready</span>
              <span>{user?.displayName || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Arena Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic text-white">CREATE ARENA</h2>
                <button onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Arena Name</label>
                  <input 
                    type="text"
                    value={arenaName}
                    onChange={(e) => setArenaName(e.target.value)}
                    placeholder="Enter arena name..."
                    maxLength={30}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                      <button 
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`py-3 rounded-xl border text-[10px] font-bold transition-all ${difficulty === d ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Wave Count</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((w) => (
                      <button 
                        key={w}
                        onClick={() => setMaxWaves(w)}
                        className={`py-3 rounded-xl border text-[10px] font-bold transition-all ${maxWaves === w ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Max Players</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 4, 6, 8].map((n) => (
                      <button 
                        key={n}
                        onClick={() => setMaxPlayers(n)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${maxPlayers === n ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Select Map</label>
                  <div className="grid grid-cols-3 gap-2">
                    {maps.map((m) => (
                      <button 
                        key={m.id}
                        onClick={() => setMap(m.id)}
                        className={`py-3 rounded-xl border text-[10px] font-bold transition-all ${selectedMap === m.id ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={createSession}
                  disabled={!arenaName.trim()}
                  className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>INITIALIZE ARENA</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
