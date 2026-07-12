import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
  
  // Find the specific model and clip for the current animation
  const targetName = animations.find(a => a.name === animation) ? animation : animations[0]?.name;
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
    action.reset().fadeIn(0.4).play();
    return () => {
      action.fadeOut(0.4);
      // Wait for fadeout before stopping
      setTimeout(() => action.stop(), 400);
    };
  }, [mixer, clip]);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
  });

  // Arreglar materiales
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
      <primitive 
        object={model} 
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
