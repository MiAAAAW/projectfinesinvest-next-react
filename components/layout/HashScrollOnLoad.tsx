"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// HASH SCROLL ON LOAD
// Cuando la landing carga con #hash (desde otra página), scrollea a la sección
// replicando la misma fórmula del Navbar handler (offset 80px del navbar fijo).
//
// Usa window.scrollTo manual (más predecible que scrollIntoView, que en algunos
// browsers no respeta scroll-padding-top con full-reload).
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect } from "react";

const NAVBAR_HEIGHT = 80;

export function HashScrollOnLoad() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;

    const targetId = hash.slice(1);
    let userInteracted = false;
    let lastTop: number | null = null;

    const scrollToTarget = (smooth: boolean) => {
      if (userInteracted) return;
      const el = document.getElementById(targetId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      // No-op si la posición no cambió (layout estable → nada que corregir)
      if (lastTop != null && Math.abs(top - lastTop) < 4) return;
      window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
      lastTop = top;
    };

    // [1] Instantáneo tras mount — pone al user cerca del target para que no
    //     vea top-of-page mientras el layout se estabiliza.
    const rafId = requestAnimationFrame(() => scrollToTarget(false));

    // [2] Ajustes post-load: 80ms y 500ms para cubrir layout shifts tardíos
    //     (imágenes grandes del Hero, fonts, etc). Se cancelan si el user
    //     interactúa (wheel/touch/teclado) para no pisar su scroll manual.
    const timers: number[] = [];
    const onUserInput = () => {
      userInteracted = true;
    };
    const attachCancelListeners = () => {
      window.addEventListener("wheel", onUserInput, { passive: true, once: true });
      window.addEventListener("touchstart", onUserInput, { passive: true, once: true });
      window.addEventListener("keydown", onUserInput, { once: true });
    };

    const onComplete = () => {
      attachCancelListeners();
      timers.push(window.setTimeout(() => scrollToTarget(true), 80));
      timers.push(window.setTimeout(() => scrollToTarget(true), 500));
    };

    if (document.readyState === "complete") {
      onComplete();
    } else {
      window.addEventListener("load", onComplete, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      window.removeEventListener("load", onComplete);
      window.removeEventListener("wheel", onUserInput);
      window.removeEventListener("touchstart", onUserInput);
      window.removeEventListener("keydown", onUserInput);
    };
  }, []);

  return null;
}
