"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// MOTION WRAPPER
// Wrapper para animaciones de scroll con Framer Motion
// ═══════════════════════════════════════════════════════════════════════════════

import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  amount?: number;
}

export function MotionWrapper({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = "up",
  once = true,
  amount = 0.3,
}: MotionWrapperProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
            }
          : {
              opacity: 0,
              ...directions[direction],
            }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAGGER CONTAINER
// Container para animaciones escalonadas
// ═══════════════════════════════════════════════════════════════════════════════

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAGGER ITEM
// Item individual para animaciones escalonadas
// ═══════════════════════════════════════════════════════════════════════════════

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON
// Botón con efecto magnético que sigue al cursor
// ═══════════════════════════════════════════════════════════════════════════════

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT REVEAL
// Animación de revelado de texto caracter por caracter
// ═══════════════════════════════════════════════════════════════════════════════

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

export function TextReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.03,
  once = true,
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={cn("inline-flex flex-wrap", className)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: delay + (wordIndex * word.length + charIndex) * staggerDelay,
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS
// Indicador de progreso de scroll
// ═══════════════════════════════════════════════════════════════════════════════

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50",
        className
      )}
      style={{ scaleX }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARALLAX SECTION
// Sección con efecto parallax basado en scroll
// ═══════════════════════════════════════════════════════════════════════════════

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxSection({
  children,
  className,
  speed = 0.5,
}: ParallaxSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLUR FADE IN
// Efecto de fade con blur para entradas elegantes
// ═══════════════════════════════════════════════════════════════════════════════

interface BlurFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BlurFadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
}: BlurFadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={
        isInView
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(10px)", y: 20 }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
