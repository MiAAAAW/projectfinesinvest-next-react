"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PDF SNIPPET VIEWER
// Visor de PDF basado en @embedpdf/snippet v2.14 (PDFium + WASM)
// Ref: https://www.embedpdf.com/docs/snippet/getting-started
//
// - Renderizado virtualizado (solo páginas visibles)
// - Streaming progresivo (ve página 1 mientras descarga)
// - Toolbar completo: zoom, búsqueda, annotate, shapes, tabs
// - Theme sincronizado con next-themes
// - Web Component: cleanup automático via disconnectedCallback
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface PdfSnippetViewerProps {
  src: string;
  className?: string;
}

export function PdfSnippetViewer({ src, className }: PdfSnippetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    const host = containerRef.current;
    if (!host) return;

    // Import dinámico: evita SSR y mantiene bundle inicial liviano
    (async () => {
      const mod = await import("@embedpdf/snippet");
      if (cancelled || !host) return;

      const EmbedPDF = mod.default;

      EmbedPDF.init({
        type: "container",
        target: host,
        src,
        theme: {
          preference: resolvedTheme === "dark" ? "dark" : "light",
        },
        // Deshabilitar Open/Close del menú → evita que el usuario deje el viewer vacío
        // o abra un PDF local fuera de flujo. Resto del menú intacto (Print, Export,
        // Screenshot, Fullscreen, Security).
        disabledCategories: ["document-open", "document-close"],
      });
    })();

    return () => {
      cancelled = true;
      // El web component se destruye solo via disconnectedCallback
      // al limpiar innerHTML removemos el elemento del DOM
      if (host) host.innerHTML = "";
    };
  }, [src, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
