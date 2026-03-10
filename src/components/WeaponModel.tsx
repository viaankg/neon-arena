import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, WEAPONS } from '../hooks/useGameStore';
import { Vector3, Group } from 'three';

export const WeaponModel = ({ playerId }: { playerId: number }) => {
  const player = useGameStore(state => state.players.find(p => p.id === playerId));
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current || !player) return;
    
    // Sway effect
    const t = state.clock.getElapsedTime();
    group.current.position.y = -0.5 + Math.sin(t * 2) * 0.01;
    group.current.position.x = 0.5 + Math.cos(t * 1.5) * 0.01;
    
    if (player.isADS) {
      group.current.position.lerp(new Vector3(0, -0.3, -0.5), 0.1);
    } else {
      group.current.position.lerp(new Vector3(0.5, -0.5, -0.8), 0.1);
    }
  });

  if (!player) return null;
  const currentWeapon = WEAPONS[player.weapons[player.currentWeaponSlot]];
  const muzzleFlashActive = useGameStore(state => state.muzzleFlash.active && state.muzzleFlash.playerId === playerId);

  return (
    <group ref={group}>
      {/* Muzzle Flash */}
      {muzzleFlashActive && (
        <group position={[0, 0, -0.8]}>
          <pointLight color="orange" intensity={2} distance={2} />
          <mesh>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        </group>
      )}
      {/* Simple Procedural Weapon Models */}
      {currentWeapon.type === 'PRIMARY' && (
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.2, 0.8]} />
          <meshStandardMaterial color={currentWeapon.isEnergy ? "cyan" : "gray"} />
          <mesh position={[0, -0.15, 0.2]}>
            <boxGeometry args={[0.08, 0.3, 0.1]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </mesh>
      )}
      {currentWeapon.type === 'SECONDARY' && (
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.15, 0.4]} />
          <meshStandardMaterial color={currentWeapon.isEnergy ? "magenta" : "zinc"} />
          <mesh position={[0, -0.1, 0.1]}>
            <boxGeometry args={[0.06, 0.2, 0.08]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </mesh>
      )}
      {currentWeapon.type === 'MELEE' && (
        <mesh castShadow rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.02, 0.1, 0.6]} />
          <meshStandardMaterial color="silver" metalness={1} roughness={0.1} />
          <mesh position={[0, 0, 0.3]}>
            <boxGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </mesh>
      )}
    </group>
  );
};
