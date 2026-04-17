"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// POSTERS GRID · split layout: lista izquierda + visor PDF derecha
// Mismo patrón del AccreditationExplorer (optimización de carga y preload).
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  FileText,
  FileStack,
  Presentation,
} from "lucide-react";

const PdfSnippetViewer = dynamic(
  () =>
    import("@/components/ui/pdf-snippet-viewer").then((m) => m.PdfSnippetViewer),
  { ssr: false }
);

export interface PosterDTO {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: string | null;
  fileType: string | null;
}

export function PostersGrid({ posters }: { posters: PosterDTO[] }) {
  // Pre-descarga el chunk de snippet (ya usado en acreditación) apenas monta.
  useEffect(() => {
    void import("@embedpdf/snippet");
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(
    posters[0]?.id ?? null
  );

  const selected = useMemo(
    () => posters.find((p) => p.id === selectedId) ?? null,
    [posters, selectedId]
  );

  if (posters.length === 0) {
    return (
      <div className="rounded-lg border bg-card/40 p-12 text-center">
        <div className="mx-auto mb-4 rounded-full bg-muted/50 p-4 w-fit">
          <Presentation className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold">Aún no hay posters publicados</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pronto se cargarán los reconocimientos desde el panel administrativo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[minmax(260px,_320px)_1fr] gap-3 h-[82vh] min-h-[600px]">
      {/* Lista izquierda */}
      <aside className="rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b bg-card/60 shrink-0">
          {posters.length} {posters.length === 1 ? "poster" : "posters"}
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <ul className="p-1.5 space-y-0.5">
            {posters.map((p) => {
              const isActive = p.id === selectedId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    title={p.title}
                    className={cn(
                      "w-full flex items-start gap-2 px-2.5 py-2 rounded-md text-left transition-all duration-200 border-l-2",
                      isActive
                        ? [
                            "bg-primary/10 text-primary border-l-primary",
                            "shadow-[0_0_12px_-2px] shadow-primary/30",
                          ]
                        : "border-l-transparent hover:bg-muted/50 text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <FileText
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 mt-0.5",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-xs leading-tight line-clamp-2 flex-1">
                      {p.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </aside>

      {/* Visor derecha */}
      <section className="rounded-lg border bg-card overflow-hidden flex flex-col">
        {selected ? (
          <>
            <header className="px-4 py-3 border-b bg-card/60 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">
                    Poster
                  </Badge>
                  {selected.fileSize && (
                    <span className="text-[10px] text-muted-foreground">
                      · {selected.fileSize}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold mt-1 line-clamp-2">
                  {selected.title}
                </h2>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button asChild variant="ghost" size="sm" title="Abrir en pestaña">
                  <a
                    href={selected.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm" title="Descargar">
                  <a href={selected.fileUrl} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </header>
            <div className="flex-1 min-h-0">
              <PdfSnippetViewer
                src={selected.fileUrl}
                preloadUrls={posters
                  .map((p) => p.fileUrl)
                  .filter((u) => u !== selected.fileUrl)}
                className="w-full h-full"
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 p-12 text-center">
            <div className="max-w-sm">
              <div className="mx-auto mb-4 rounded-full bg-muted/50 p-4 w-fit">
                <FileStack className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">Selecciona un poster</h3>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
