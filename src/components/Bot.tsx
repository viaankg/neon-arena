import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';
import { Billboard } from '@react-three/drei';
import { Select } from '@react-three/postprocessing';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/useGameStore';

interface BotProps {
  id: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const Bot: React.FC<BotProps> = ({ id, difficulty }) => {
  const bot = useGameStore(state => state.bots.find(b => b.id === id));
  const health = bot?.health;
  const maxHealth = bot?.maxHealth || 100;
  const isStunned = bot?.isStunned;
  const botType = bot?.type || 'NORMAL';
  const botScale = bot?.scale || 1.0;
  const botSpeed = bot?.speed || 5;

  // Get initial position once, non-reactively
  const initialPosition = useRef(bot?.position);
  
  const damagePlayer = useGameStore(state => state.damagePlayer);
  const updateBotPosition = useGameStore(state => state.updateBotPosition);
  
  const [ref, api] = useSphere(() => ({
    mass: botType === 'BOSS' ? 10 : 1,
    position: initialPosition.current || [0, 2, 0],
    args: [0.6 * botScale],
    type: 'Dynamic',
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe(v => velocity.current = v), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe(p => {
    // Only update if position changed significantly
    if (Math.abs(p[0] - pos.current[0]) < 0.01 && 
        Math.abs(p[1] - pos.current[1]) < 0.01 && 
        Math.abs(p[2] - pos.current[2]) < 0.01) {
      return;
    }
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

    const { playerPositions, impacts } = useGameStore.getState();

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
      finalVelocity.set(dir.x * botSpeed, 0, dir.z * botSpeed);

      // Shoot
      const now = state.clock.getElapsedTime();
      const fireRate = botType === 'BOSS' ? 0.5 : (difficulty === 'EASY' ? 3 : difficulty === 'MEDIUM' ? 2 : 1);
      if (now - lastShotTime.current > fireRate) {
        lastShotTime.current = now;
        
        // Visual tracer for bot shot
        const gunPos = new Vector3(0.4 * botScale, -0.2 * botScale, -0.4 * botScale).applyMatrix4(ref.current!.matrixWorld);
        const targetPos = new Vector3(...playerPositions[nearestPlayerId]);
        // Add some inaccuracy
        const inaccuracy = botType === 'BOSS' ? 1 : (difficulty === 'EASY' ? 3 : difficulty === 'MEDIUM' ? 2 : 1);
        const hitPos = [
          targetPos.x + (Math.random() - 0.5) * inaccuracy,
          targetPos.y + (Math.random() - 0.5) * inaccuracy,
          targetPos.z + (Math.random() - 0.5) * inaccuracy
        ] as [number, number, number];
        
        useGameStore.getState().addTracer([gunPos.x, gunPos.y, gunPos.z], hitPos);

        if (Math.random() > (difficulty === 'EASY' ? 0.9 : difficulty === 'MEDIUM' ? 0.7 : 0.4)) {
           damagePlayer(nearestPlayerId, botType === 'BOSS' ? 15 : 5);
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
  
  const botColor = isStunned ? "yellow" : (botType === 'BOSS' ? "#FF00FF" : (botType === 'ELITE' ? "#FFA500" : "red"));
  
  return (
    <group userData={{ botId: id }}>
      <mesh ref={ref as any} name="bot" userData={{ botId: id }}>
        <sphereGeometry args={[0.6 * botScale]} />
        <meshStandardMaterial 
          color={botColor} 
          emissive={botColor} 
          emissiveIntensity={botType === 'BOSS' ? 1.0 : 0.5} 
        />
        {/* Health Bar Billboard */}
        <Billboard position={[0, 1.2 * botScale, 0]} userData={{ botId: id }}>
          <mesh scale={[(health || 0) / maxHealth, 1, 1]} position={[-(1 - (health || 0) / maxHealth) / 2, 0, 0]} userData={{ botId: id }}>
            <boxGeometry args={[1 * botScale, 0.1 * botScale, 0.01]} />
            <meshStandardMaterial color={botType === 'BOSS' ? "#FF00FF" : "lime"} />
          </mesh>
          <mesh position={[0, 0, -0.01]} userData={{ botId: id }}>
            <boxGeometry args={[1.05 * botScale, 0.15 * botScale, 0.01]} />
            <meshStandardMaterial color="black" transparent opacity={0.5} />
          </mesh>
        </Billboard>
  
        {/* Bot Gun */}
        <group position={[0.4 * botScale, -0.2 * botScale, -0.4 * botScale]} rotation={[0, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.1 * botScale, 0.15 * botScale, 0.5 * botScale]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0, -0.3 * botScale]}>
            <boxGeometry args={[0.05 * botScale, 0.05 * botScale, 0.4 * botScale]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      </mesh>
    </group>
  );
};


