import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';
import { Billboard } from '@react-three/drei';
import { Select } from '@react-three/postprocessing';
import { useGameStore } from '../hooks/useGameStore';

interface BotProps {
  id: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const Bot: React.FC<BotProps> = ({ id, difficulty }) => {
  const health = useGameStore(state => state.bots.find(b => b.id === id)?.health);
  const isStunned = useGameStore(state => state.bots.find(b => b.id === id)?.isStunned);
  const initialPosition = useGameStore(state => state.bots.find(b => b.id === id)?.position);
  
  const playerPositions = useGameStore(state => state.playerPositions);
  const impacts = useGameStore(state => state.impacts);
  const damagePlayer = useGameStore(state => state.damagePlayer);
  const updateBotPosition = useGameStore(state => state.updateBotPosition);
  
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: initialPosition || [0, 2, 0],
    args: [0.6],
    type: 'Dynamic',
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe(v => velocity.current = v), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe(p => {
    pos.current = p;
    updateBotPosition(id, p);
  }), [api.position, id, updateBotPosition]);

  const lastShotTime = useRef(0);

  useFrame((state) => {
    if (health === undefined || health <= 0 || isStunned) {
      if (isStunned) {
        api.velocity.set(0, velocity.current[1], 0);
      }
      return;
    }

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

    let finalVelocity = new Vector3(0, 0, 0);

    if (nearestPlayerId !== -1 && minDist < 30) {
      const targetPos = new Vector3(...playerPositions[nearestPlayerId]);
      
      // Move towards player
      const dir = new Vector3().subVectors(targetPos, currentPos).normalize();
      const speed = difficulty === 'HARD' ? 4 : 2;
      finalVelocity.set(dir.x * speed, 0, dir.z * speed);

      // Shoot
      const now = state.clock.getElapsedTime();
      const fireRate = difficulty === 'EASY' ? 3 : difficulty === 'MEDIUM' ? 2 : 1;
      if (now - lastShotTime.current > fireRate) {
        lastShotTime.current = now;
        
        // Visual tracer for bot shot
        const gunPos = new Vector3(0.4, -0.2, -0.4).applyMatrix4(ref.current!.matrixWorld);
        const targetPos = new Vector3(...playerPositions[nearestPlayerId]);
        // Add some inaccuracy
        const inaccuracy = difficulty === 'EASY' ? 3 : difficulty === 'MEDIUM' ? 2 : 1;
        const hitPos = [
          targetPos.x + (Math.random() - 0.5) * inaccuracy,
          targetPos.y + (Math.random() - 0.5) * inaccuracy,
          targetPos.z + (Math.random() - 0.5) * inaccuracy
        ] as [number, number, number];
        
        useGameStore.getState().addTracer([gunPos.x, gunPos.y, gunPos.z], hitPos);

        if (Math.random() > (difficulty === 'EASY' ? 0.9 : difficulty === 'MEDIUM' ? 0.7 : 0.4)) {
           damagePlayer(nearestPlayerId, 5);
        }
      }
    } else {
      // Idle/Patrol
      finalVelocity.set(Math.sin(state.clock.elapsedTime) * 2, 0, Math.cos(state.clock.elapsedTime) * 2);
    }

    // Apply Gravity Orb pull
    impacts.forEach(impact => {
      if (impact.color === 'purple') {
        const impactPos = new Vector3(...impact.position);
        const dist = currentPos.distanceTo(impactPos);
        const pullRadius = (impact.radius || 10) * 1.5; // Pull from slightly outside visual radius
        
        if (dist < pullRadius) {
          const pullDir = new Vector3().subVectors(impactPos, currentPos).normalize();
          // Stronger pull as you get closer
          const pullStrength = Math.pow(1 - dist / pullRadius, 0.5) * 15;
          finalVelocity.add(pullDir.multiplyScalar(pullStrength));
        }
      }
    });

    api.velocity.set(finalVelocity.x, velocity.current[1] + finalVelocity.y, finalVelocity.z);
  });

  if (health === undefined || health <= 0) return null;
  
  return (
    <Select enabled>
      <mesh ref={ref as any} name="bot" userData={{ botId: id }}>
        <sphereGeometry args={[0.6]} />
        <meshStandardMaterial 
          color={isStunned ? "yellow" : "red"} 
          emissive={isStunned ? "yellow" : "red"} 
          emissiveIntensity={0.5} 
        />
        {/* Health Bar Billboard */}
        <Billboard position={[0, 1.2, 0]}>
          <mesh scale={[(health || 0) / 100, 1, 1]}>
            <boxGeometry args={[1, 0.1, 0.01]} />
            <meshStandardMaterial color="lime" />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[1.05, 0.15, 0.01]} />
            <meshStandardMaterial color="black" transparent opacity={0.5} />
          </mesh>
        </Billboard>
  
        {/* Bot Gun */}
        <group position={[0.4, -0.2, -0.4]} rotation={[0, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.15, 0.5]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0, -0.3]}>
            <boxGeometry args={[0.05, 0.05, 0.4]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      </mesh>
    </Select>
  );
};


