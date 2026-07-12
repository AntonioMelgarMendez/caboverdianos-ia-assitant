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
}

const AIModel: React.FC<AIModelProps> = ({ animation = 'Waving' }) => {
  const { scene, animations } = useGLTF(modelUrl);
  const [phase, setPhase] = useState<'running' | 'transitioning' | 'idle'>('running');
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(1);
  const transitionTimer = useRef(0);

  // Determine which animation name to use for the model child
  const activeAnimName = phase === 'running' ? 'Running' : animation;

  // Find the model child matching the active animation
  const targetName = animations.find(a => a.name === activeAnimName) ? activeAnimName : animations[0]?.name;
  const model = useMemo(() => {
    if (!scene) return null;
    return scene.children.find(c => c.name === targetName) || scene.children[0];
  }, [scene, targetName]);

  const clip = useMemo(() => {
    return animations.find(a => a.name === targetName);
  }, [animations, targetName]);

  const mixer = useMemo(() => {
    if (!model) return null;
    return new THREE.AnimationMixer(model);
  }, [model]);

  useEffect(() => {
    if (!mixer || !clip) return;
    const action = mixer.clipAction(clip);
    action.play();
    return () => {
      action.stop();
    };
  }, [mixer, clip]);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);

    if (!groupRef.current) return;

    if (phase === 'running') {
      // Slide from left to center
      groupRef.current.position.x += delta * 2.5;
      if (groupRef.current.position.x >= 0) {
        groupRef.current.position.x = 0;
        // Begin transition: shrink briefly to mask model swap
        setPhase('transitioning');
        transitionTimer.current = 0;
      }
    }

    if (phase === 'transitioning') {
      transitionTimer.current += delta;
      // Quick scale down over 0.15s, then React will swap to the idle model
      const t = Math.min(transitionTimer.current / 0.15, 1);
      scaleRef.current = 1 - t * 0.3; // Shrink to 70%
      groupRef.current.scale.setScalar(scaleRef.current);
      if (t >= 1) {
        setPhase('idle');
      }
    }

    if (phase === 'idle' && scaleRef.current < 1) {
      // Scale back up smoothly
      scaleRef.current = Math.min(scaleRef.current + delta * 4, 1);
      groupRef.current.scale.setScalar(scaleRef.current);
    }
  });

  // Fix materials
  useEffect(() => {
    if (model) {
      model.traverse((child) => {
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
  }, [model]);

  if (!model) return null;

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
    >
      <group ref={groupRef} position={[-2.5, 0, 0]}>
        <primitive
          object={model}
          position={[0, -1.8, 0]}
          scale={1.8}
          rotation={phase === 'running' ? [0, -Math.PI / 2, 0] : [0, 0, 0]}
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


