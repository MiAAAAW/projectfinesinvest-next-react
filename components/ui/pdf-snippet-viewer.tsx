"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PDF SNIPPET VIEWER
// Visor de PDF basado en @embedpdf/snippet v2.14 (PDFium + WASM)
//
// Optimización basada en APIs oficiales de @embedpdf/plugin-document-manager:
//   1. init() UNA sola vez → plugins + WASM listos para siempre.
//   2. `mode: 'range-request'` → HTTP 206 partial content, sólo fetch
//      de páginas visibles (docs grandes cargan casi instantáneo).
//   3. Precarga en background con `autoActivate: false`:
//      mientras el usuario lee el doc activo, los vecinos se cargan en paralelo.
//   4. documentId = URL → `isDocumentOpen(url)` permite cambio instantáneo
//      via `setActiveDocument` (cero fetch, cero spinner).
//   5. tabBar: 'never' → ocultamos las tabs del snippet (usamos nuestra sidebar).
//   6. Theme → setTheme() en caliente.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { EmbedPdfContainer, DocumentManagerPlugin } from "@embedpdf/snippet";

interface PdfSnippetViewerProps {
  /** URL del PDF activo. Si se omite, el viewer inicializa sin documento
   *  (útil para montar en page-load y warm-up de plugins antes del primer click). */
  src?: string;
  /** URLs vecinas a precargar en background (cero impacto en el doc activo). */
  preloadUrls?: string[];
  className?: string;
}

export function PdfSnippetViewer({
  src,
  preloadUrls,
  className,
}: PdfSnippetViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const containerPromiseRef = useRef<Promise<EmbedPdfContainer | null> | null>(null);
  const { resolvedTheme } = useTheme();

  // ── 1) Init UNA sola vez ──────────────────────────────────────────────────
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    containerPromiseRef.current = (async () => {
      const mod = await import("@embedpdf/snippet");
      if (cancelled || !host) return null;
      const EmbedPDF = mod.default;
      const { ZoomMode } = mod;

      const container = EmbedPDF.init({
        type: "container",
        target: host,
        theme: {
          preference: resolvedTheme === "dark" ? "dark" : "light",
        },
        zoom: { defaultZoomLevel: ZoomMode.FitWidth },
        viewport: { viewportGap: 4 },
        tabBar: "never",
        // Documento inicial: opcional. Si el viewer se monta sin src (warm-up al
        // cargar la página), el registry arranca vacío — plugins igual se inician.
        documentManager: src
          ? {
              initialDocuments: [
                {
                  url: src,
                  documentId: src,
                  mode: "range-request",
                  autoActivate: true,
                },
              ],
            }
          : undefined,
        disabledCategories: ["document-open", "document-close"],
      });

      return container ?? null;
    })();

    return () => {
      cancelled = true;
      containerPromiseRef.current = null;
      if (host) host.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2) Swap a doc activo (usa caché si ya está cargado) ───────────────────
  useEffect(() => {
    if (!src) return; // Warm-up sin documento — nada que activar
    const promise = containerPromiseRef.current;
    if (!promise) return;
    let cancelled = false;

    (async () => {
      try {
        const container = await promise;
        if (cancelled || !container) return;
        const registry = await container.registry;
        if (cancelled) return;

        const { DocumentManagerPlugin: DMP } = await import(
          "@embedpdf/plugin-document-manager"
        );
        const plugin = registry.getPlugin<InstanceType<typeof DocumentManagerPlugin>>(
          DMP.id
        );
        if (!plugin) return;
        const cap = plugin.provides();

        // Si ya está abierto (por precarga o visita previa) → activación instantánea.
        if (cap.isDocumentOpen(src)) {
          if (cap.getActiveDocumentId() !== src) {
            cap.setActiveDocument(src);
          }
          return;
        }

        // Primera vez para esta URL: abrir + activar.
        await cap.openDocumentUrl({
          url: src,
          documentId: src,
          mode: "range-request",
          autoActivate: true,
        });
      } catch (err) {
        console.error("PDF swap error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  // ── 3) Precarga en background de los vecinos (autoActivate: false) ────────
  useEffect(() => {
    const promise = containerPromiseRef.current;
    if (!promise) return;
    if (!preloadUrls || preloadUrls.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        const container = await promise;
        if (cancelled || !container) return;
        const registry = await container.registry;
        if (cancelled) return;

        const { DocumentManagerPlugin: DMP } = await import(
          "@embedpdf/plugin-document-manager"
        );
        const plugin = registry.getPlugin<InstanceType<typeof DocumentManagerPlugin>>(
          DMP.id
        );
        if (!plugin) return;
        const cap = plugin.provides();

        // Filtrar: no re-precargar el doc activo ni los ya abiertos.
        const toPreload = preloadUrls.filter(
          (u) => u !== src && !cap.isDocumentOpen(u)
        );
        if (toPreload.length === 0) return;

        // Paralelo: todos arrancan a la vez. `autoActivate: false` = no cambia doc.
        await Promise.allSettled(
          toPreload.map((url) => {
            if (cancelled) return Promise.resolve();
            return cap.openDocumentUrl({
              url,
              documentId: url,
              mode: "range-request",
              autoActivate: false,
            });
          })
        );
      } catch (err) {
        // Silencioso: fallos de precarga no afectan al doc activo.
        console.warn("PDF preload error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // preloadUrls como string[] causaría re-runs si la ref cambia; el consumidor
    // debería memoizar. Usamos join para estabilizar comparación por contenido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadUrls?.join("|"), src]);

  // ── 4) Cambio de theme en caliente ────────────────────────────────────────
  useEffect(() => {
    const promise = containerPromiseRef.current;
    if (!promise) return;
    let cancelled = false;
    promise.then((container) => {
      if (cancelled || !container) return;
      container.setTheme({
        preference: resolvedTheme === "dark" ? "dark" : "light",
      });
    });
    return () => {
      cancelled = true;
    };
  }, [resolvedTheme]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
