import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGameStore, WEAPONS, SKINS } from '../hooks/useGameStore';
import { Vector3, Group, Mesh, MeshStandardMaterial } from 'three';

export const WeaponModel = ({ playerId }: { playerId: number }) => {
  // Optimize selectors to prevent re-renders on every move
  const currentWeaponSlot = useGameStore(state => state.players.find(p => p.id === playerId)?.currentWeaponSlot);
  const weapons = useGameStore(state => state.players.find(p => p.id === playerId)?.weapons);
  const isADS = useGameStore(state => state.players.find(p => p.id === playerId)?.isADS);
  const reloadingUntil = useGameStore(state => state.players.find(p => p.id === playerId)?.reloadingUntil);
  const isDead = useGameStore(state => state.players.find(p => p.id === playerId)?.isDead);
  const selectedSkins = useGameStore(state => state.selectedSkins);

  const group = useRef<Group>(null);
  const kickAmount = useRef(0);
  const muzzleFlashActive = useGameStore(state => state.muzzleFlash.active && state.muzzleFlash.playerId === playerId);

  const [models, setModels] = useState<Record<string, Group>>({});

  useEffect(() => {
    const loader = new GLTFLoader();
    const modelUrls = {
      sniper: 'https://files.catbox.moe/4n0pqq.glb',
      shark: 'https://files.catbox.moe/eqaydp.glb',
      ak47: 'https://files.catbox.moe/w7jh1t.glb'
    };

    Object.entries(modelUrls).forEach(([id, url]) => {
      loader.load(url, (gltf) => {
        setModels(prev => ({ ...prev, [id]: gltf.scene }));
      }, undefined, (err) => {
        console.error(`Failed to load model ${id}:`, err);
      });
    });
  }, []);

  const currentWeaponId = currentWeaponSlot !== undefined && weapons !== undefined ? weapons[currentWeaponSlot] : null;
  const currentSkinId = currentWeaponId ? selectedSkins[currentWeaponId] : null;
  const currentSkin = currentSkinId ? SKINS[currentSkinId] : null;
  const skinColor = currentSkin?.color;

  const applySkin = (model: Group | null, weaponId: string) => {
    if (!model) return null;
    const clone = model.clone();
    if (skinColor && weaponId === currentWeaponId) {
      clone.traverse((child: any) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.color.set(skinColor);
        }
      });
    }
    return clone;
  };

  const akModelInstance = useMemo(() => applySkin(models.ak47, 'ak47'), [models.ak47, skinColor, currentWeaponId]);
  const sniperModelInstance = useMemo(() => applySkin(models.sniper, 'sniper'), [models.sniper, skinColor, currentWeaponId]);
  const sharkModelInstance = useMemo(() => applySkin(models.shark, 'shark'), [models.shark, skinColor, currentWeaponId]);

  useFrame((state) => {
    if (!group.current || isDead || currentWeaponSlot === undefined || weapons === undefined) return;
    
    const currentWeapon = WEAPONS[weapons[currentWeaponSlot]];
    
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
    const isReloading = reloadingUntil !== undefined && reloadingUntil > Date.now();
    const reloadProgress = isReloading 
      ? 1 - (reloadingUntil - Date.now()) / (WEAPONS[weapons[currentWeaponSlot]].reloadTime * 1000)
      : 0;
    
    // Dip the gun down and back up during reload
    const reloadDip = isReloading ? Math.sin(reloadProgress * Math.PI) * -0.5 : 0;
    const reloadRotation = isReloading ? Math.sin(reloadProgress * Math.PI) * -0.5 : 0;

    if (isADS) {
      group.current.position.lerp(new Vector3(0, -0.3 + reloadDip, -0.5 + kickAmount.current), 0.2);
    } else {
      group.current.position.lerp(new Vector3(swayX, swayY + reloadDip, -0.8 + kickAmount.current), 0.2);
    }
    
    // Special rotation for Admin Blaster
    if (currentWeapon.id === 'admin_blaster') {
      group.current.rotation.z = t * 2;
    } else {
      group.current.rotation.z = 0;
    }
    
    group.current.rotation.x = reloadRotation;
  });

  if (isDead || currentWeaponSlot === undefined || weapons === undefined) return null;
  const currentWeapon = WEAPONS[weapons[currentWeaponSlot]];
  const isReloading = reloadingUntil !== undefined && reloadingUntil > Date.now();

  // Hide weapon model when scoping with sniper
  if (isADS && currentWeapon.id === 'sniper') return null;

  const renderModel = () => {
    if (currentWeapon.id === 'admin_blaster') {
      return (
        <group>
          {/* Core body */}
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.25, 1.0]} />
            <meshStandardMaterial color="#000" metalness={1} roughness={0} />
          </mesh>
          {/* Glowing rings */}
          {[0, 1, 2].map(i => (
            <mesh key={i} position={[0, 0, -0.3 + i * 0.3]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.02, 16, 32]} />
              <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={2} />
            </mesh>
          ))}
          {/* Energy core */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={5} />
          </mesh>
          {/* Floating shards */}
          {[0, 1, 2, 3].map(i => (
            <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.2, Math.sin(i * Math.PI / 2) * 0.2, -0.5]}>
              <boxGeometry args={[0.05, 0.05, 0.2]} />
              <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={1} />
            </mesh>
          ))}
        </group>
      );
    }
    if (currentWeapon.id === 'sniper' && sniperModelInstance) {
      return (
        <primitive 
          object={sniperModelInstance} 
          scale={20} 
          rotation={[0, 0, 0]} 
          position={[0, 0, 0]}
        />
      );
    }
    if (currentWeapon.id === 'ak47' && akModelInstance) {
      return (
        <primitive 
          object={akModelInstance} 
          scale={15} 
          rotation={[0, 0, 0]} 
          position={[0, -0.2, 0.2]}
        />
      );
    }
    if (currentWeapon.id === 'shark' && sharkModelInstance) {
      return (
        <primitive 
          object={sharkModelInstance} 
          scale={isReloading ? 12 : 10} 
          rotation={[0, -Math.PI / 2, 0]} 
          position={[0, 0, 0]}
        />
      );
    }

    // Procedural Fallbacks
    return (
      <>
        {currentWeapon.id === 'sniper' && (
          <group>
            <mesh castShadow><boxGeometry args={[0.1, 0.15, 0.6]} /><meshStandardMaterial color={skinColor || "#222"} /></mesh>
            <mesh castShadow position={[0, 0.04, -0.6]}><boxGeometry args={[0.04, 0.04, 0.8]} /><meshStandardMaterial color={skinColor || "#111"} /></mesh>
            <mesh castShadow position={[0, 0.12, -0.1]}><boxGeometry args={[0.06, 0.06, 0.3]} /><meshStandardMaterial color={skinColor || "#111"} /></mesh>
            <mesh castShadow position={[0, -0.05, 0.4]}><boxGeometry args={[0.08, 0.2, 0.3]} /><meshStandardMaterial color="#3d2b1f" /></mesh>
            <mesh castShadow position={[0, -0.2, 0.1]} rotation={[-0.2, 0, 0]}><boxGeometry args={[0.06, 0.2, 0.08]} /><meshStandardMaterial color="#111" /></mesh>
          </group>
        )}
        {currentWeapon.id === 'shotgun' && (
          <group>
            {/* Main body */}
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.12, 0.18, 0.7]} />
              <meshStandardMaterial color={skinColor || "#222"} />
            </mesh>
            {/* Barrel */}
            <mesh castShadow position={[0, 0.04, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
              <meshStandardMaterial color={skinColor || "#111"} />
            </mesh>
            {/* Pump handle */}
            <mesh castShadow position={[0, -0.05, -0.3]}>
              <boxGeometry args={[0.1, 0.08, 0.3]} />
              <meshStandardMaterial color="#3d2b1f" />
            </mesh>
            {/* Grip */}
            <mesh castShadow position={[0, -0.15, 0.2]} rotation={[-0.3, 0, 0]}>
              <boxGeometry args={[0.08, 0.25, 0.1]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            {/* Stock */}
            <mesh castShadow position={[0, -0.05, 0.5]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[0.1, 0.25, 0.4]} />
              <meshStandardMaterial color="#3d2b1f" />
            </mesh>
          </group>
        )}
        {currentWeapon.type === 'PRIMARY' && currentWeapon.id !== 'sniper' && currentWeapon.id !== 'shark' && currentWeapon.id !== 'shotgun' && (
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.2, 0.8]} />
            <meshStandardMaterial color={skinColor || (currentWeapon.isEnergy ? "cyan" : "gray")} />
            <mesh position={[0, -0.15, 0.2]}>
              <boxGeometry args={[0.08, 0.3, 0.1]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </mesh>
        )}
        {currentWeapon.type === 'SECONDARY' && (
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.15, 0.4]} />
            <meshStandardMaterial color={skinColor || (currentWeapon.isEnergy ? "magenta" : "zinc")} />
            <mesh position={[0, -0.1, 0.1]}>
              <boxGeometry args={[0.06, 0.2, 0.08]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </mesh>
        )}
        {currentWeapon.type === 'MELEE' && (
          <mesh castShadow rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[0.02, 0.1, 0.6]} />
            <meshStandardMaterial color={skinColor || "silver"} metalness={1} roughness={0.1} />
            <mesh position={[0, 0, 0.3]}>
              <boxGeometry args={[0.05, 0.05, 0.2]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </mesh>
        )}
      </>
    );
  };

  return (
    <group ref={group}>
      {/* Muzzle Flash */}
      {muzzleFlashActive && (
        <group position={[0, 0, -0.8]}>
          <pointLight 
            color={currentWeapon.id === 'admin_blaster' ? "#FF00FF" : "orange"} 
            intensity={currentWeapon.id === 'admin_blaster' ? 10 : 2} 
            distance={5} 
          />
          <mesh>
            <sphereGeometry args={[currentWeapon.id === 'admin_blaster' ? 0.3 : 0.05]} />
            <meshBasicMaterial color={currentWeapon.id === 'admin_blaster' ? "#FF00FF" : "yellow"} />
          </mesh>
          {currentWeapon.id === 'admin_blaster' && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.1, 0.8, 32]} />
              <meshBasicMaterial color="#FF00FF" transparent opacity={0.5} />
            </mesh>
          )}
        </group>
      )}
      {renderModel()}
    </group>
  );
};

