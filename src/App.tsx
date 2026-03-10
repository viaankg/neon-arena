import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars, Environment, PointerLockControls } from '@react-three/drei';
import { useGameStore } from './hooks/useGameStore';
import { Arena } from './components/Arena';
import { Player } from './components/Player';
import { Bot } from './components/Bot';
import { HUD } from './components/UI/HUD';
import { Menu } from './components/UI/Menu';
import { GameOver } from './components/UI/GameOver';
import { PointerLockOverlay } from './components/UI/PointerLockOverlay';
import { Tutorial } from './components/UI/Tutorial';

const GameScene = ({ playerId, viewport }: { playerId: number, viewport: any }) => {
  const difficulty = useGameStore(state => state.difficulty);
  
  return (
    <div className="relative h-full w-full overflow-hidden border-r border-white/10 last:border-0">
      <Canvas shadows camera={{ fov: 75 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="night" />
          
          <Physics gravity={[0, -9.81, 0]}>
            {playerId === 0 && <PointerLockControls selector="body" />}
            <Arena />
            <Player 
              playerId={playerId} 
              position={[playerId * 5, 2, 0]} 
              viewport={viewport}
            />
            
            {/* Bots from Store */}
            {useGameStore(state => state.bots).map(bot => (
              <Bot key={bot.id} id={bot.id} difficulty={difficulty} />
            ))}
          </Physics>
        </Suspense>
      </Canvas>
      <HUD playerId={playerId} />
    </div>
  );
};

export default function App() {
  const { gameState, mode, players } = useGameStore();

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden select-none">
      {gameState === 'MENU' ? (
        <Menu />
      ) : (
        <div className={`flex h-full w-full ${mode === 'TWO_PLAYER' ? 'flex-row' : ''}`}>
          {players.map((p, i) => (
            <GameScene 
              key={p.id} 
              playerId={p.id} 
              viewport={mode === 'TWO_PLAYER' ? { left: i * 0.5, top: 0, width: 0.5, height: 1 } : { left: 0, top: 0, width: 1, height: 1 }} 
            />
          ))}
        </div>
      )}
      
      <GameOver />
      
      {gameState === 'TUTORIAL' && <Tutorial />}
      
      {(gameState === 'PLAYING' || gameState === 'TUTORIAL') && <PointerLockOverlay />}
      
      {/* Global Instructions Overlay */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] uppercase tracking-[0.4em] text-white/30 text-center">
          WASD Move • Mouse Aim • Click Shoot • R Reload • Q/E/F Abilities • 1-3 Switch
        </div>
      )}
    </div>
  );
}
