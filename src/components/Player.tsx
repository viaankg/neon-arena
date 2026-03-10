import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3, Raycaster } from 'three';
import { useGameStore, WEAPONS } from '../hooks/useGameStore';
import { WeaponModel } from './WeaponModel';

interface PlayerProps {
  playerId: number;
  position: [number, number, number];
  viewport: { left: number; top: number; width: number; height: number };
}

export const Player: React.FC<PlayerProps> = ({ playerId, position, viewport }) => {
  const { camera, scene } = useThree();
  const { switchWeapon, reloadWeapon, setADS, setSliding, players, useAbility, addScore, updatePlayerPosition, triggerHitMarker, triggerMuzzleFlash, damageBot } = useGameStore();
  const playerState = players.find(p => p.id === playerId);

  const [ref, api] = useSphere(() => ({
    mass: 1,
    fixedRotation: true,
    position,
    args: [0.6],
    type: 'Dynamic',
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => {
    pos.current = p;
    updatePlayerPosition(playerId, p);
  }), [api.position, playerId, updatePlayerPosition]);

  const moveState = useRef({ forward: false, backward: false, left: false, right: false, jump: false });
  const lastShotTime = useRef(0);
  const raycaster = useRef(new Raycaster());
  const recoilOffset = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playerState?.isDead) return;
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
        case 'Space': moveState.current.jump = true; break;
        case 'ControlLeft': setSliding(playerId, true); break;
        case 'Digit1': switchWeapon(playerId, 0); break;
        case 'Digit2': switchWeapon(playerId, 1); break;
        case 'Digit3': switchWeapon(playerId, 2); break;
        case 'KeyT': reloadWeapon(playerId); break;
        case 'KeyQ': useAbility(playerId, 'SPEED'); break;
        case 'KeyE': useAbility(playerId, 'REWIND'); break;
        case 'KeyR': useAbility(playerId, 'SHIELD'); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
        case 'Space': moveState.current.jump = false; break;
        case 'ControlLeft': setSliding(playerId, false); break;
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) setADS(playerId, true);
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) setADS(playerId, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [playerId, switchWeapon, reloadWeapon, setADS, setSliding, useAbility, playerState?.isDead]);

  useFrame((state) => {
    if (!playerState || playerState.isDead) return;

    const { forward, backward, left, right, jump } = moveState.current;
    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, Number(backward) - Number(forward));
    const sideVector = new Vector3(Number(left) - Number(right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(playerState.isSliding ? 15 : 7)
      .applyEuler(camera.rotation);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (jump && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], 5, velocity.current[2]);
    }

    // Apply recoil to camera
    recoilOffset.current *= 0.9;
    camera.rotation.x += recoilOffset.current;

    camera.position.copy(new Vector3(pos.current[0], pos.current[1] + (playerState.isSliding ? 0.4 : 0.8), pos.current[2]));

    // Shooting logic
    if (state.mouse.buttons === 1) {
      const weapon = WEAPONS[playerState.weapons[playerState.currentWeaponSlot]];
      const now = state.clock.getElapsedTime();
      if (now - lastShotTime.current > weapon.fireRate && playerState.ammo[weapon.id] > 0) {
        lastShotTime.current = now;
        triggerMuzzleFlash(playerId);
        recoilOffset.current = weapon.recoil;
        
        // Consume ammo
        useGameStore.setState((s) => ({
          players: s.players.map(p => p.id === playerId ? {
            ...p,
            ammo: { ...p.ammo, [weapon.id]: p.ammo[weapon.id] - 1 }
          } : p)
        }));
        
        // Raycast shooting
        raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        
        const botHit = intersects.find(i => {
          let obj = i.object;
          while (obj) {
            if (obj.userData?.botId) return true;
            obj = obj.parent as any;
          }
          return false;
        });

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
          damageBot(botId, weapon.damage, playerId);
        }
      }
    }
  });

  return (
    <>
      <mesh ref={ref as any}>
        <sphereGeometry args={[0.6]} />
        <meshStandardMaterial color="blue" transparent opacity={0} />
      </mesh>
      <group position={[pos.current[0], pos.current[1] + 0.8, pos.current[2]]}>
        <WeaponModel playerId={playerId} />
      </group>
    </>
  );
};


