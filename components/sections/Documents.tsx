"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// CENTRO DE DOCUMENTOS
// Sección unificada que integra: documentos, resoluciones y convenios
// - Split layout: lista (izquierda) + visor PDF (derecha, siempre visible)
// - Búsqueda cross-source
// - Tabs de categorías
// - API: /api/public/documents-unified
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/lib/icons";
import type { DocumentsConfig } from "@/types/landing.types";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { PdfSnippetViewer } from "@/components/ui/pdf-snippet-viewer";
import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface UnifiedDocument {
  id: string;
  source: "document" | "resolution" | "agreement";
  sourceId: string;
  title: string;
  subtitle?: string | null;
  fileUrl: string;
  fileSize?: string | null;
  category: string;
  categoryLabel: string;
  date?: string | null;
  metadata?: Record<string, unknown>;
}

interface Category {
  value: string;
  label: string;
  count: number;
}

interface DocumentsProps {
  config: DocumentsConfig;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const sourceIcons: Record<UnifiedDocument["source"], string> = {
  document: "FileText",
  resolution: "FileSignature",
  agreement: "Handshake",
};

const sourceColors: Record<UnifiedDocument["source"], string> = {
  document: "text-blue-500",
  resolution: "text-purple-500",
  agreement: "text-emerald-500",
};

function formatShortDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { year: "numeric", month: "short" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Documents({ config, className }: DocumentsProps) {
  const { badge, title, subtitle, showSearch } = config;

  const [items, setItems] = useState<UnifiedDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch unified documents
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/documents-unified");
        if (res.ok && !cancelled) {
          const json = await res.json();
          setItems(json.data || []);
          setCategories(json.categories || []);
          if (json.data?.length > 0) setSelectedId(json.data[0].id);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtrar items
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.subtitle ?? "").toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  // Mantener selección válida
  useEffect(() => {
    if (filtered.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    const stillExists = filtered.some((i) => i.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => filtered.find((i) => i.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  const viewerUrl = selected
    ? `/api/public/document-file/${selected.source}/${selected.sourceId}`
    : null;

  const handleDownload = useCallback((item: UnifiedDocument) => {
    const url = `/api/public/document-file/${item.source}/${item.sourceId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Descarga iniciada", { description: item.title });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section
        id="documents"
        className={cn(
          "relative pt-6 pb-10 md:pb-14 overflow-hidden scroll-mt-[80px]",
          className
        )}
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-6">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-12 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid lg:grid-cols-3 gap-4 h-[70vh]">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="lg:col-span-2 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section
      id="documents"
      className={cn(
        "relative pt-6 pb-10 md:pb-14 overflow-hidden scroll-mt-[80px]",
        className
      )}
    >
      <div className="container relative px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4">
          {badge && (
            <MotionWrapper direction="down">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                {badge}
              </Badge>
            </MotionWrapper>
          )}

          <MotionWrapper delay={0.1}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              {title}
            </h2>
          </MotionWrapper>

          {subtitle && (
            <MotionWrapper delay={0.2} className="max-w-2xl">
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </MotionWrapper>
          )}
        </div>

        {/* Toolbar: search + category chips */}
        <MotionWrapper delay={0.3} className="mb-4">
          <div className="flex flex-col md:flex-row gap-3 max-w-5xl mx-auto">
            {showSearch && (
              <div className="relative flex-1 md:max-w-sm">
                <DynamicIcon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="text"
                  placeholder="Buscar documentos, resoluciones, convenios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            )}

            {/* Category chips - scroll horizontal */}
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 md:pb-0 flex-1">
              <Button
                size="sm"
                variant={activeCategory === "all" ? "default" : "outline"}
                onClick={() => setActiveCategory("all")}
                className="h-8 rounded-full px-3 text-xs shrink-0"
              >
                Todos
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {items.length}
                </Badge>
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={activeCategory === cat.value ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat.value)}
                  className="h-8 rounded-full px-3 text-xs shrink-0"
                >
                  {cat.label}
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                    {cat.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* Split: list + viewer */}
        <div className="grid lg:grid-cols-[minmax(280px,_320px)_1fr] gap-4 h-[78vh] max-h-[900px]">
          {/* LISTA */}
          <div className="rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b text-xs text-muted-foreground font-medium">
              {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
                  <div className="rounded-full bg-muted/50 p-3 mb-3">
                    <DynamicIcon name="FileText" size={22} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {items.length === 0 ? "No hay documentos publicados" : "Sin resultados"}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {items.length === 0
                      ? "Aparecerán aquí cuando se publiquen"
                      : "Prueba con otros términos"}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {filtered.map((item) => {
                    const isActive = item.id === selectedId;
                    return (
                      <li
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 transition-colors flex items-start gap-2.5 group cursor-pointer select-none outline-none",
                          isActive
                            ? "bg-primary/10 border-l-2 border-primary"
                            : "hover:bg-muted/60 border-l-2 border-transparent focus-visible:bg-muted/60"
                        )}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedId(item.id);
                          }
                        }}
                      >
                        <DynamicIcon
                          name={sourceIcons[item.source]}
                          size={16}
                          className={cn("mt-0.5 shrink-0", sourceColors[item.source])}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium line-clamp-2 leading-snug",
                              isActive && "text-primary"
                            )}
                          >
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
                              {item.categoryLabel}
                            </Badge>
                            {item.date && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatShortDate(item.date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Descargar"
                        >
                          <DynamicIcon name="Download" size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* VIEWER */}
          <div className="rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col min-h-[400px]">
            {selected ? (
              <>
                <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <DynamicIcon
                      name={sourceIcons[selected.source]}
                      size={16}
                      className={cn("shrink-0", sourceColors[selected.source])}
                    />
                    <span className="text-sm font-medium truncate">{selected.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    onClick={() => handleDownload(selected)}
                  >
                    <DynamicIcon name="Download" size={14} />
                    <span className="ml-1 text-xs hidden sm:inline">Descargar</span>
                  </Button>
                </div>
                <div className="flex-1 min-h-0 bg-muted/20">
                  {viewerUrl && (
                    <PdfSnippetViewer
                      key={selected.id}
                      src={viewerUrl}
                      className="w-full h-full"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  <DynamicIcon name="FileText" size={28} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Selecciona un documento para previsualizarlo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
