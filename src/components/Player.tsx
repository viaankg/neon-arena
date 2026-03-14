import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Raycaster, Vector2, Group, MathUtils } from 'three';
import { useKeyboardControls } from '@react-three/drei';
import { useGameStore, WEAPONS } from '../hooks/useGameStore';
import { WeaponModel } from './WeaponModel';
import { soundManager } from '../services/SoundManager';

interface PlayerProps {
  playerId: number;
  position: [number, number, number];
  viewport: { left: number; top: number; width: number; height: number };
}

export const Player: React.FC<PlayerProps> = ({ playerId, position, viewport }) => {
  const { camera, scene } = useThree();
  const { switchWeapon, reloadWeapon, setADS, setSliding, players, useAbility, addScore, updatePlayerPosition, triggerHitMarker, triggerMuzzleFlash, damageBot, tick } = useGameStore();
  const playerState = players.find(p => p.id === playerId);
  const weaponGroup = useRef<Group>(null);
  const rotation = useRef({ x: 0, y: 0 });

  const [ref, api] = useSphere(() => ({
    mass: 1,
    fixedRotation: true,
    position,
    args: [0.6],
    type: 'Dynamic',
    allowSleep: false,
    friction: 0,
    linearDamping: 0.1,
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef(position);
  const lastRewindTime = useRef(0);

  useEffect(() => {
    updatePlayerPosition(playerId, position);
    const unsubscribe = api.position.subscribe((p) => {
      pos.current = p;
      updatePlayerPosition(playerId, p);
    });
    return unsubscribe;
  }, [api.position, playerId, updatePlayerPosition, position]);

  // Handle Rewind Teleport
  useEffect(() => {
    if (playerState?.activeAbilities.REWIND && playerState.activeAbilities.REWIND > 0) {
      const targetPos = playerState.positionHistory[0];
      if (targetPos && Date.now() - lastRewindTime.current > 1000) {
        api.position.set(targetPos[0], targetPos[1], targetPos[2]);
        api.velocity.set(0, 0, 0);
        lastRewindTime.current = Date.now();
      }
    }
  }, [playerState?.activeAbilities.REWIND, playerState?.positionHistory, api.position, api.velocity]);

  const moveState = useRef({ forward: false, backward: false, left: false, right: false, jump: false, shooting: false });
  const lastShotTime = useRef(0);
  const raycaster = useRef(new Raycaster());
  const recoilOffset = useRef(0);
  const [, getKeys] = useKeyboardControls();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) moveState.current.shooting = true;
      if (e.button === 2) setADS(playerId, true);
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) moveState.current.shooting = false;
      if (e.button === 2) setADS(playerId, false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (playerState?.isDead || !document.pointerLockElement) return;
      
      const currentWeaponId = playerState?.weapons[playerState.currentWeaponSlot];
      const isSniperADS = playerState?.isADS && currentWeaponId === 'sniper';
      
      // Sensitivity scaling
      const sensitivity = isSniperADS ? 0.0005 : 0.002;
      
      rotation.current.y -= e.movementX * sensitivity;
      rotation.current.x -= e.movementY * sensitivity;
      rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [playerId, setADS, playerState?.isDead, playerState?.weapons, playerState?.currentWeaponSlot, playerState?.isADS]);

  useFrame((state, delta) => {
    if (!playerState || playerState.isDead) return;

    // Tick cooldowns and durations (only once per frame per player)
    tick(delta);

    const keys = getKeys();
    const forward = keys.forward;
    const backward = keys.backward;
    const left = keys.left;
    const right = keys.right;
    const jump = keys.jump;

    // Handle instant key presses
    if (keys.weapon1) switchWeapon(playerId, 0);
    if (keys.weapon2) switchWeapon(playerId, 1);
    if (keys.weapon3) switchWeapon(playerId, 2);
    if (keys.reload) reloadWeapon(playerId);
    if (keys.ability1) useAbility(playerId, 'SPEED');
    if (keys.ability2) useAbility(playerId, 'REWIND');
    if (keys.ability3) useAbility(playerId, 'SHIELD');
    if (keys.ability4) useAbility(playerId, 'STUN');

    let speed = 12; // Increased base speed
    if (playerState.isSliding) speed = 20;
    if (playerState.activeAbilities.SPEED > 0) speed *= 2.0;

    // Simplified movement logic
    const moveVector = new Vector3(0, 0, 0);
    if (forward) moveVector.z -= 1;
    if (backward) moveVector.z += 1;
    if (left) moveVector.x -= 1;
    if (right) moveVector.x += 1;

    moveVector.normalize().multiplyScalar(speed);
    
    // Rotate moveVector by yaw
    moveVector.applyAxisAngle(new Vector3(0, 1, 0), rotation.current.y);

    // Apply velocity directly
    api.velocity.set(moveVector.x, velocity.current[1], moveVector.z);

    if (jump && Math.abs(velocity.current[1]) < 0.1) {
      api.velocity.set(velocity.current[0], 6, velocity.current[2]);
    }

    // Apply recoil to camera (visual only on weapon model now)
    recoilOffset.current *= 0.9;

    // FOV Zoom
    const currentWeaponId = playerState.weapons[playerState.currentWeaponSlot];
    const targetFOV = playerState.isADS ? (currentWeaponId === 'sniper' ? 20 : 45) : 75;
    
    if ('fov' in camera) {
      const pCamera = camera as any;
      pCamera.fov = MathUtils.lerp(pCamera.fov, targetFOV, 0.2);
      pCamera.updateProjectionMatrix();
    }

    camera.position.copy(new Vector3(pos.current[0], pos.current[1] + (playerState.isSliding ? 0.4 : 0.8), pos.current[2]));
    camera.rotation.set(rotation.current.x, rotation.current.y, 0, 'YXZ');

    if (weaponGroup.current) {
      weaponGroup.current.position.copy(camera.position);
      weaponGroup.current.rotation.copy(camera.rotation);
    }

    // Shooting logic
    if (moveState.current.shooting) {
      const weapon = WEAPONS[playerState.weapons[playerState.currentWeaponSlot]];
      const now = state.clock.getElapsedTime();
      
      // Melee weapons don't consume ammo and have different logic
      const hasAmmo = weapon.isMelee ? true : playerState.ammo[weapon.id] > 0;
      const isReloading = playerState.reloadingUntil > Date.now();

      if (moveState.current.shooting && !hasAmmo && !isReloading && !weapon.isMelee) {
        reloadWeapon(playerId);
      }

      if (now - lastShotTime.current > weapon.fireRate && hasAmmo && !isReloading) {
        lastShotTime.current = now;
        
        if (weapon.id === 'shark') {
          const gunPos = new Vector3(0.3, -0.3, -0.5).applyMatrix4(camera.matrixWorld);
          const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
          const velocity = direction.multiplyScalar(weapon.projectileSpeed || 50);
          
          useGameStore.getState().addProjectile({
            position: [gunPos.x, gunPos.y, gunPos.z],
            velocity: [velocity.x, velocity.y, velocity.z],
            ownerId: playerId,
            weaponId: weapon.id
          });
        } else if (weapon.isMelee) {
          soundManager.playMelee();
        } else {
          triggerMuzzleFlash(playerId);
          soundManager.playShoot();
          recoilOffset.current = weapon.recoil;
          
          // Consume ammo
          useGameStore.setState((s) => ({
            players: s.players.map(p => p.id === playerId ? {
              ...p,
              ammo: { ...p.ammo, [weapon.id]: p.ammo[weapon.id] - 1 }
            } : p)
          }));
        }

        // Raycast shooting (only for non-projectile weapons)
        if (weapon.id !== 'shark') {
          const currentCamera = state.camera;
          if (currentCamera) {
            // Fix for LineSegments2 raycasting error
            (raycaster.current as any).camera = currentCamera;
            raycaster.current.setFromCamera(new Vector2(0, 0), currentCamera);
            
            // Filter out the player's own mesh and effects/tracers
            const intersects = raycaster.current.intersectObjects(scene.children, true)
              .filter(i => {
                let obj = i.object;
                // Skip tracers and impacts
                if (obj.type === 'Line2' || obj.type === 'LineSegments2' || obj.name === 'tracer' || obj.name === 'impact') return false;
                
                while (obj) {
                  if (obj.userData?.playerId === playerId) return false;
                  obj = obj.parent as any;
                }
                return true;
              });
            
            // Melee has limited range
            const maxRange = weapon.isMelee ? 3 : 100;
            const validIntersects = intersects.filter(i => i.distance <= maxRange);

            const botHit = validIntersects.find(i => {
              let obj = i.object;
              while (obj) {
                if (obj.userData?.botId) return true;
                obj = obj.parent as any;
              }
              return false;
            });

            const gunPos = new Vector3(0.3, -0.3, -0.5).applyMatrix4(currentCamera.matrixWorld);

            if (botHit) {
              let botObj = botHit.object;
              let botId = '';
              while (botObj) {
                if (botObj.userData?.botId) {
                  botId = botObj.userData.botId;
                  break;
                }
                botObj = botObj.parent as any;
              }
              
              triggerHitMarker(playerId);
              damageBot(botId, weapon.damage, playerId, [botHit.point.x, botHit.point.y, botHit.point.z]);
              
              if (!weapon.isMelee) {
                useGameStore.getState().addTracer([gunPos.x, gunPos.y, gunPos.z], [botHit.point.x, botHit.point.y, botHit.point.z]);
              }
            } else if (validIntersects.length > 0) {
              // Hit something else (walls, floor)
              const hit = validIntersects[0];
              useGameStore.getState().addImpact([hit.point.x, hit.point.y, hit.point.z], 'white');
              if (!weapon.isMelee) {
                useGameStore.getState().addTracer([gunPos.x, gunPos.y, gunPos.z], [hit.point.x, hit.point.y, hit.point.z]);
              }
            } else if (!weapon.isMelee) {
              // Miss into the sky (only for ranged)
              const endPos = raycaster.current.ray.at(100, new Vector3());
              useGameStore.getState().addTracer([gunPos.x, gunPos.y, gunPos.z], [endPos.x, endPos.y, endPos.z]);
            }
          }
        } else {
          // Shark Blaster still consumes ammo
          useGameStore.setState((s) => ({
            players: s.players.map(p => p.id === playerId ? {
              ...p,
              ammo: { ...p.ammo, [weapon.id]: p.ammo[weapon.id] - 1 }
            } : p)
          }));
          triggerMuzzleFlash(playerId);
          soundManager.playShoot();
          recoilOffset.current = weapon.recoil;
        }
      }
    }
  });

  return (
    <>
      <mesh ref={ref as any} userData={{ playerId }}>
        <sphereGeometry args={[0.6]} />
        <meshStandardMaterial color="blue" transparent opacity={0} />
      </mesh>
      <group ref={weaponGroup}>
        <WeaponModel playerId={playerId} />
      </group>
    </>
  );
};


