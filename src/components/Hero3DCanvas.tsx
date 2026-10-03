"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Subtle, gentle floating particle starfield
function GentleParticleField() {
  const count = 350; // Lightweight, non-intrusive
  const meshRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return [pos];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    // Very gentle drift
    meshRef.current.rotation.y = time * 0.02 + state.pointer.x * 0.05;
    meshRef.current.rotation.x = time * 0.015 - state.pointer.y * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#F07C27"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Minimalist, elegant geometric wireframe (Super 60 motif)
function MinimalGeometry() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const icoRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const px = state.pointer.x * 0.2;
    const py = state.pointer.y * 0.2;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        px * 0.25,
        0.04
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -py * 0.25,
        0.04
      );
    }

    if (icoRef.current) {
      icoRef.current.rotation.x = t * 0.12;
      icoRef.current.rotation.y = t * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[2.4, 0, -1]}>
      {/* Light wireframe icosahedron */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={icoRef} scale={1.2}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#F07C27"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>

      {/* Thin orbital ring */}
      <Float speed={1} rotationIntensity={0.15} floatIntensity={0.3}>
        <mesh ref={ringRef} rotation={[1.1, 0.4, 0]} scale={1.8}>
          <torusGeometry args={[1.1, 0.015, 12, 64]} />
          <meshBasicMaterial
            color="#FFA048"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  );
}

// Soft subtle lighting
function SoftLights() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = state.pointer.x * 4;
      lightRef.current.position.y = state.pointer.y * 3 + 1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight
        ref={lightRef}
        position={[2, 2, 4]}
        intensity={1.2}
        color="#F07C27"
        distance={10}
      />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#2D325E" distance={10} />
    </>
  );
}

export default function Hero3DCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-85">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <SoftLights />
        <MinimalGeometry />
        <GentleParticleField />
      </Canvas>
    </div>
  );
}
