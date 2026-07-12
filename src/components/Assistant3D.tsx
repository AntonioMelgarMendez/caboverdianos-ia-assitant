import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment, useGLTF, Html, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import modelUrl from '../assets/Dancing.glb?url';

// Preload the model to avoid lag on first render
useGLTF.preload(modelUrl);

const AIModel = () => {
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, scene);
  const modelRef = useRef<THREE.Group>(null);

  // Reproducir la animación por defecto en bucle
  React.useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstActionName = Object.keys(actions)[0];
      const action = actions[firstActionName];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions]);

  // Arreglar materiales (a veces los ojos se vuelven invisibles por problemas de alpha/transparencia)
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
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.1} // XYZ rotation intensity (solo el balanceo de Float)
      floatIntensity={0.2} // Up/down float intensity (reducido para que no flote demasiado alto)
    >
      <primitive 
        ref={modelRef} 
        object={scene} 
        position={[0, -1.8, 0]} 
        scale={1.8} // Ajuste estándar para modelos de Mixamo (suele ser 1, pero 1.8 lo hace un buen tamaño)
      />
    </Float>
  );
};

const ModelLoader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-purple-400 font-mono text-xs whitespace-nowrap">Loading 3D Model...</span>
      </div>
    </Html>
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
        
        <Suspense fallback={<ModelLoader />}>
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
        <span className="hidden md:inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
          Assistant Active
        </span>
      </div>
    </div>
  );
};

export default Assistant3D;
