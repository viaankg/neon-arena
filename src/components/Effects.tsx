import React from 'react';
import { Line } from '@react-three/drei';
import { useGameStore } from '../hooks/useGameStore';

export const Effects: React.FC = () => {
  const impacts = useGameStore(state => state.impacts);
  const tracers = useGameStore(state => state.tracers);

  return (
    <>
      {impacts.map((impact) => (
        <group key={impact.id} position={impact.position}>
          <pointLight color={impact.color} intensity={impact.isExplosion ? 5 : 1} distance={impact.isExplosion ? 10 : 2} />
          <mesh>
            <sphereGeometry args={[impact.isExplosion ? (impact.radius || 0.5) : 0.05]} />
            <meshBasicMaterial color={impact.color} transparent opacity={0.4} />
          </mesh>
          {impact.isExplosion && (
            <mesh>
              <sphereGeometry args={[impact.radius || 1]} />
              <meshBasicMaterial color="red" transparent opacity={0.1} wireframe />
            </mesh>
          )}
        </group>
      ))}
      {tracers.map((tracer) => (
        <Line
          key={tracer.id}
          points={[tracer.start, tracer.end]}
          color="yellow"
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      ))}
    </>
  );
};
