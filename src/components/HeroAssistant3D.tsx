import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, useGLTF, Html, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import modelUrl from '../assets/Cipitio.glb?url';

useGLTF.preload(modelUrl);

const HeroCharacterModel = () => {
  const { scene, animations } = useGLTF(modelUrl);
  
  const cycle = useMemo(() => ['Waving', 'Dancing', 'Sitting'], []);
  const [currentAnimName, setCurrentAnimName] = React.useState(cycle[0]);

  // Cycle animations every 8 seconds
  React.useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % cycle.length;
      setCurrentAnimName(cycle[currentIndex]);
    }, 8000);
    return () => clearInterval(interval);
  }, [cycle]);

  // Extract specific model and clip
  const model = useMemo(() => {
    if (!scene) return null;
    return scene.children.find(c => c.name === currentAnimName) || scene.children[0];
  }, [scene, currentAnimName]);

  const clip = useMemo(() => {
    return animations.find(a => a.name === currentAnimName);
  }, [animations, currentAnimName]);

  const mixer = useMemo(() => {
    if (!model) return null;
    return new THREE.AnimationMixer(model);
  }, [model]);

  React.useEffect(() => {
    if (!mixer || !clip) return;
    const action = mixer.clipAction(clip);
    action.play();
    return () => {
      action.stop();
    };
  }, [mixer, clip]);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
  });
  
  // Fix materials
  React.useEffect(() => {
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
    <Float speed={1.8} rotationIntensity={0.08} floatIntensity={0.15}>
      <primitive 
        object={model} 
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
