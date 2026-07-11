import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/nayib_bukele_3d.glb?url';

const AIModel = () => {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Group>(null);

  // Simple idle animation (rotation)
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.2} // XYZ rotation intensity
      floatIntensity={0.5} // Up/down float intensity
    >
      <primitive 
        ref={modelRef} 
        object={scene} 
        position={[0, -1, 0]} 
        scale={1.5} 
      />
    </Float>
  );
};

const Assistant3D: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Environment lighting for realistic reflections */}
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Suspense fallback={null}>
          <AIModel />
          
          {/* Subtle shadow below the model */}
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4} 
          />
        </Suspense>

        {/* Allow user to rotate the model gently */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {/* Overlay Text */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
          Assistant Active
        </span>
      </div>
    </div>
  );
};

export default Assistant3D;
