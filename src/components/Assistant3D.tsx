import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/Cipitio.glb?url';

// Preload the model to avoid lag on first render
useGLTF.preload(modelUrl);

// Animaciones disponibles en Cipitio.glb:
// Dancing, Running, Sad, Sitting, Walking, Waving
export type CipitioAnimation = 'Dancing' | 'Running' | 'Sad' | 'Sitting' | 'Walking' | 'Waving';

interface AIModelProps {
  animation?: CipitioAnimation;
  onEntryComplete?: () => void;
}

const AIModel: React.FC<AIModelProps> = ({ animation = 'Waving', onEntryComplete }) => {
  const { scene, animations } = useGLTF(modelUrl);
  const [phase, setPhase] = useState<'running' | 'done'>('running');
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<string>('');
  
  // Use the "Waving" model as the single base mesh (all clips apply to it)
  const baseModel = useMemo(() => {
    if (!scene) return null;
    // Pick the first available child — they all share the same skeleton
    const target = scene.children.find(c => c.name === 'Running') || scene.children[0];
    return target;
  }, [scene]);

  // Create a single mixer on the base model and cache all actions
  useEffect(() => {
    if (!baseModel) return;
    const mixer = new THREE.AnimationMixer(baseModel);
    mixerRef.current = mixer;

    for (const clip of animations) {
      const action = mixer.clipAction(clip);
      actionsRef.current[clip.name] = action;
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
      actionsRef.current = {};
    };
  }, [baseModel, animations]);

  // Start Running on mount
  useEffect(() => {
    const runAction = actionsRef.current['Running'];
    if (runAction) {
      runAction.reset().play();
      currentActionRef.current = 'Running';
    }
  }, [baseModel]);

  // Crossfade to target animation when phase changes
  useEffect(() => {
    if (phase !== 'done') return;
    const targetName = animation;
    const prevAction = actionsRef.current[currentActionRef.current];
    const nextAction = actionsRef.current[targetName];

    if (nextAction && prevAction && prevAction !== nextAction) {
      nextAction.reset().play();
      prevAction.crossFadeTo(nextAction, 0.4, true);
      currentActionRef.current = targetName;
    } else if (nextAction && !prevAction) {
      nextAction.reset().play();
      currentActionRef.current = targetName;
    }
  }, [phase, animation]);

  // Also handle external animation changes after entry is done
  useEffect(() => {
    if (phase !== 'done') return;
    const prevAction = actionsRef.current[currentActionRef.current];
    const nextAction = actionsRef.current[animation];

    if (nextAction && prevAction && currentActionRef.current !== animation) {
      nextAction.reset().play();
      prevAction.crossFadeTo(nextAction, 0.4, true);
      currentActionRef.current = animation;
    }
  }, [animation, phase]);

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    
    if (phase === 'running' && groupRef.current) {
      groupRef.current.position.x += delta * 3;
      if (groupRef.current.position.x >= 0) {
        groupRef.current.position.x = 0;
        setPhase('done');
        onEntryComplete?.();
      }
    }
  });

  // Fix materials
  useEffect(() => {
    if (baseModel) {
      baseModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.transparent = false;
            mat.alphaTest = 0.5;
            mat.depthWrite = true;
            mat.needsUpdate = true;
          }
        }
      });
    }
  }, [baseModel]);

  if (!baseModel) return null;

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
    >
      <group ref={groupRef} position={[-3, 0, 0]}>
        <primitive 
          object={baseModel} 
          position={[0, -1.8, 0]} 
          scale={1.8}
        />
      </group>
    </Float>
  );
};

interface Assistant3DProps {
  animation?: CipitioAnimation;
}

const Assistant3D: React.FC<Assistant3DProps> = ({ animation = 'Waving' }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Suspense fallback={null}>
          <AIModel animation={animation} />
          
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4} 
          />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default Assistant3D;

