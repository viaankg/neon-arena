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
          {(impact.color === 'purple' || impact.color === '#a020f0') ? (
            <group>
              <mesh>
                <sphereGeometry args={[impact.radius || 5]} />
                <meshPhongMaterial color={impact.color} transparent opacity={0.2} emissive={impact.color} emissiveIntensity={2} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[impact.radius || 5, 0.1, 16, 100]} />
                <meshBasicMaterial color="magenta" transparent opacity={0.5} />
              </mesh>
            </group>
          ) : (
            <mesh>
              <sphereGeometry args={[impact.isExplosion ? (impact.radius || 0.5) : 0.05]} />
              <meshBasicMaterial color={impact.color} transparent opacity={0.4} />
            </mesh>
          )}
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
