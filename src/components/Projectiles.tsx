import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGameStore } from '../hooks/useGameStore';
import { Group, Vector3, Raycaster } from 'three';

const Projectile = ({ id, position, velocity, ownerId, weaponId }: { id: string, position: [number, number, number], velocity: [number, number, number], ownerId: number, weaponId: string }) => {
  const { damageBot, damagePlayer, addImpact, triggerHitMarker } = useGameStore();
  const meshRef = useRef<Group>(null);
  const [bulletModel, setBulletModel] = useState<Group | null>(null);
  const raycaster = useRef(new Raycaster());
  const lastPos = useRef(new Vector3(...position));

  useEffect(() => {
    if (weaponId === 'shark') {
      const loader = new GLTFLoader();
      loader.load('https://files.catbox.moe/y7d1zd.glb', (gltf) => {
        setBulletModel(gltf.scene);
      });
    }
  }, [weaponId]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const currentPos = meshRef.current.position;
    const direction = new Vector3(...velocity).normalize();
    const distance = new Vector3(...velocity).length() * delta;

    // Collision detection
    (raycaster.current as any).camera = state.camera;
    raycaster.current.set(lastPos.current, direction);
    const intersects = raycaster.current.intersectObjects(state.scene.children, true)
      .filter(i => {
        let obj = i.object;
        // Skip tracers and impacts
        if (obj.type === 'Line2' || obj.type === 'LineSegments2' || obj.name === 'tracer' || obj.name === 'impact') return false;
        
        while (obj) {
          if (obj.userData?.playerId === ownerId) return false;
          if (obj.userData?.projectileId === id) return false;
          obj = obj.parent as any;
        }
        return true;
      });

    if (intersects.length > 0 && intersects[0].distance <= distance) {
      const hit = intersects[0];
      const hitPoint = hit.point;
      
      // Handle damage
      let targetObj = hit.object;
      let botId = '';
      let hitPlayerId = -1;

      while (targetObj) {
        if (targetObj.userData?.botId) {
          botId = targetObj.userData.botId;
          break;
        }
        if (targetObj.userData?.playerId !== undefined && targetObj.userData?.playerId !== ownerId) {
          hitPlayerId = targetObj.userData.playerId;
          break;
        }
        targetObj = targetObj.parent as any;
      }

      // Calculate damage based on distance for Shark Blaster
      let damage = 35; // Default
      if (weaponId === 'shark') {
        const distFromOwner = new Vector3(...position).distanceTo(hitPoint);
        if (distFromOwner < 5) damage = 100; // One shot
        else if (distFromOwner < 15) damage = 50; // Two shot
        else damage = 34; // Three shot
      }

      if (botId) {
        damageBot(botId, damage, ownerId, [hitPoint.x, hitPoint.y, hitPoint.z]);
        triggerHitMarker(ownerId);
      } else if (hitPlayerId !== -1) {
        damagePlayer(hitPlayerId, damage);
        triggerHitMarker(ownerId);
      }

      // Explosion effect
      addImpact([hitPoint.x, hitPoint.y, hitPoint.z], 'orange', true, ownerId, 5, 50);
      
      // Remove projectile from store
      useGameStore.setState(s => ({
        projectiles: s.projectiles.filter(p => p.id !== id)
      }));
    }

    lastPos.current.copy(currentPos);
  });

  return (
    <group ref={meshRef} position={position} userData={{ projectileId: id }}>
      {bulletModel ? (
        <primitive object={bulletModel.clone()} scale={8.0} rotation={[0, Math.PI, 0]} />
      ) : (
        <mesh>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </group>
  );
};

export const Projectiles = () => {
  const projectiles = useGameStore(state => state.projectiles);
  return (
    <>
      {projectiles.map(p => (
        <Projectile key={p.id} {...p} />
      ))}
    </>
  );
};
