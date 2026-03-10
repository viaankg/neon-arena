import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';
import { useGameStore } from '../hooks/useGameStore';

interface BotProps {
  id: string;
  position: [number, number, number];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const Bot: React.FC<BotProps> = ({ id, difficulty }) => {
  const botState = useGameStore(state => state.bots.find(b => b.id === id));
  const { playerPositions, damagePlayer } = useGameStore();
  
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: botState?.position || [0, 2, 0],
    args: [0.6],
    type: 'Dynamic',
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe(v => velocity.current = v), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe(p => pos.current = p), [api.position]);

  const lastShotTime = useRef(0);

  useFrame((state) => {
    if (!botState || botState.health <= 0) return;

    // Target nearest player
    let nearestPlayerId = -1;
    let minDist = Infinity;
    const currentPos = new Vector3(...pos.current);

    Object.entries(playerPositions).forEach(([pid, pPos]) => {
      const pVector = new Vector3(...pPos);
      const d = currentPos.distanceTo(pVector);
      if (d < minDist) {
        minDist = d;
        nearestPlayerId = parseInt(pid);
      }
    });

    if (nearestPlayerId !== -1 && minDist < 30) {
      const targetPos = new Vector3(...playerPositions[nearestPlayerId]);
      
      // Move towards player
      const dir = new Vector3().subVectors(targetPos, currentPos).normalize();
      api.velocity.set(dir.x * (difficulty === 'HARD' ? 5 : 3), velocity.current[1], dir.z * (difficulty === 'HARD' ? 5 : 3));

      // Shoot
      const now = state.clock.getElapsedTime();
      const fireRate = difficulty === 'EASY' ? 2 : difficulty === 'MEDIUM' ? 1 : 0.5;
      if (now - lastShotTime.current > fireRate) {
        lastShotTime.current = now;
        if (Math.random() > (difficulty === 'EASY' ? 0.8 : difficulty === 'MEDIUM' ? 0.5 : 0.2)) {
           damagePlayer(nearestPlayerId, 10);
        }
      }
    } else {
      // Idle/Patrol
      api.velocity.set(Math.sin(state.clock.elapsedTime) * 2, velocity.current[1], Math.cos(state.clock.elapsedTime) * 2);
    }
  });

  if (!botState || botState.health <= 0) return null;

  return (
    <mesh ref={ref as any} name="bot" userData={{ botId: id }}>
      <sphereGeometry args={[0.6]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
      {/* Health Bar Proxy */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[botState.health / 100, 0.1, 0.1]} />
        <meshStandardMaterial color="lime" />
      </mesh>
    </mesh>
  );
};


