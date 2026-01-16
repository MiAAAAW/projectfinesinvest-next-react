"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES SECTION COMPONENT - ENHANCED
// Grid de características con animaciones fluidas Framer Motion
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/lib/icons";
import type { FeaturesConfig } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

interface FeaturesProps {
  config: FeaturesConfig;
  className?: string;
}

export default function Features({ config, className }: FeaturesProps) {
  const { badge, title, subtitle, items, columns = 3 } = config;

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section
      id="features"
      className={cn(
        "relative py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background Effects - transparente */}
      <div className="absolute inset-0 bg-background/10" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="container relative px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          {badge && (
            <MotionWrapper direction="down">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                {badge}
              </Badge>
            </MotionWrapper>
          )}

          <MotionWrapper delay={0.1}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {title}
            </h2>
          </MotionWrapper>

          {subtitle && (
            <MotionWrapper delay={0.2} className="max-w-2xl">
              <p className="text-lg text-muted-foreground">
                {subtitle}
              </p>
            </MotionWrapper>
          )}
        </div>

        {/* Features Grid with Stagger Animation */}
        <StaggerContainer className={cn("grid gap-6 max-w-6xl mx-auto", gridCols[columns])} staggerDelay={0.08}>
          {items.map((feature, index) => (
            <StaggerItem key={feature.title}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card
                  className={cn(
                    "group relative h-full overflow-hidden",
                    "border border-primary/5 bg-background/80 backdrop-blur-sm",
                    "transition-all duration-500",
                    "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                  )}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  </div>

                  <CardHeader className="relative pb-2">
                    {/* Icon Container with animation */}
                    <motion.div
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <DynamicIcon name={feature.icon} size={28} />
                    </motion.div>

                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative">
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>

                    {feature.href && (
                      <Link
                        href={feature.href}
                        className="mt-4 inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:underline"
                      >
                        Saber más
                        <motion.span
                          className="ml-1"
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                        >
                          →
                        </motion.span>
                      </Link>
                    )}
                  </CardContent>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
