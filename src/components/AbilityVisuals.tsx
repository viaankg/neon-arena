import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../hooks/useGameStore';
import { Vector3, Color, Mesh, Group, RingGeometry, MeshBasicMaterial, DoubleSide, AdditiveBlending } from 'three';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';

export const AbilityVisuals = () => {
  const players = useGameStore(state => state.players);
  const playerPositions = useGameStore(state => state.playerPositions);
  const bots = useGameStore(state => state.bots);

  return (
    <group>
      {players.map(player => (
        <React.Fragment key={player.id}>
          <PlayerAbilityEffects 
            player={player} 
            position={playerPositions[player.id]} 
            bots={bots}
          />
          {player.activeAbilities.REWIND > 0 && player.positionHistory.length > 0 && (
            <RewindGhost position={player.positionHistory[0]} />
          )}
        </React.Fragment>
      ))}
    </group>
  );
};

const PlayerAbilityEffects = ({ player, position, bots }: { 
  player: any, 
  position: [number, number, number] | undefined,
  bots: any[]
}) => {
  if (!position) return null;

  const { activeAbilities } = player;
  const posVec = new Vector3(...position);

  return (
    <group position={posVec}>
      {activeAbilities.SHIELD > 0 && <ShieldEffect />}
      {activeAbilities.SPEED > 0 && <SpeedEffect />}
      {activeAbilities.STUN > 0 && <StunEffect />}
      {activeAbilities.VOLT > 0 && <VoltEffect bots={bots} playerPos={posVec} />}
      {activeAbilities.ARCANE_FIST > 0 && <FistEffect />}
      {activeAbilities.SCYTHE > 0 && <ScytheEffect />}
    </group>
  );
};

const ShieldEffect = () => {
  return (
    <Sphere args={[1.2, 32, 32]}>
      <meshPhongMaterial 
        color="#00ffff" 
        transparent 
        opacity={0.3} 
        side={DoubleSide}
        emissive="#00ffff"
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
};

const SpeedEffect = () => {
  const group = useRef<Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.1;
      group.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 5 + i) * 0.5;
      });
    }
  });

  return (
    <group ref={group}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[Math.cos(i) * 1.5, 0, Math.sin(i) * 1.5]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshBasicMaterial color="#4488ff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const StunEffect = () => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.addScalar(0.2);
      if (meshRef.current.material instanceof MeshBasicMaterial) {
        meshRef.current.material.opacity *= 0.9;
      }
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.1, 0.5, 32]} />
      <meshBasicMaterial color="yellow" transparent opacity={1} side={DoubleSide} />
    </mesh>
  );
};

const VoltEffect = ({ bots, playerPos }: { bots: any[], playerPos: Vector3 }) => {
  const nearbyBots = useMemo(() => {
    return bots.filter(bot => {
      const botPos = new Vector3(...bot.position);
      return botPos.distanceTo(playerPos) < 20;
    });
  }, [bots, playerPos]);

  return (
    <group>
      {nearbyBots.map(bot => (
        <VoltArc key={bot.id} start={new Vector3(0, 0, 0)} end={new Vector3(...bot.position).sub(playerPos)} />
      ))}
    </group>
  );
};

const VoltArc = ({ start, end }: { start: Vector3, end: Vector3 }) => {
  const lineRef = useRef<any>(null);
  
  useFrame((state) => {
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position;
      const segments = 5;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = new Vector3().lerpVectors(start, end, t);
        if (i > 0 && i < segments) {
          p.x += (Math.random() - 0.5) * 0.5;
          p.y += (Math.random() - 0.5) * 0.5;
          p.z += (Math.random() - 0.5) * 0.5;
        }
        positions.setXYZ(i, p.x, p.y, p.z);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={6}
          array={new Float32Array(18)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00ccff" linewidth={2} transparent opacity={0.8} />
    </line>
  );
};

const FistEffect = () => {
  const meshRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.addScalar(0.4);
      if (meshRef.current.material instanceof MeshBasicMaterial) {
        meshRef.current.material.opacity *= 0.85;
      }
    }
  });
  return (
    <group>
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <MeshDistortMaterial 
            color="#a020f0" 
            speed={5} 
            distort={0.6} 
            transparent 
            opacity={0.8} 
            blending={AdditiveBlending}
            emissive="#a020f0"
            emissiveIntensity={2}
          />
        </mesh>
      </Float>
      <Sphere args={[1.5, 16, 16]}>
        <meshBasicMaterial color="#a020f0" transparent opacity={0.2} wireframe />
      </Sphere>
    </group>
  );
};

const ScytheEffect = () => {
  const meshRef = useRef<Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.5;
      meshRef.current.scale.addScalar(0.2);
      if (meshRef.current.material instanceof MeshBasicMaterial) {
        meshRef.current.material.opacity *= 0.9;
      }
    }
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2, 2.5, 32, 1, 0, Math.PI]} />
      <meshBasicMaterial color="#ff4444" transparent opacity={0.8} side={DoubleSide} />
    </mesh>
  );
};

const RewindGhost = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <Sphere args={[0.5, 16, 16]}>
        <meshBasicMaterial color="white" transparent opacity={0.3} wireframe />
      </Sphere>
    </group>
  );
};
