"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION - MARQUEE ANIMADO
// Inspirado en Launch UI y Linkify - Glassmorphism + Infinite scroll
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TestimonialsConfig } from "@/types/landing.types";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icons";

interface TestimonialsProps {
  config: TestimonialsConfig;
  className?: string;
}

// Componente de Card de Testimonial con Glassmorphism
function TestimonialCard({
  testimonial,
  showRating,
}: {
  testimonial: TestimonialsConfig["items"][0];
  showRating?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex-shrink-0 w-[300px] sm:w-[350px] md:w-[400px] p-4 sm:p-6 mx-2 sm:mx-3",
        // Card style consistente
        "bg-card border border-border/50",
        "rounded-2xl shadow-professional-card",
        // Hover effects
        "transition-all duration-300",
        "hover:border-primary/30 hover:shadow-professional-lg",
        "hover:-translate-y-1"
      )}
    >
      {/* Quote icon decorativo */}
      <DynamicIcon name="Quote" className="absolute top-4 right-4 w-6 h-6 sm:w-8 sm:h-8 text-primary/10 group-hover:text-primary/20 transition-colors duration-500" />

      {/* Rating stars */}
      {showRating && testimonial.rating && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="transition-all duration-300"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <DynamicIcon
                name="Star"
                className={cn(
                  "w-4 h-4",
                  i < testimonial.rating!
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground/30"
                )}
              />
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-4 group-hover:text-foreground/80 transition-colors duration-500">
        "{testimonial.content}"
      </p>

      {/* Author info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div
            className={cn(
              "w-12 h-12 rounded-full overflow-hidden",
              "bg-gradient-to-br from-primary/20 to-purple-500/20",
              "ring-2 ring-primary/10 group-hover:ring-primary/30",
              "transition-all duration-500"
            )}
          >
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials on error
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            {/* Initials fallback */}
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary">
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {testimonial.name}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {testimonial.role}
            {testimonial.company && (
              <span className="text-primary/70"> @ {testimonial.company}</span>
            )}
          </p>
        </div>
      </div>

      {/* Gradient border on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
          "bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20",
          "transition-opacity duration-500 -z-10 blur-xl"
        )}
      />
    </div>
  );
}

// Componente de Marquee con animación infinita
function Marquee({
  children,
  direction = "left",
  speed = 40,
  pauseOnHover = true,
  className,
}: {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--duration:40s] [--gap:1.5rem]",
        className
      )}
      style={{ "--duration": `${speed}s` } as React.CSSProperties}
    >
      {/* Primera copia */}
      <div
        className={cn(
          "flex shrink-0 gap-[--gap] animate-marquee",
          direction === "right" && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      {/* Segunda copia para loop infinito */}
      <div
        className={cn(
          "flex shrink-0 gap-[--gap] animate-marquee",
          direction === "right" && "animate-marquee-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

export default function Testimonials({ config, className }: TestimonialsProps) {
  const { badge, title, subtitle, items, showRating } = config;

  // Dividir items en dos filas para efecto visual
  const firstRow = items.slice(0, Math.ceil(items.length / 2));
  const secondRow = items.slice(Math.ceil(items.length / 2));

  return (
    <section
      id="testimonials"
      className={cn(
        "relative py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="container relative z-10 px-4 md:px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto"
        >
          {badge && (
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5 text-sm border-primary/20 bg-primary/5"
            >
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </motion.div>
      </div>

      {/* Marquee rows */}
      <div className="relative space-y-6">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* First row - left direction */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <Marquee direction="left" speed={50} pauseOnHover>
            {firstRow.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                showRating={showRating}
              />
            ))}
          </Marquee>
        </motion.div>

        {/* Second row - right direction (si hay suficientes items) */}
        {secondRow.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Marquee direction="right" speed={45} pauseOnHover>
              {secondRow.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  showRating={showRating}
                />
              ))}
            </Marquee>
          </motion.div>
        )}
      </div>
    </section>
  );
}
