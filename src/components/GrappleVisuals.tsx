import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../hooks/useGameStore';
import { Vector3, BufferGeometry, LineBasicMaterial, Line } from 'three';

export const GrappleVisuals = () => {
  const players = useGameStore(state => state.players);
  const playerPositions = useGameStore(state => state.playerPositions);
  
  return (
    <>
      {players.map(player => (
        <GrappleLine 
          key={player.id} 
          playerId={player.id} 
          active={player.grappleData.active} 
          target={player.grappleData.target}
          playerPosition={playerPositions[player.id]}
        />
      ))}
    </>
  );
};

const GrappleLine = ({ playerId, active, target, playerPosition }: { 
  playerId: number, 
  active: boolean, 
  target: [number, number, number] | null,
  playerPosition: [number, number, number] | undefined
}) => {
  const lineRef = useRef<Line>(null);

  useFrame(() => {
    if (lineRef.current && active && target && playerPosition) {
      const positions = lineRef.current.geometry.attributes.position;
      
      // Start at player position (slightly offset to look like it's from the gun/hand)
      positions.setXYZ(0, playerPosition[0], playerPosition[1] + 0.5, playerPosition[2]);
      // End at target position
      positions.setXYZ(1, target[0], target[1], target[2]);
      
      positions.needsUpdate = true;
      lineRef.current.visible = true;
    } else if (lineRef.current) {
      lineRef.current.visible = false;
    }
  });

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array(6)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="cyan" transparent opacity={0.8} />
    </line>
  );
};
