import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface RemotePlayerProps {
  data: {
    uid: string;
    username: string;
    position: [number, number, number];
    health: number;
    isDead: boolean;
  };
}

export const RemotePlayer = ({ data }: RemotePlayerProps) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Smoothly interpolate position
      meshRef.current.position.lerp(new THREE.Vector3(...data.position), 0.2);
    }
  });

  if (data.isDead) return null;

  return (
    <group ref={meshRef}>
      {/* Player Body */}
      <mesh position={[0, 1, 0]}>
        <capsuleGeometry args={[0.4, 1, 4, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Username */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.username}
      </Text>

      {/* Health Bar */}
      <group position={[0, 2.2, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1, 0.05]} />
          <meshBasicMaterial color="black" transparent opacity={0.5} />
        </mesh>
        <mesh position={[(data.health / 100 - 1) / 2, 0, 0.01]}>
          <planeGeometry args={[data.health / 100, 0.05]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      </group>
    </group>
  );
};
