import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, useGLTF, Html, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/Dancing.glb?url';

useGLTF.preload(modelUrl);

const HeroAIModel = () => {
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, scene);

  React.useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstActionName = Object.keys(actions)[0];
      const action = actions[firstActionName];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions]);

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
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
      <primitive 
        object={scene} 
        position={[0, -3.8, 0]} 
        scale={3.5}
      />
    </Float>
  );
};

const HeroAssistant3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1.2, 2.8], fov: 35 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} color="#c084fc" />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#f59e0b" />
        <Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </Html>
        }>
          <HeroAIModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroAssistant3D;
