"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING PARTICLES COMPONENT
// Partículas flotantes con efecto glow - basado en CSS particles effect
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  maxSize?: number;
  opacity?: number;
  baseSpeed?: number;
  zIndex?: number;
  darkModeOnly?: boolean;
}

interface Particle {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
}

export function FloatingParticles({
  count = 60,
  color = "195, 100%, 70%",
  maxSize = 8,
  opacity = 1,
  baseSpeed = 8,
  zIndex = 0,
  darkModeOnly = false, // Mostrar en ambos modos para probar
}: FloatingParticlesProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generar partículas
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * maxSize + 2,
      left: Math.random() * 100,
      duration: baseSpeed + Math.random() * 4,
      delay: Math.random() * 10,
    }));
  }, [count, maxSize, baseSpeed]);

  // Esperar montaje para evitar hydration mismatch
  if (!mounted) return null;

  // Solo modo oscuro si darkModeOnly está activo
  if (darkModeOnly && resolvedTheme !== "dark") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex, opacity }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-float-up"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            bottom: "-5%",
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          <div
            className="w-full h-full rounded-full animate-particle-glow"
            style={{
              mixBlendMode: "screen",
              background: `radial-gradient(circle, hsl(${color}) 0%, hsl(${color}) 10%, hsla(${color}, 0) 60%)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
