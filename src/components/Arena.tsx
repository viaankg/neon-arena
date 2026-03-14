import React from 'react';
import * as THREE from 'three';
import { useBox, usePlane } from '@react-three/cannon';
import { useGameStore } from '../hooks/useGameStore';

export const Arena = () => {
  const selectedMap = useGameStore(state => state.selectedMap);

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

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef as any} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={selectedMap === 'VOID' ? "#000" : "#111"} />
      </mesh>
      <gridHelper args={[200, 100, selectedMap === 'VOID' ? "#555" : "#00ffff", selectedMap === 'VOID' ? "#222" : "#003333"]} rotation={[0, 0, 0]} position={[0, 0.01, 0]} />

      {selectedMap === 'NEON' && <NeonArena />}
      {selectedMap === 'CYBER' && <CyberCity />}
      {selectedMap === 'VOID' && <VoidChamber />}

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
