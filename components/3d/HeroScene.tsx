"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO 3D SCENE
// Escena Three.js con múltiples variantes para el Hero
// ═══════════════════════════════════════════════════════════════════════════════

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────────
// FLOATING GEOMETRIC SHAPES
// ─────────────────────────────────────────────────────────────────────────────────

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Sphere with distortion */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Orbiting smaller shapes */}
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-3, 1, -2]}>
          <icosahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color="#06b6d4"
            wireframe
            emissive="#06b6d4"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh position={[3, -1, -1]}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color="#ec4899"
            wireframe
            emissive="#ec4899"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[2, 2, -3]}>
          <torusGeometry args={[0.3, 0.15, 16, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-2.5, -1.5, -2]}>
          <dodecahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial
            color="#10b981"
            wireframe
            emissive="#10b981"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────
// PARTICLE FIELD
// ─────────────────────────────────────────────────────────────────────────────────

function ParticleField({ count = 500 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // Random colors: purple, cyan, pink
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0.545; // purple
        colors[i3 + 1] = 0.361;
        colors[i3 + 2] = 0.965;
      } else if (colorChoice < 0.66) {
        colors[i3] = 0.024; // cyan
        colors[i3 + 1] = 0.714;
        colors[i3 + 2] = 0.831;
      } else {
        colors[i3] = 0.925; // pink
        colors[i3 + 1] = 0.282;
        colors[i3 + 2] = 0.6;
      }
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────────
// SCENE VARIANTS
// ─────────────────────────────────────────────────────────────────────────────────

type SceneVariant = "floating" | "particles" | "geometric" | "background" | "custom";

interface HeroSceneProps {
  variant?: SceneVariant;
}

export default function HeroScene({ variant = "geometric" }: HeroSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={0.5} />
      <pointLight position={[10, -10, 5]} color="#06b6d4" intensity={0.3} />

      {/* Stars background */}
      <Stars
        radius={50}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Scene content based on variant */}
      {(variant === "geometric" || variant === "floating") && <FloatingShapes />}
      {variant === "particles" && <ParticleField count={800} />}
      {variant === "background" && (
        <>
          <ParticleField count={300} />
          <FloatingShapes />
        </>
      )}
    </Canvas>
  );
}
