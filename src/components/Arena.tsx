import React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useBox, usePlane } from '@react-three/cannon';
import { useGameStore } from '../hooks/useGameStore';

export const Arena = ({ isPrimary }: { isPrimary?: boolean }) => {
  const selectedMap = useGameStore(state => state.selectedMap);
  const tick = useGameStore(state => state.tick);

  useFrame((_, delta) => {
    if (isPrimary) tick(delta);
  });

  // Floor
  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  // Walls
  const Wall = ({ pos, size, color = "#1a1a1a", outlineColor }: { pos: [number, number, number], size: [number, number, number], color?: string, outlineColor?: string }) => {
    const [ref] = useBox(() => ({
      type: 'Static',
      position: pos,
      args: size,
    }));
    return (
      <mesh ref={ref as any}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
        {outlineColor && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
            <lineBasicMaterial color={outlineColor} linewidth={2} />
          </lineSegments>
        )}
      </mesh>
    );
  };

  const NeonArena = () => (
    <group>
      {/* Boundary Walls */}
      <Wall pos={[0, 10, 100]} size={[200, 20, 2]} color="#00ffff" />
      <Wall pos={[0, 10, -100]} size={[200, 20, 2]} color="#ff00ff" />
      <Wall pos={[100, 10, 0]} size={[2, 20, 200]} color="#ffff00" />
      <Wall pos={[-100, 10, 0]} size={[2, 20, 200]} color="#00ff00" />

      {/* Obstacles */}
      <Wall pos={[30, 5, 30]} size={[10, 10, 10]} color="#ff00ff" />
      <Wall pos={[-40, 3, 20]} size={[15, 6, 6]} color="#00ffff" />
      <Wall pos={[0, 8, 50]} size={[20, 16, 4]} color="#ffff00" />
      <Wall pos={[50, 4, -30]} size={[12, 8, 12]} color="#00ff00" />
      <Wall pos={[-50, 10, -50]} size={[8, 20, 8]} color="#ff0000" />
      
      {/* Central Structure */}
      <Wall pos={[0, 0.5, 0]} size={[30, 1, 30]} color="#222" />
      <Wall pos={[0, 10, 0]} size={[10, 20, 10]} color="#333" />
      <pointLight position={[0, 20, 0]} intensity={2} color="#00ffff" />

      {/* More Colorful Obstacles */}
      <Wall pos={[70, 2, 70]} size={[10, 4, 10]} color="#ff00ff" />
      <Wall pos={[-70, 2, -70]} size={[10, 4, 10]} color="#00ffff" />
      <Wall pos={[70, 2, -70]} size={[10, 4, 10]} color="#ffff00" />
      <Wall pos={[-70, 2, 70]} size={[10, 4, 10]} color="#00ff00" />
    </group>
  );

  const CyberCity = () => (
    <group>
      {/* Boundary Walls */}
      <Wall pos={[0, 25, 100]} size={[200, 50, 2]} color="#111" />
      <Wall pos={[0, 25, -100]} size={[200, 50, 2]} color="#111" />
      <Wall pos={[100, 25, 0]} size={[2, 50, 200]} color="#111" />
      <Wall pos={[-100, 25, 0]} size={[2, 50, 200]} color="#111" />

      {/* Skyscrapers */}
      <Wall pos={[40, 25, 40]} size={[20, 50, 20]} color="#0a0a0a" />
      <Wall pos={[-40, 35, -40]} size={[25, 70, 25]} color="#0a0a0a" />
      <Wall pos={[60, 15, -60]} size={[15, 30, 15]} color="#0a0a0a" />
      <Wall pos={[-60, 20, 60]} size={[18, 40, 18]} color="#0a0a0a" />

      {/* Neon Accents on Buildings */}
      <Wall pos={[40, 50, 40]} size={[21, 1, 21]} color="#00ffff" />
      <Wall pos={[-40, 70, -40]} size={[26, 1, 26]} color="#ff00ff" />

      {/* Bridges / Platforms */}
      <Wall pos={[0, 15, 0]} size={[40, 1, 10]} color="#222" />
      <Wall pos={[0, 25, 40]} size={[10, 1, 40]} color="#222" />

      {/* Street Lights */}
      <pointLight position={[0, 10, 0]} intensity={3} color="#00ffff" />
      <pointLight position={[40, 10, -40]} intensity={3} color="#ff00ff" />
      <pointLight position={[-40, 10, 40]} intensity={3} color="#ffff00" />
    </group>
  );

  const VoidChamber = () => (
    <group>
      {/* No Boundary Walls - Infinite Void feel */}
      
      {/* Floating Platforms */}
      <Wall pos={[0, 0.5, 0]} size={[40, 1, 40]} color="#080808" outlineColor="#00ffff" />
      <Wall pos={[50, 10, 50]} size={[20, 1, 20]} color="#080808" outlineColor="#ff00ff" />
      <Wall pos={[-50, 15, -50]} size={[25, 1, 25]} color="#080808" outlineColor="#ffff00" />
      <Wall pos={[50, 20, -50]} size={[15, 1, 15]} color="#080808" outlineColor="#00ff00" />
      <Wall pos={[-50, 25, 50]} size={[30, 1, 30]} color="#080808" outlineColor="#00ffff" />

      {/* Central Void Pillar */}
      <Wall pos={[0, -50, 0]} size={[10, 100, 10]} color="#111" outlineColor="#333" />
      
      {/* Floating Cubes */}
      <Wall pos={[20, 30, 20]} size={[5, 5, 5]} color="#00ffff" outlineColor="#ffffff" />
      <Wall pos={[-20, 40, -20]} size={[8, 8, 8]} color="#ff00ff" outlineColor="#ffffff" />
      
      {/* Atmospheric Lights */}
      <pointLight position={[0, 50, 0]} intensity={5} color="#ffffff" />
      <pointLight position={[100, 0, 100]} intensity={2} color="#00ffff" />
      <pointLight position={[-100, 0, -100]} intensity={2} color="#ff00ff" />
    </group>
  );

  const LavaArena = () => (
    <group>
      <Wall pos={[0, 10, 100]} size={[200, 20, 2]} color="#ff4400" />
      <Wall pos={[0, 10, -100]} size={[200, 20, 2]} color="#ff4400" />
      <Wall pos={[100, 10, 0]} size={[2, 20, 200]} color="#ff4400" />
      <Wall pos={[-100, 10, 0]} size={[2, 20, 200]} color="#ff4400" />

      {/* Lava Pits (Visual only for now) */}
      <Wall pos={[40, 0.1, 40]} size={[30, 0.2, 30]} color="#ff2200" outlineColor="#ffaa00" />
      <Wall pos={[-40, 0.1, -40]} size={[30, 0.2, 30]} color="#ff2200" outlineColor="#ffaa00" />

      {/* Obsidian Pillars */}
      <Wall pos={[20, 15, 20]} size={[5, 30, 5]} color="#050505" />
      <Wall pos={[-20, 10, 20]} size={[8, 20, 8]} color="#050505" />
      <Wall pos={[20, 12, -20]} size={[6, 24, 6]} color="#050505" />
      <Wall pos={[-20, 18, -20]} size={[4, 36, 4]} color="#050505" />

      <pointLight position={[0, 15, 0]} intensity={4} color="#ff4400" />
    </group>
  );

  const ForestArena = () => (
    <group>
      <Wall pos={[0, 10, 100]} size={[200, 20, 2]} color="#1a4a1a" />
      <Wall pos={[0, 10, -100]} size={[200, 20, 2]} color="#1a4a1a" />
      <Wall pos={[100, 10, 0]} size={[2, 20, 200]} color="#1a4a1a" />
      <Wall pos={[-100, 10, 0]} size={[2, 20, 200]} color="#1a4a1a" />

      {/* "Trees" */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 60 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return <Wall key={i} pos={[x, 15, z]} size={[4, 30, 4]} color="#3d2b1f" outlineColor="#2d5a27" />;
      })}

      {/* Boulders */}
      <Wall pos={[10, 4, 10]} size={[8, 8, 8]} color="#444" />
      <Wall pos={[-15, 3, -15]} size={[10, 6, 10]} color="#444" />
      <Wall pos={[30, 5, -20]} size={[12, 10, 12]} color="#444" />

      <pointLight position={[0, 20, 0]} intensity={2} color="#2d5a27" />
    </group>
  );

  const IceArena = () => (
    <group>
      <Wall pos={[0, 10, 100]} size={[200, 20, 2]} color="#aaddff" />
      <Wall pos={[0, 10, -100]} size={[200, 20, 2]} color="#aaddff" />
      <Wall pos={[100, 10, 0]} size={[2, 20, 200]} color="#aaddff" />
      <Wall pos={[-100, 10, 0]} size={[2, 20, 200]} color="#aaddff" />

      {/* Ice Crystals */}
      <Wall pos={[30, 10, 30]} size={[4, 20, 4]} color="#ffffff" outlineColor="#00ffff" />
      <Wall pos={[-30, 15, -30]} size={[6, 30, 6]} color="#ffffff" outlineColor="#00ffff" />
      <Wall pos={[40, 8, -40]} size={[8, 16, 8]} color="#ffffff" outlineColor="#00ffff" />
      <Wall pos={[-40, 12, 40]} size={[5, 24, 5]} color="#ffffff" outlineColor="#00ffff" />

      {/* Ice Blocks */}
      <Wall pos={[0, 4, 50]} size={[20, 8, 5]} color="#ccf0ff" />
      <Wall pos={[0, 4, -50]} size={[20, 8, 5]} color="#ccf0ff" />

      <pointLight position={[0, 20, 0]} intensity={3} color="#00ffff" />
    </group>
  );

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef as any} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color={
            selectedMap === 'VOID' ? "#000" : 
            selectedMap === 'LAVA' ? "#1a0a00" :
            selectedMap === 'FOREST' ? "#0a1a0a" :
            selectedMap === 'ICE' ? "#eefaff" :
            "#111"
          } 
        />
      </mesh>
      <gridHelper 
        args={[
          200, 100, 
          selectedMap === 'VOID' ? "#555" : 
          selectedMap === 'LAVA' ? "#ff4400" :
          selectedMap === 'FOREST' ? "#2d5a27" :
          selectedMap === 'ICE' ? "#00ffff" :
          "#00ffff", 
          selectedMap === 'VOID' ? "#222" : 
          selectedMap === 'LAVA' ? "#331100" :
          selectedMap === 'FOREST' ? "#051105" :
          selectedMap === 'ICE' ? "#aaddff" :
          "#003333"
        ]} 
        rotation={[0, 0, 0]} 
        position={[0, 0.01, 0]} 
      />

      {selectedMap === 'NEON' && <NeonArena />}
      {selectedMap === 'CYBER' && <CyberCity />}
      {selectedMap === 'VOID' && <VoidChamber />}
      {selectedMap === 'LAVA' && <LavaArena />}
      {selectedMap === 'FOREST' && <ForestArena />}
      {selectedMap === 'ICE' && <IceArena />}

      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[50, 20, 50]} intensity={2} color="#00ffff" />
      <pointLight position={[-50, 20, -50]} intensity={2} color="#ff00ff" />
      <pointLight position={[50, 20, -50]} intensity={2} color="#ffff00" />
      <pointLight position={[-50, 20, 50]} intensity={2} color="#00ff00" />
    </group>
  );
};
