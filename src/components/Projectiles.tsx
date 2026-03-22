import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGameStore, WEAPONS } from '../hooks/useGameStore';
import { Group, Vector3, Raycaster } from 'three';

const Projectile = ({ id, position, velocity, ownerId, weaponId }: { id: string, position: [number, number, number], velocity: [number, number, number], ownerId: number, weaponId: string }) => {
  const damageBot = useGameStore(state => state.damageBot);
  const damagePlayer = useGameStore(state => state.damagePlayer);
  const addImpact = useGameStore(state => state.addImpact);
  const triggerHitMarker = useGameStore(state => state.triggerHitMarker);
  const meshRef = useRef<Group>(null);
  const [bulletModel, setBulletModel] = useState<Group | null>(null);
  const raycaster = useRef(new Raycaster());
  const lastPos = useRef(new Vector3(...position));

  useEffect(() => {
    if (weaponId === 'shark') {
      const loader = new GLTFLoader();
      loader.load(
        'https://files.catbox.moe/y7d1zd.glb', 
        (gltf) => {
          setBulletModel(gltf.scene);
        },
        undefined,
        (error) => {
          console.error('Failed to load shark model:', error);
          // Fallback is handled by the null check in return
        }
      );
    }
    if (weaponId === 'kunai') {
      // Kunai model loading removed as URL is failing, will fall back to procedural sphere
    }
  }, [weaponId]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const currentPos = meshRef.current.position;
    const vel = new Vector3(...velocity);
    const direction = vel.clone().normalize();
    const distance = vel.length() * delta;

    // Collision detection from last position to new position
    raycaster.current.set(lastPos.current, direction);
    raycaster.current.far = distance + 0.5; // Small buffer
    
    const intersects = raycaster.current.intersectObjects(state.scene.children, true)
      .filter(i => {
        let obj = i.object;
        if (obj.type === 'Line2' || obj.type === 'LineSegments2' || obj.name === 'tracer' || obj.name === 'impact') return false;
        
        let current = obj;
        while (current) {
          if (current.userData?.playerId === ownerId) return false;
          if (current.userData?.projectileId === id) return false;
          current = current.parent as any;
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

      // Calculate damage
      const weapon = WEAPONS[weaponId];
      let damage = weapon?.damage || 35;
      
      if (weaponId === 'shark') {
        const distFromOwner = new Vector3(...position).distanceTo(hitPoint);
        if (distFromOwner < 5) damage = 100;
        else if (distFromOwner < 15) damage = 50;
        else damage = 34;
      }

      if (botId) {
        damageBot(botId, damage, ownerId, [hitPoint.x, hitPoint.y, hitPoint.z]);
        triggerHitMarker(ownerId);
      } else if (hitPlayerId !== -1) {
        damagePlayer(hitPlayerId, damage);
        triggerHitMarker(ownerId);
      }

      addImpact([hitPoint.x, hitPoint.y, hitPoint.z], weaponId === 'admin_blaster' ? '#FF00FF' : 'orange', true, ownerId, weaponId === 'admin_blaster' ? 10 : 5, weaponId === 'admin_blaster' ? 500 : 50);
      
      useGameStore.setState(s => ({
        projectiles: s.projectiles.filter(p => p.id !== id)
      }));
      return;
    }

    // Move the projectile
    currentPos.add(vel.multiplyScalar(delta));
    lastPos.current.copy(currentPos);
    
    // Face the direction of travel
    meshRef.current.lookAt(currentPos.clone().add(direction));
  });

  return (
    <group ref={meshRef} position={position} userData={{ projectileId: id }}>
      {weaponId === 'admin_blaster' ? (
        <group>
          <mesh>
            <sphereGeometry args={[0.8]} />
            <meshBasicMaterial color="#FF00FF" />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.2]} />
            <meshBasicMaterial color="#FF00FF" transparent opacity={0.3} />
          </mesh>
          <pointLight color="#FF00FF" intensity={5} distance={5} />
        </group>
      ) : bulletModel ? (
        <primitive object={bulletModel.clone()} scale={100.0} rotation={[0, -Math.PI / 2, 0]} />
      ) : (
        <mesh>
          <sphereGeometry args={[0.5]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </group>
  );
};

export const Projectiles = () => {
  const projectileIdsString = useGameStore(state => state.projectiles.map(p => p.id).join(','));
  const projectileIds = React.useMemo(() => projectileIdsString.split(',').filter(Boolean), [projectileIdsString]);

  return (
    <>
      {projectileIds.map(id => (
        <ProjectileWrapper key={id} id={id} />
      ))}
    </>
  );
};

const ProjectileWrapper = ({ id }: { id: string }) => {
  const projectile = useGameStore(state => state.projectiles.find(p => p.id === id));
  if (!projectile) return null;
  return <Projectile {...projectile} />;
};
