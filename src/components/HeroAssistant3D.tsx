import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Environment, useGLTF, Html, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import modelUrl from '../assets/Cipitio.glb?url';

useGLTF.preload(modelUrl);

const HeroCharacterModel = () => {
  const { scene, animations } = useGLTF(modelUrl);
  
  const { ref, actions } = useAnimations(animations);
  const currentAction = useRef<string | null>(null);

  // Cycle animations to make it look alive
  React.useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const cycle = ['Waving', 'Dancing', 'Sitting'];
    let currentIndex = 0;
    
    const playAnimation = (name: string) => {
      const action = actions[name];
      if (!action) return;
      
      if (currentAction.current && actions[currentAction.current]) {
        actions[currentAction.current]!.fadeOut(0.5);
      }
      
      action.reset().fadeIn(0.5).play();
      currentAction.current = name;
    };

    // Initial animation
    playAnimation(cycle[currentIndex]);

    // Change animation every 8 seconds
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % cycle.length;
      playAnimation(cycle[currentIndex]);
    }, 8000);

    return () => clearInterval(interval);
  }, [actions]);

  // Fix materials
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
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
  }, [scene]);

  return (
    <Float speed={1.8} rotationIntensity={0.08} floatIntensity={0.15}>
      <primitive 
        ref={ref}
        object={scene} 
        position={[0, -2.2, 0]} 
        scale={2.2} 
        rotation={[0.05, -0.2, 0]} 
      />
    </Float>
  );
};

const HeroAssistant3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0.3, 5], fov: 35 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1} color="#e9d5ff" />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#fbbf24" />
        <pointLight position={[0, 3, 2]} intensity={0.5} color="#c084fc" />
        <Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </Html>
        }>
          <HeroCharacterModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroAssistant3D;
