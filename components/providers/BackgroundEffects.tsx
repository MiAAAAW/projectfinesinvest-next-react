// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND EFFECTS PROVIDER
// Wrapper para efectos de fondo config-driven (Liquid Blobs, CodeRain, etc.)
// Server Component - sin hooks ni estado
// ═══════════════════════════════════════════════════════════════════════════════

import { landingConfig } from "@/config/landing.config";
import { CodeRain } from "@/components/ui/code-rain";

export function BackgroundEffects() {
  const bgConfig = landingConfig.backgroundEffects;

  return (
    <>
      {/* Background - El color viene de --background en CSS */}
      {/* Los blobs están desactivados - fondo uniforme celeste */}

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
