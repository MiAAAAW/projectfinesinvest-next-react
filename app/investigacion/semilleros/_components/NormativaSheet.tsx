"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// SEMILLEROS · NORMATIVA (Sheet lateral)
// - Botón flotante fijo a la derecha con badge (cantidad de RR).
// - Click → Sheet slide-in desde la derecha con split-layout (lista + viewer).
// - El PdfSnippetViewer solo se monta cuando el Sheet está abierto
//   (cero impacto en el load inicial de la página de Semilleros).
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  FileText,
  ScrollText,
  Download,
  ExternalLink,
} from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const PdfSnippetViewer = dynamic(
  () =>
    import("@/components/ui/pdf-snippet-viewer").then((m) => m.PdfSnippetViewer),
  { ssr: false }
);

export interface NormativaDoc {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: string | null;
  fileType: string | null;
}

export function NormativaSheet({ items }: { items: NormativaDoc[] }) {
  const [open, setOpen] = useState(false);
  // Inicialización eager: primer doc seleccionado por defecto. El PdfSnippetViewer
  // sólo se monta cuando Radix abre el SheetContent (portal), así que no hay
  // descarga de PDF hasta que el usuario abra el panel.
  const [selectedId, setSelectedId] = useState<string | null>(
    items[0]?.id ?? null
  );

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId]
  );

  if (items.length === 0) return null; // No mostrar el botón si no hay docs

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Botón centrado arriba del grid — inline en el flow de la página */}
      <div className="flex justify-center mb-6">
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full",
              "border border-primary/30 bg-primary/5 hover:bg-primary/10",
              "transition-all duration-200",
              "shadow-[0_0_20px_-5px] shadow-primary/20 hover:shadow-primary/40"
            )}
          >
            <ScrollText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Normativa de Semilleros
            </span>
            <Badge
              variant="default"
              className="text-[10px] px-1.5 py-0 h-5 font-mono"
            >
              {items.length}
            </Badge>
          </button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="right"
        className="p-0 flex flex-col sm:max-w-[880px] w-full"
      >
        {/* Accesibilidad: Radix exige DialogTitle aunque esté oculto visualmente */}
        <VisuallyHidden.Root>
          <SheetTitle>Normativa de Semilleros</SheetTitle>
          <SheetDescription>
            Resoluciones Rectorales relacionadas a los semilleros FINESI.
          </SheetDescription>
        </VisuallyHidden.Root>

        <div className="px-5 py-4 border-b bg-card/60 shrink-0">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">
              Normativa de Semilleros
            </h2>
            <Badge variant="secondary" className="text-[10px] ml-1">
              {items.length} {items.length === 1 ? "documento" : "documentos"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Resoluciones Rectorales relacionadas a los semilleros FINESI.
          </p>
        </div>

        <div className="flex-1 min-h-0 flex">
          {/* Lista izquierda */}
          <aside className="w-56 shrink-0 border-r bg-muted/20 flex flex-col min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <ul className="p-1.5 space-y-0.5">
                {items.map((d) => {
                  const isActive = d.id === selectedId;
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(d.id)}
                        title={d.title}
                        className={cn(
                          "w-full flex items-start gap-2 px-2 py-2 rounded-md text-left transition-all duration-200 border-l-2",
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
                        <span className="text-[11px] leading-tight line-clamp-3 flex-1">
                          {d.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </aside>

          {/* Viewer derecha */}
          <div className="flex-1 min-h-0 flex flex-col">
            {selected ? (
              <>
                <header className="px-4 py-2.5 border-b bg-card/40 flex items-center justify-between gap-3 shrink-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">
                      {selected.fileSize ?? ""}
                    </p>
                    <h3 className="text-xs font-semibold line-clamp-1">
                      {selected.title}
                    </h3>
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
                    preloadUrls={items
                      .map((d) => d.fileUrl)
                      .filter((u) => u !== selected.fileUrl)}
                    className="w-full h-full"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
                Selecciona un documento
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
