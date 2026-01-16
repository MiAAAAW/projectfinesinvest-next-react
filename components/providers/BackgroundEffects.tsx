// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND EFFECTS PROVIDER
// Wrapper para efectos de fondo config-driven (AnimatedBg, CodeRain, etc.)
// Server Component - sin hooks ni estado
// ═══════════════════════════════════════════════════════════════════════════════

import { landingConfig } from "@/config/landing.config";
import { CodeRain } from "@/components/ui/code-rain";

export function BackgroundEffects() {
  const bgConfig = landingConfig.backgroundEffects;

  return (
    <>
      {/* Animated Background - config-driven */}
      {bgConfig?.animatedBackground?.enabled && (
        <div
          className={bgConfig.animatedBackground.className || "animated-bg"}
          aria-hidden="true"
        />
      )}

      {/* Code Rain Effect */}
      {bgConfig?.codeRain?.enabled && (
        <CodeRain
          opacity={bgConfig.codeRain.opacity}
          zIndex={bgConfig.codeRain.zIndex}
        />
      )}
    </>
  );
}
