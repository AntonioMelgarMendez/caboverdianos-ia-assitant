import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Environment, useGLTF, Html, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
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
  // Clonar la escena para que cada instancia sea independiente
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, clonedScene);
  const currentAction = useRef<string | null>(null);

  // Cambiar animación suavemente con crossfade
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const targetName = actions[animation] ? animation : Object.keys(actions)[0];
    
    if (currentAction.current === targetName) return;

    // Fade out de la animación actual
    if (currentAction.current && actions[currentAction.current]) {
      actions[currentAction.current]!.fadeOut(0.4);
    }

    // Fade in de la nueva animación
    const newAction = actions[targetName];
    if (newAction) {
      newAction.reset().fadeIn(0.4).play();
      currentAction.current = targetName;
    }
  }, [animation, actions]);

  // Arreglar materiales
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
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
  }, [clonedScene]);

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
    >
      <primitive 
        object={clonedScene} 
        position={[0, -1.8, 0]} 
        scale={1.8}
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
        
        <Suspense fallback={<ModelLoader />}>
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
