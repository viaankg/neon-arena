import React from 'react';
import { useBox, usePlane } from '@react-three/cannon';

export const Arena = () => {
  // Floor
  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  // Walls
  const Wall = ({ pos, size, color = "#1a1a1a" }: { pos: [number, number, number], size: [number, number, number], color?: string }) => {
    const [ref] = useBox(() => ({
      type: 'Static',
      position: pos,
      args: size,
    }));
    return (
      <mesh ref={ref as any}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  };

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef as any} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <gridHelper args={[200, 100, "#00ffff", "#003333"]} rotation={[0, 0, 0]} position={[0, 0.01, 0]} />

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

      <ambientLight intensity={0.4} />
      <pointLight position={[50, 20, 50]} intensity={2} color="#00ffff" />
      <pointLight position={[-50, 20, -50]} intensity={2} color="#ff00ff" />
      <pointLight position={[50, 20, -50]} intensity={2} color="#ffff00" />
      <pointLight position={[-50, 20, 50]} intensity={2} color="#00ff00" />
    </group>
  );
};
