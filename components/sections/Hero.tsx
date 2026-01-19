"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION COMPONENT - ENHANCED
// Componente Hero con efectos Aceternity UI y Framer Motion
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "@/lib/icons";
import type { HeroConfig } from "@/types/landing.types";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";

// Aceternity UI Components
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { MotionWrapper, MagneticButton, BlurFadeIn } from "@/components/ui/motion-wrapper";

// Lazy load 3D scene para mejor performance
const HeroScene3D = dynamic(() => import("@/components/3d/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-background to-muted" />
  ),
});

interface HeroProps {
  config: HeroConfig;
  className?: string;
}

export default function Hero({ config, className }: HeroProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Solo para efectos que requieren tema (Spotlight)
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    badge,
    title,
    description,
    cta,
    image,
    enable3D,
    scene3D,
  } = config;

  // Usar imagen light como default en SSR, luego dark si aplica
  const currentImage = mounted && resolvedTheme === "dark"
    ? (image?.dark || image?.light)
    : image?.light;

  // Animation variants for buttons
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8 + i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    }),
  };

  return (
    <section
      className={cn(
        "relative min-h-[100vh] flex items-center justify-center overflow-hidden",
        // Fondo transparente para mostrar el animated-bg global
        className
      )}
    >
      {/* Spotlight Effect - Aceternity UI (solo renderizar cuando mounted para evitar hydration mismatch) */}
      {mounted && (
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill={resolvedTheme === "dark" ? "white" : "rgba(120, 119, 198, 0.3)"}
        />
      )}

      {/* Background Image - renderiza inmediatamente (SSR) */}
      {image && !enable3D && currentImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={currentImage}
            alt={image.alt}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay para legibilidad del texto - sutil en light mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/25 dark:from-background/60 dark:via-background/40 dark:to-background/70" />
        </div>
      )}

      {/* 3D Background Scene */}
      {enable3D && (
        <div className="absolute inset-0 -z-10">
          <Suspense
            fallback={
              <div className="absolute inset-0" />
            }
          >
            <HeroScene3D variant={scene3D || "geometric"} />
          </Suspense>
        </div>
      )}

      {/* Grid Pattern - sutil sobre la imagen */}
      <div className="absolute inset-0 grid-pattern opacity-10" />

      {/* Content Container */}
      <div className="container relative z-10 px-4 md:px-6 pt-20">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-8">
          {/* Badge with Motion */}
          {badge && (
            <MotionWrapper delay={0.1} direction="down">
              {badge.href ? (
                <Link href={badge.href}>
                  <Badge
                    variant={badge.variant || "outline"}
                    className="px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-all cursor-pointer border-primary/20 backdrop-blur-sm group"
                  >
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {badge.text}
                    <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Badge>
                </Link>
              ) : (
                <Badge
                  variant={badge.variant || "outline"}
                  className="px-4 py-2 text-sm font-medium border-primary/20 backdrop-blur-sm"
                >
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {badge.text}
                </Badge>
              )}
            </MotionWrapper>
          )}

          {/* Title with Text Generate Effect */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                {title.main}{" "}
                {title.highlight && (
                  <span className="relative">
                    <span className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-gradient drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]">
                      {title.highlight}
                    </span>
                    {/* Underline effect */}
                    <motion.span
                      className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    />
                  </span>
                )}
                {title.suffix && <span> {title.suffix}</span>}
              </h1>
            </motion.div>
          </div>

          {/* Description with fade effect */}
          <MotionWrapper delay={0.4} className="max-w-2xl">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
          </MotionWrapper>

          {/* CTA Buttons with stagger animation and magnetic effect */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
            >
              <MagneticButton strength={0.15}>
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden bg-primary hover:bg-primary/90 px-8 h-12"
                >
                  <Link href={cta.primary.href}>
                    <span className="relative z-10 flex items-center">
                      {cta.primary.text}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 animate-shimmer" />
                  </Link>
                </Button>
              </MagneticButton>
            </motion.div>

            {cta.secondary && (
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={buttonVariants}
              >
                <MagneticButton strength={0.15}>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="group border-primary/20 hover:border-primary/40 hover:bg-primary/5 px-8 h-12 backdrop-blur-sm"
                  >
                    <Link
                      href={cta.secondary.href}
                      target={cta.secondary.external ? "_blank" : undefined}
                      rel={cta.secondary.external ? "noopener noreferrer" : undefined}
                    >
                      {cta.secondary.text}
                    </Link>
                  </Button>
                </MagneticButton>
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* Scroll indicator with enhanced animation */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <motion.button
          type="button"
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
          aria-label="Desplazar hacia abajo"
        >
          <motion.span
            className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
            animate={{ opacity: [0.5, 1, 0.5], scaleY: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.button>
      </motion.div>
    </section>
  );
}
