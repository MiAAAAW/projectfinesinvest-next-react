"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS WRAPPER
// Client component wrapper for scroll progress indicator
// ═══════════════════════════════════════════════════════════════════════════════

import { ScrollProgress } from "@/components/ui/motion-wrapper";

export function ScrollProgressWrapper() {
  return <ScrollProgress className="bg-gradient-to-r from-primary via-purple-500 to-pink-500" />;
}
