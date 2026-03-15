import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars, Environment, PointerLockControls, KeyboardControls } from '@react-three/drei';
import { useGameStore } from './hooks/useGameStore';
import { Arena } from './components/Arena';
import { Player } from './components/Player';
import { Bot } from './components/Bot';
import { HUD } from './components/UI/HUD';
import { Menu } from './components/UI/Menu';
import { GameOver } from './components/UI/GameOver';
import { PointerLockOverlay } from './components/UI/PointerLockOverlay';
import { Tutorial } from './components/UI/Tutorial';
import { Effects } from './components/Effects';
import { LoadoutMenu } from './components/LoadoutMenu';
import { Settings, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Selection, EffectComposer, Outline } from '@react-three/postprocessing';

import { Projectiles } from './components/Projectiles';
import { GrappleVisuals } from './components/GrappleVisuals';
import { AbilityVisuals } from './components/AbilityVisuals';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Game Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle size={64} className="text-red-500 mb-6" />
          <h1 className="text-4xl font-black italic mb-4">SYSTEM FAILURE</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs mb-8">The simulation encountered a critical error</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-black font-bold rounded-xl uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Bots = ({ difficulty }: { difficulty: any }) => {
  const botIdsString = useGameStore(state => state.bots.map(b => b.id).join(','));
  const botIds = React.useMemo(() => botIdsString.split(',').filter(Boolean), [botIdsString]);
  
  return (
    <>
      {botIds.map(id => (
        <Bot key={id} id={id} difficulty={difficulty} />
      ))}
    </>
  );
};

const GameScene = ({ playerId, viewport, isLoadoutOpen }: { playerId: number, viewport: any, isLoadoutOpen: boolean }) => {
  const difficulty = useGameStore(state => state.difficulty);
  
  const initialPos = React.useMemo(() => [playerId === 0 ? 20 : -20, 5, playerId === 0 ? 20 : -20] as [number, number, number], [playerId]);
  
  return (
    <div className="relative h-full w-full overflow-hidden border-r border-white/10 last:border-0">
      <Canvas shadows camera={{ fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="cyan" wireframe />
          </mesh>
        }>
          <Environment preset="night" />
          
      <Physics gravity={[0, -9.81, 0]} allowSleep={false}>
        <Selection>
          <EffectComposer autoClear={false}>
            <Outline 
              blur 
              visibleEdgeColor={0xff0000} 
              hiddenEdgeColor={0xff0000} 
              edgeStrength={10} 
              width={1000}
              xRay={true}
            />
          </EffectComposer>
          
          <Arena />
          <Effects />
          <Projectiles />
          <GrappleVisuals />
          <AbilityVisuals />
          <Player 
            playerId={playerId} 
            position={initialPos} 
            viewport={viewport}
          />
          
          <Bots difficulty={difficulty} />
        </Selection>
      </Physics>
        </Suspense>
      </Canvas>
      <HUD playerId={playerId} />
    </div>
  );
};

export default function App() {
  const gameState = useGameStore(state => state.gameState);
  const mode = useGameStore(state => state.mode);
  const playerIdsString = useGameStore(state => state.players.map(p => p.id).join(','));
  const playerIds = React.useMemo(() => playerIdsString.split(',').filter(Boolean).map(Number), [playerIdsString]);
  const isLoadoutOpen = useGameStore(state => state.isLoadoutOpen);
  const setLoadoutOpen = useGameStore(state => state.setLoadoutOpen);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyB') {
        setLoadoutOpen(!isLoadoutOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoadoutOpen, setLoadoutOpen]);

  return (
    <KeyboardControls map={[
      { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
      { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
      { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
      { name: 'right', keys: ['ArrowRight', 'KeyD'] },
      { name: 'jump', keys: ['Space'] },
      { name: 'ability1', keys: ['KeyQ'] },
      { name: 'ability2', keys: ['KeyE'] },
      { name: 'ability3', keys: ['KeyF'] },
      { name: 'ability4', keys: ['KeyC'] },
      { name: 'reload', keys: ['KeyR'] },
      { name: 'weapon1', keys: ['Digit1'] },
      { name: 'weapon2', keys: ['Digit2'] },
      { name: 'weapon3', keys: ['Digit3'] },
      { name: 'loadout', keys: ['KeyB'] },
      { name: 'slide', keys: ['ShiftLeft', 'ControlLeft'] },
    ]}>
      <ErrorBoundary>
        <div className="h-screen w-screen bg-black text-white overflow-hidden select-none">
          {gameState === 'MENU' ? (
            <Menu />
          ) : (
            <div className={`flex h-full w-full ${mode === 'TWO_PLAYER' ? 'flex-row' : ''}`}>
              {playerIds.map((id, i) => (
                <GameScene 
                  key={id} 
                  playerId={id} 
                  viewport={mode === 'TWO_PLAYER' ? { left: i * 0.5, top: 0, width: 0.5, height: 1 } : { left: 0, top: 0, width: 1, height: 1 }} 
                  isLoadoutOpen={isLoadoutOpen}
                />
              ))}
            </div>
          )}
          
          <GameOver />
          
          {gameState === 'TUTORIAL' && <Tutorial />}
          
          {(gameState === 'PLAYING' || gameState === 'TUTORIAL') && !isLoadoutOpen && <PointerLockOverlay />}
          
          <LoadoutMenu isOpen={isLoadoutOpen} onClose={() => setLoadoutOpen(false)} />
  
          {/* Global Instructions Overlay */}
          {gameState === 'PLAYING' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] uppercase tracking-[0.4em] text-white/30 text-center">
              WASD Move • Shift Slide • Mouse Aim • Click Shoot • R Reload • Q/E/F Abilities • 1-3 Switch • B Loadout • M Controls
            </div>
          )}
  
          {/* Loadout Toggle Button */}
          {gameState === 'PLAYING' && (
            <button
              onClick={() => setLoadoutOpen(true)}
              className="absolute bottom-8 left-8 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 z-50"
            >
              <ShoppingBag size={24} />
            </button>
          )}
        </div>
      </ErrorBoundary>
    </KeyboardControls>
  );
}
