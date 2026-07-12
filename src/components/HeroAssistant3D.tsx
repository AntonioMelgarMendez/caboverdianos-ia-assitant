import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Environment, useGLTF, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/mario.glb?url';

useGLTF.preload(modelUrl);

const HeroStaticModel = () => {
  const { scene } = useGLTF(modelUrl);

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
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.3}>
      <primitive 
        object={scene} 
        position={[0, -1.6, 0]} 
        scale={1.6}
        rotation={[0, 0.3, 0]}
      />
    </Float>
  );
};

const HeroAssistant3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0.5, 4], fov: 40 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1} color="#c084fc" />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#f59e0b" />
        <Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </Html>
        }>
          <HeroStaticModel />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
};

export default HeroAssistant3D;
