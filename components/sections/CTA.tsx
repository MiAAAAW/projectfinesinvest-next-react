"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// CTA SECTION COMPONENT - ENHANCED
// Llamada a la acción con efectos profesionales y animaciones fluidas
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "@/lib/icons";
import type { CTAConfig } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper, MagneticButton } from "@/components/ui/motion-wrapper";
import { BackgroundGradient } from "@/components/ui/background-gradient";

interface CTAProps {
  config: CTAConfig;
  className?: string;
}

export default function CTA({ config, className }: CTAProps) {
  const { title, description, primary, secondary, background = "default" } = config;

  const bgClasses = {
    default: "bg-muted/30",
    gradient: "bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5",
    pattern: "bg-muted/30",
  };

  return (
    <section
      className={cn(
        "relative py-24 md:py-36 overflow-hidden",
        bgClasses[background],
        className
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        {background === "pattern" && (
          <div className="absolute inset-0 grid-pattern opacity-40" />
        )}

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/80" />
      </div>

      <div className="container relative px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          {/* Title with gradient text */}
          <MotionWrapper>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {title.split(" ").map((word, i, arr) =>
                i === arr.length - 1 ? (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
                  >
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h2>
          </MotionWrapper>

          {/* Description */}
          {description && (
            <MotionWrapper delay={0.1} className="max-w-2xl">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {description}
              </p>
            </MotionWrapper>
          )}

          {/* CTA Buttons with magnetic effect */}
          <MotionWrapper delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Primary button with gradient background */}
              <MagneticButton strength={0.2}>
                <BackgroundGradient containerClassName="rounded-full" animate={true}>
                  <Button
                    asChild
                    size="lg"
                    className="group relative bg-background hover:bg-background/90 text-foreground px-8 h-12 rounded-full"
                  >
                    <Link href={primary.href}>
                      <span className="flex items-center">
                        {primary.text}
                        <motion.span
                          className="ml-2"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </span>
                    </Link>
                  </Button>
                </BackgroundGradient>
              </MagneticButton>

              {/* Secondary button */}
              {secondary && (
                <MagneticButton strength={0.2}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="group border-primary/20 hover:border-primary/40 hover:bg-primary/5 px-8 h-12 rounded-full backdrop-blur-sm"
                    >
                      <Link href={secondary.href}>{secondary.text}</Link>
                    </Button>
                  </motion.div>
                </MagneticButton>
              )}
            </div>
          </MotionWrapper>

          {/* Trust indicators */}
          <MotionWrapper delay={0.3}>
            <div className="flex items-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                <span>Sin compromiso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                <span>Consulta gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                <span>Respuesta 24h</span>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
