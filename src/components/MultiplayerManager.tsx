import React, { useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, deleteDoc, serverTimestamp, increment, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { useGameStore } from '../hooks/useGameStore';

export const MultiplayerManager = () => {
  const user = useGameStore(state => state.user);
  const currentSessionId = useGameStore(state => state.currentSessionId);
  const isHost = useGameStore(state => state.isHost);
  const playerPositions = useGameStore(state => state.playerPositions);
  const players = useGameStore(state => state.players);
  
  const currentWave = useGameStore(state => state.currentWave);
  const waveIntermission = useGameStore(state => state.waveIntermission);
  const waveIntermissionTimer = useGameStore(state => state.waveIntermissionTimer);

  const gameState = useGameStore(state => state.gameState);
  
  const setRemotePlayers = useGameStore(state => state.setRemotePlayers);

  // Update session status to playing when host starts
  useEffect(() => {
    if (isHost && currentSessionId && gameState === 'PLAYING') {
      const sessionRef = doc(db, 'sessions', currentSessionId);
      updateDoc(sessionRef, { status: 'playing' })
        .catch(err => console.error('Error updating session status:', err));
    }
  }, [isHost, currentSessionId, gameState]);
  
  // Join/Leave logic (playerCount and cleanup)
  useEffect(() => {
    if (!user || !currentSessionId) return;

    const sessionRef = doc(db, 'sessions', currentSessionId);
    const playerRef = doc(db, 'sessions', currentSessionId, 'players', user.uid);

    const joinSession = async () => {
      try {
        await runTransaction(db, async (transaction) => {
          const sessionSnap = await transaction.get(sessionRef);
          if (!sessionSnap.exists()) return;
          const currentCount = sessionSnap.data().playerCount || 0;
          transaction.update(sessionRef, { playerCount: currentCount + 1 });
        });
      } catch (err) {
        console.error('Error joining session:', err);
      }
    };

    const leaveSession = async () => {
      try {
        // 1. Delete player document
        await deleteDoc(playerRef).catch(() => {});
        
        // 2. Use transaction to decrement and potentially delete session
        await runTransaction(db, async (transaction) => {
          const sessionSnap = await transaction.get(sessionRef);
          if (!sessionSnap.exists()) return;

          const currentCount = sessionSnap.data().playerCount || 1;
          const newCount = Math.max(0, currentCount - 1);
          
          if (newCount <= 0) {
            transaction.delete(sessionRef);
          } else {
            transaction.update(sessionRef, { playerCount: newCount });
          }
        });
      } catch (err) {
        console.error('Error leaving session:', err);
      }
    };

    joinSession();

    const handleUnload = () => {
      // We can't await here, but we can trigger it
      leaveSession();
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      leaveSession();
    };
  }, [user, currentSessionId]);

  // Listen for session updates (map, difficulty, etc.)
  useEffect(() => {
    if (!currentSessionId) return;

    const sessionRef = doc(db, 'sessions', currentSessionId);
    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (isHost) return; // Host is the source of truth
        
        if (data.map) {
          useGameStore.getState().setMap(data.map);
        }
        if (data.difficulty) {
          useGameStore.getState().setDifficulty(data.difficulty);
        }
        if (data.maxWaves) {
          useGameStore.getState().setMaxWaves(data.maxWaves);
        }
        if (data.currentWave !== undefined) {
          useGameStore.getState().setCurrentWave(data.currentWave);
        }
        if (data.waveIntermission !== undefined) {
          useGameStore.getState().setWaveIntermission(data.waveIntermission);
        }
        if (data.waveIntermissionTimer !== undefined) {
          useGameStore.getState().setWaveIntermissionTimer(data.waveIntermissionTimer);
        }
      }
    });

    return unsubscribe;
  }, [currentSessionId]);

  // Sync local player state to Firestore
  useEffect(() => {
    if (!user || !currentSessionId) return;

    const localPlayer = players.find(p => p.id === 0);
    if (!localPlayer) return;

    const playerRef = doc(db, 'sessions', currentSessionId, 'players', user.uid);
    
    const syncInterval = setInterval(async () => {
      try {
        await setDoc(playerRef, {
          uid: user.uid,
          username: user.displayName || 'Anonymous',
          position: playerPositions[0] || [0, 0, 0],
          health: localPlayer.health,
          score: localPlayer.score,
          isDead: localPlayer.isDead,
          currentWeapon: localPlayer.weapons[localPlayer.currentWeaponSlot],
          lastUpdate: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `sessions/${currentSessionId}/players/${user.uid}`);
      }
    }, 100); // Sync every 100ms

    return () => {
      clearInterval(syncInterval);
    };
  }, [user, currentSessionId, playerPositions, players]);

  // Listen for other players
  useEffect(() => {
    if (!currentSessionId) return;

    const playersRef = collection(db, 'sessions', currentSessionId, 'players');
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const remotePlayers = snapshot.docs
        .map(doc => doc.data())
        .filter(p => p.uid !== user?.uid);
      
      setRemotePlayers(remotePlayers);
    });

    return unsubscribe;
  }, [currentSessionId, user, setRemotePlayers]);

  // Sync wave state to Firestore (Host only)
  useEffect(() => {
    if (!user || !currentSessionId || !isHost) return;

    const sessionRef = doc(db, 'sessions', currentSessionId);
    
    // Throttle updates to every 500ms to avoid excessive writes
    const syncInterval = setInterval(async () => {
      try {
        await updateDoc(sessionRef, {
          currentWave,
          waveIntermission,
          waveIntermissionTimer
        });
      } catch (err) {
        console.error('Error syncing wave state:', err);
      }
    }, 500);

    return () => clearInterval(syncInterval);
  }, [user, currentSessionId, isHost, currentWave, waveIntermission, waveIntermissionTimer]);

  return null;
};
