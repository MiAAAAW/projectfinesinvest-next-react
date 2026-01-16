"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// STATS SECTION COMPONENT - ENHANCED
// Sección de estadísticas con animación de contador y efectos fluidos
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import type { StatsConfig } from "@/types/landing.types";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

interface StatsProps {
  config: StatsConfig;
  className?: string;
}

// Counter animation hook
function useCounter(end: number, duration: number = 2, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!startOnView || isInView) {
      const controls = animate(0, end, {
        duration,
        ease: "easeOut",
        onUpdate: (value) => setCount(Math.floor(value)),
      });

      return () => controls.stop();
    }
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
}

// Parse numeric value from stat (handles "10K+", "99%", etc.)
function parseStatValue(value: string): number {
  const numMatch = value.match(/[\d.]+/);
  if (!numMatch) return 0;

  const num = parseFloat(numMatch[0]);
  if (value.toLowerCase().includes("k")) return num * 1000;
  if (value.toLowerCase().includes("m")) return num * 1000000;
  return num;
}

// Format number back with suffix
function formatStatValue(value: number, originalValue: string): string {
  if (originalValue.toLowerCase().includes("k")) {
    return (value / 1000).toFixed(value >= 10000 ? 0 : 1);
  }
  if (originalValue.toLowerCase().includes("m")) {
    return (value / 1000000).toFixed(1);
  }
  return value.toString();
}

// Individual stat item with counter
function StatItem({
  stat,
  index,
  isPrimary,
}: {
  stat: { value: string | number; label: string; prefix?: string; suffix?: string };
  index: number;
  isPrimary: boolean;
}) {
  const valueStr = String(stat.value);
  const numericValue = parseStatValue(valueStr);
  const hasK = valueStr.toLowerCase().includes("k");
  const hasM = valueStr.toLowerCase().includes("m");
  const hasPercent = valueStr.includes("%");
  const { count, ref } = useCounter(numericValue, 2);

  const displayValue = hasK
    ? formatStatValue(count, valueStr) + "K"
    : hasM
    ? formatStatValue(count, valueStr) + "M"
    : count;

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center space-y-3"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        {/* Glow effect behind number */}
        <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />

        <motion.div
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight relative"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          {stat.prefix}
          {displayValue}
          {hasPercent ? "%" : stat.suffix}
        </motion.div>
      </div>

      <motion.p
        className={cn(
          "text-sm md:text-base font-medium",
          isPrimary ? "text-primary-foreground/80" : "text-muted-foreground"
        )}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
        viewport={{ once: true }}
      >
        {stat.label}
      </motion.p>

      {/* Decorative line */}
      <motion.div
        className="w-12 h-0.5 bg-primary/30 rounded-full"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
        viewport={{ once: true }}
      />
    </motion.div>
  );
}

export default function Stats({ config, className }: StatsProps) {
  const { items, background = "default" } = config;

  const bgClasses = {
    default: "bg-background",
    muted: "bg-muted/50",
    primary: "bg-primary text-primary-foreground",
  };

  return (
    <section
      className={cn(
        "relative py-20 md:py-28 overflow-hidden",
        bgClasses[background],
        className
      )}
    >
      {/* Background decorations */}
      {background !== "primary" && (
        <>
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </>
      )}

      <div className="container relative px-4 md:px-6">
        <StaggerContainer
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          staggerDelay={0.1}
        >
          {items.map((stat, index) => (
            <StaggerItem key={stat.label}>
              <StatItem
                stat={stat}
                index={index}
                isPrimary={background === "primary"}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
