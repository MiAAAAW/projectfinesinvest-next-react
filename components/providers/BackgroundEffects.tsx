"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND EFFECTS PROVIDER
// Wrapper para efectos de fondo config-driven (Liquid Blobs, CodeRain, etc.)
// ═══════════════════════════════════════════════════════════════════════════════

import { landingConfig } from "@/config/landing.config";
import { CodeRain } from "@/components/ui/code-rain";
import { FloatingParticles } from "@/components/ui/floating-particles";

export function BackgroundEffects() {
  const bgConfig = landingConfig.backgroundEffects;

  return (
    <>
      {/* Code Rain Effect */}
      {bgConfig?.codeRain?.enabled && (
        <CodeRain
          opacity={bgConfig.codeRain.opacity}
          zIndex={bgConfig.codeRain.zIndex}
        />
      )}

      {/* Floating Particles - Solo modo oscuro */}
      {bgConfig?.floatingParticles?.enabled && (
        <FloatingParticles
          count={bgConfig.floatingParticles.count}
          color={bgConfig.floatingParticles.color}
          opacity={bgConfig.floatingParticles.opacity}
          zIndex={bgConfig.floatingParticles.zIndex}
        />
      )}
    </>
  );
}
