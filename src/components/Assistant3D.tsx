import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Placeholder Component for the AI Generated Model
// When you have the .glb file, we will replace this with useGLTF hook
const PlaceholderModel = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Simple idle animation (rotation)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.5} // XYZ rotation intensity
      floatIntensity={1} // Up/down float intensity
    >
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial 
          color="#aa3bff" 
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
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
          <PlaceholderModel />
          
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
