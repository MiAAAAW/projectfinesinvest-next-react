"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESOLUTIONS EXPLORER · split layout con visor PDF embebido
// - Lista compacta de resoluciones a la izquierda (scrollable)
// - Visor PDF a la derecha (mismo tech que landing Documentos)
// - Búsqueda por número/asunto + filtro por año (derivado de la data)
// - Empty state cuando no hay selección
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileText, Search, Download, ExternalLink, X } from "lucide-react";

// Dynamic import — evita SSR del PDF viewer (WASM)
const PdfSnippetViewer = dynamic(
  () => import("@/components/ui/pdf-snippet-viewer").then((m) => m.PdfSnippetViewer),
  { ssr: false }
);

export interface ResolutionItem {
  id: string;
  number: string;
  subject: string;
  date: string | null;
  year: number | null;
  fileUrl: string | null;
  fileSize: string | null;
}

const ALL = "__all__";

export function ResolutionsExplorer({
  resolutions,
  emptyLabel,
}: {
  resolutions: ResolutionItem[];
  emptyLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState<string>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Explorer solo si hay AL MENOS 1 resolución con PDF real
  const hasAnyPdf = resolutions.some(
    (r) => r.fileUrl && /^https?:\/\/[a-z0-9]/i.test(r.fileUrl.trim())
  );
  if (!hasAnyPdf) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        {emptyLabel}
      </p>
    );
  }

  // Años disponibles derivados de la data (cero hardcode)
  const years = useMemo(() => {
    const s = new Set<number>();
    for (const r of resolutions) if (r.year) s.add(r.year);
    return Array.from(s).sort((a, b) => b - a);
  }, [resolutions]);

  // Filtrado reactivo
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resolutions.filter((r) => {
      if (yearFilter !== ALL && String(r.year) !== yearFilter) return false;
      if (q) {
        const hay = `${r.number} ${r.subject ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [resolutions, search, yearFilter]);

  // Seleccionar la primera con PDF cuando cambian los filtros
  useEffect(() => {
    if (selectedId && filtered.some((r) => r.id === selectedId)) return;
    const first = filtered.find((r) => r.fileUrl);
    setSelectedId(first?.id ?? null);
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  const hasFilters = search.trim() !== "" || yearFilter !== ALL;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o asunto..."
            className="pl-9 h-10"
          />
        </div>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="h-10 w-[130px] text-xs">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los años</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setYearFilter(ALL);
            }}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          de {resolutions.length}
        </span>
      </div>

      {/* Split layout */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh] rounded-lg border bg-card/40 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground text-center py-12">
            {hasFilters ? "No hay resultados con estos filtros." : emptyLabel}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(280px,_340px)_1fr] gap-4 h-[78vh] min-h-[560px]">
          {/* LISTA */}
          <aside className="rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
            <ul className="overflow-y-auto divide-y">
              {filtered.map((r) => (
                <ResolutionListItem
                  key={r.id}
                  r={r}
                  active={r.id === selected?.id}
                  onClick={() => setSelectedId(r.id)}
                />
              ))}
            </ul>
          </aside>

          {/* VIEWER */}
          <section className="rounded-lg border bg-card overflow-hidden flex flex-col">
            {selected && selected.fileUrl ? (
              <>
                <header className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-card/60">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold truncate">
                      Resolución N.° {selected.number}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {selected.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={selected.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir en nueva pestaña"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={selected.fileUrl}
                        download
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </header>
                <div className="flex-1 min-h-0">
                  <PdfSnippetViewer
                    key={selected.id}
                    src={selected.fileUrl}
                    className="w-full h-full"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 p-12 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto mb-4 rounded-full bg-muted/50 p-4 w-fit">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold">
                    Selecciona una resolución
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selected
                      ? "Esta resolución no tiene archivo PDF adjunto."
                      : "Elige un elemento de la lista para ver su PDF."}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIST ITEM
// ═══════════════════════════════════════════════════════════════════════════════

function ResolutionListItem({
  r,
  active,
  onClick,
}: {
  r: ResolutionItem;
  active: boolean;
  onClick: () => void;
}) {
  const dateLabel = r.date
    ? new Date(r.date).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors",
          active
            ? "bg-primary/10 border-l-2 border-primary"
            : "hover:bg-muted/40 border-l-2 border-transparent"
        )}
      >
        <div className="flex items-center gap-2">
          <FileText
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              active ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span className={cn("text-sm font-semibold", active && "text-primary")}>
            N.° {r.number}
          </span>
          {r.year && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-auto">
              {r.year}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 pl-5">
          {r.subject}
        </p>
        <div className="flex items-center justify-between gap-2 pl-5 mt-0.5">
          {dateLabel && (
            <span className="text-[10px] text-muted-foreground/80">{dateLabel}</span>
          )}
          {!r.fileUrl && (
            <span className="text-[10px] text-muted-foreground italic">Sin PDF</span>
          )}
          {r.fileSize && (
            <span className="text-[10px] text-muted-foreground/80 font-mono">
              {r.fileSize}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}
