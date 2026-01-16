"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT GENERATE EFFECT
// Texto que aparece palabra por palabra con efecto blur - Aceternity UI Style
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration,
        delay: stagger(0.1),
      }
    );
  }, [animate, duration, filter]);

  return (
    <div className={cn("font-bold", className)}>
      <motion.div ref={scope} className="flex flex-wrap justify-center">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            className="opacity-0 mr-2"
            style={{
              filter: filter ? "blur(10px)" : "none",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
