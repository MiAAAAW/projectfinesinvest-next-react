// ═══════════════════════════════════════════════════════════════════════════════
// CODE RAIN EFFECT
// CSS-only animation con posiciones predefinidas
// Server Component - sin hooks ni estado
// ═══════════════════════════════════════════════════════════════════════════════

// Símbolos matemáticos predefinidos con posiciones fijas
const RAIN_ITEMS = [
  { symbol: "σ", x: 3, delay: 0, duration: 25 },
  { symbol: "∫", x: 11, delay: 2, duration: 28 },
  { symbol: "π", x: 18, delay: 5, duration: 22 },
  { symbol: "Σ", x: 26, delay: 1, duration: 30 },
  { symbol: "∞", x: 33, delay: 4, duration: 24 },
  { symbol: "θ", x: 41, delay: 7, duration: 27 },
  { symbol: "Δ", x: 48, delay: 3, duration: 23 },
  { symbol: "λ", x: 55, delay: 6, duration: 29 },
  { symbol: "α", x: 63, delay: 0, duration: 26 },
  { symbol: "β", x: 70, delay: 8, duration: 21 },
  { symbol: "φ", x: 78, delay: 2, duration: 28 },
  { symbol: "ω", x: 85, delay: 5, duration: 25 },
  { symbol: "∂", x: 92, delay: 1, duration: 30 },
  { symbol: "μ", x: 7, delay: 9, duration: 24 },
  { symbol: "√", x: 22, delay: 4, duration: 27 },
  { symbol: "∇", x: 37, delay: 7, duration: 22 },
  { symbol: "ρ", x: 52, delay: 3, duration: 29 },
  { symbol: "γ", x: 67, delay: 6, duration: 26 },
  { symbol: "τ", x: 82, delay: 0, duration: 23 },
  { symbol: "ψ", x: 97, delay: 8, duration: 28 },
];

interface CodeRainProps {
  opacity?: number;
  zIndex?: number;
}

export function CodeRain({
  opacity = 0.6,
  zIndex = 5,
}: CodeRainProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex }}
    >
      {RAIN_ITEMS.map((item, i) => (
        <span
          key={i}
          className="absolute text-[#0D2137]/60 dark:text-white/60 font-mono text-sm select-none animate-rain-fall"
          style={{
            left: `${item.x}%`,
            fontSize: "14px",
            opacity,
            animationDuration: `${item.duration}s`,
            animationDelay: `-${item.delay}s`,
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

export default CodeRain;
