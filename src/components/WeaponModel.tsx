import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGameStore, WEAPONS } from '../hooks/useGameStore';
import { Vector3, Group } from 'three';

export const WeaponModel = ({ playerId }: { playerId: number }) => {
  const player = useGameStore(state => state.players.find(p => p.id === playerId));
  const group = useRef<Group>(null);
  const kickAmount = useRef(0);
  const muzzleFlashActive = useGameStore(state => state.muzzleFlash.active && state.muzzleFlash.playerId === playerId);

  const [sniperModel, setSniperModel] = useState<Group | null>(null);
  const [sharkModelNormal, setSharkModelNormal] = useState<Group | null>(null);
  const [sharkModelReload, setSharkModelReload] = useState<Group | null>(null);

  // Load custom models from provided URLs
  useEffect(() => {
    const loader = new GLTFLoader();
    const SNIPER_MODEL_URL = 'https://files.catbox.moe/4n0pqq.glb';
    const SHARK_RELOAD_MODEL_URL = 'https://files.catbox.moe/9kqjf6.glb';
    const SHARK_NORMAL_MODEL_URL = 'https://files.catbox.moe/eqaydp.glb';

    loader.load(SNIPER_MODEL_URL, (gltf) => {
      setSniperModel(gltf.scene);
    }, undefined, (error) => {
      console.warn('Failed to load sniper model, falling back to procedural:', error);
    });

    loader.load(SHARK_RELOAD_MODEL_URL, (gltf) => {
      setSharkModelReload(gltf.scene);
    }, undefined, (error) => {
      console.warn('Failed to load shark reload model, falling back to procedural:', error);
    });

    loader.load(SHARK_NORMAL_MODEL_URL, (gltf) => {
      setSharkModelNormal(gltf.scene);
    }, undefined, (error) => {
      console.warn('Failed to load shark normal model, falling back to procedural:', error);
    });
  }, []);

  useFrame((state) => {
    if (!group.current || !player) return;
    
    // Sway effect
    const t = state.clock.getElapsedTime();
    const swayY = -0.5 + Math.sin(t * 2) * 0.01;
    const swayX = 0.5 + Math.cos(t * 1.5) * 0.01;
    
    // Kick effect
    if (muzzleFlashActive) {
      kickAmount.current = 0.15;
    }
    kickAmount.current *= 0.8;

    // Reload animation
    const isReloading = player.reloadingUntil > Date.now();
    const reloadProgress = isReloading 
      ? 1 - (player.reloadingUntil - Date.now()) / (WEAPONS[player.weapons[player.currentWeaponSlot]].reloadTime * 1000)
      : 0;
    
    // Dip the gun down and back up during reload
    const reloadDip = isReloading ? Math.sin(reloadProgress * Math.PI) * -0.5 : 0;
    const reloadRotation = isReloading ? Math.sin(reloadProgress * Math.PI) * -0.5 : 0;

    if (player.isADS) {
      group.current.position.lerp(new Vector3(0, -0.3 + reloadDip, -0.5 + kickAmount.current), 0.2);
    } else {
      group.current.position.lerp(new Vector3(swayX, swayY + reloadDip, -0.8 + kickAmount.current), 0.2);
    }
    group.current.rotation.x = reloadRotation;
  });

  if (!player) return null;
  const currentWeapon = WEAPONS[player.weapons[player.currentWeaponSlot]];
  const isReloading = player.reloadingUntil > Date.now();

  // Hide weapon model when scoping with sniper
  if (player.isADS && currentWeapon.id === 'sniper') return null;

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

      {/* Use Custom Models if available, otherwise use procedural shapes */}
      {sniperModel && currentWeapon.id === 'sniper' ? (
        <primitive 
          object={sniperModel.clone()} 
          scale={20} 
          rotation={[0, 0, 0]} 
          position={[0, 0, 0]}
        />
      ) : currentWeapon.id === 'shark' ? (
        <primitive 
          object={isReloading ? (sharkModelReload || sharkModelNormal || new Group()).clone() : (sharkModelNormal || sharkModelReload || new Group()).clone()} 
          scale={isReloading ? 12 : 10} 
          rotation={[0, -Math.PI / 2, 0]} 
          position={[0, 0, 0]}
        />
      ) : (
        <>
          {/* Simple Procedural Weapon Models */}
          {currentWeapon.id === 'sniper' && (
            <group>
              {/* Main Body/Receiver */}
              <mesh castShadow>
                <boxGeometry args={[0.1, 0.15, 0.6]} />
                <meshStandardMaterial color="#222" />
              </mesh>
              {/* Long Barrel */}
              <mesh castShadow position={[0, 0.04, -0.6]}>
                <boxGeometry args={[0.04, 0.04, 0.8]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              {/* Scope */}
              <mesh castShadow position={[0, 0.12, -0.1]}>
                <boxGeometry args={[0.06, 0.06, 0.3]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              {/* Stock */}
              <mesh castShadow position={[0, -0.05, 0.4]}>
                <boxGeometry args={[0.08, 0.2, 0.3]} />
                <meshStandardMaterial color="#3d2b1f" />
              </mesh>
              {/* Grip */}
              <mesh castShadow position={[0, -0.2, 0.1]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[0.06, 0.2, 0.08]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            </group>
          )}
          {currentWeapon.type === 'PRIMARY' && currentWeapon.id !== 'sniper' && currentWeapon.id !== 'shark' && (
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
        </>
      )}
    </group>
  );
};
