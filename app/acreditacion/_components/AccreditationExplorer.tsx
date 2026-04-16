"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ACCREDITATION EXPLORER · split layout (tree izq + visor PDF der)
// - Accordion por estándar (shadcn, type=multiple)
// - Tabs por categoría SOLO si el estándar tiene >1 categoría (data-driven)
// - Filtro de búsqueda cross-tree
// - Deep-link por hash (#E22.1 → abre y selecciona automáticamente)
// - Visor con tabs si la evidencia tiene >1 PDF
// Cero hardcode: categorías, counts, orden — todo derivado de la data.
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText, Search, Download, ExternalLink, X, FileStack,
} from "lucide-react";

const PdfSnippetViewer = dynamic(
  () => import("@/components/ui/pdf-snippet-viewer").then((m) => m.PdfSnippetViewer),
  { ssr: false }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface DocumentDTO {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: string | null;
  fileType: string | null;
}

export interface SubEvidenceDTO {
  id: string;
  code: string;
  name: string;
  category: string;
  documents: DocumentDTO[];
}

export interface StandardDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  subEvidences: SubEvidenceDTO[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function AccreditationExplorer({ standards }: { standards: StandardDTO[] }) {
  const [search, setSearch] = useState("");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  // Accordion single — un estándar abierto a la vez (UX más limpia, sin scroll largo)
  const [openStandard, setOpenStandard] = useState<string>(() =>
    standards.length > 0 ? standards[0].id : ""
  );
  // Categoría activa por estándar (data-driven, no hardcoded)
  const [activeCategoryByStd, setActiveCategoryByStd] = useState<Record<string, string>>({});

  // ─── Filtrado por búsqueda (cross-tree) ──────────────────────────────────────
  const q = search.trim().toLowerCase();
  const matchesSearch = useCallback(
    (text: string) => !q || text.toLowerCase().includes(q),
    [q]
  );

  const filteredStandards = useMemo(() => {
    if (!q) return standards;
    return standards
      .map((s) => {
        const stdMatch = matchesSearch(s.code + " " + s.name);
        const filteredSub = s.subEvidences.filter((se) =>
          stdMatch || matchesSearch(se.code + " " + se.name)
        );
        if (stdMatch || filteredSub.length > 0) {
          return { ...s, subEvidences: stdMatch ? s.subEvidences : filteredSub };
        }
        return null;
      })
      .filter((s): s is StandardDTO => s !== null);
  }, [standards, q, matchesSearch]);

  // Al buscar, abre el primero con matches (single mode)
  useEffect(() => {
    if (!q || filteredStandards.length === 0) return;
    setOpenStandard(filteredStandards[0].id);
  }, [q, filteredStandards]);

  // ─── Evidencia seleccionada + documento activo ───────────────────────────────
  const flatEvidences = useMemo(
    () => standards.flatMap((s) => s.subEvidences),
    [standards]
  );

  const selectedEvidence = useMemo(
    () => flatEvidences.find((e) => e.id === selectedEvidenceId) ?? null,
    [flatEvidences, selectedEvidenceId]
  );

  const selectedDoc = useMemo(
    () => selectedEvidence?.documents.find((d) => d.id === selectedDocId) ?? null,
    [selectedEvidence, selectedDocId]
  );

  // Al cambiar evidencia, selecciona el primer PDF automáticamente
  useEffect(() => {
    if (!selectedEvidence) return;
    if (selectedDoc && selectedEvidence.documents.some((d) => d.id === selectedDoc.id)) return;
    setSelectedDocId(selectedEvidence.documents[0]?.id ?? null);
  }, [selectedEvidence, selectedDoc]);

  // ─── Deep-link: parsea hash actual + re-parsea en `hashchange` ──────────────
  //   #E22.1                    → abre standard + category + selecciona evidencia
  //   #std-22                   → abre standard 22
  //   #std-22-Planificación     → abre 22 + activa tab Planificación
  useEffect(() => {
    const applyHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      if (!hash) return;

      // 1) Evidencia por código/id
      const target = flatEvidences.find((e) => e.code === hash || e.id === hash);
      if (target) {
        const std = standards.find((s) =>
          s.subEvidences.some((se) => se.id === target.id)
        );
        if (std) {
          setOpenStandard(std.id);
          setActiveCategoryByStd((prev) => ({ ...prev, [std.id]: target.category }));
        }
        setSelectedEvidenceId(target.id);
        return;
      }

      // 2) Standard: `std-{code}` o `std-{code}-{category}`
      const stdMatch = hash.match(/^std-([^-]+)(?:-(.+))?$/);
      if (stdMatch) {
        const [, stdCode, catName] = stdMatch;
        const std = standards.find((s) => s.code === stdCode);
        if (std) {
          setOpenStandard(std.id);
          if (catName) {
            setActiveCategoryByStd((prev) => ({ ...prev, [std.id]: catName }));
          }
        }
      }
    };

    applyHash(); // al montar
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [flatEvidences, standards]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar estándar o evidencia..."
          className="pl-9 h-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Split layout */}
      <div className="grid lg:grid-cols-[minmax(320px,_380px)_1fr] gap-4 h-[78vh] min-h-[560px]">
        {/* ─── TREE IZQUIERDA ─── */}
        <aside className="rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
          <ScrollArea className="flex-1 min-h-0">
            {filteredStandards.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center">
                {q ? "Sin resultados." : "Aún no hay estándares publicados."}
              </p>
            ) : (
              <Accordion
                type="single"
                collapsible
                value={openStandard}
                onValueChange={setOpenStandard}
                className="px-1 pb-2"
              >
                {filteredStandards.map((std) => (
                  <StandardTreeItem
                    key={std.id}
                    std={std}
                    activeCategory={activeCategoryByStd[std.id]}
                    onCategoryChange={(cat) =>
                      setActiveCategoryByStd((prev) => ({ ...prev, [std.id]: cat }))
                    }
                    selectedEvidenceId={selectedEvidenceId}
                    onSelectEvidence={setSelectedEvidenceId}
                  />
                ))}
              </Accordion>
            )}
          </ScrollArea>
        </aside>

        {/* ─── VISOR DERECHA ─── */}
        <section className="rounded-lg border bg-card overflow-hidden flex flex-col">
          <EvidenceViewer
            evidence={selectedEvidence}
            selectedDoc={selectedDoc}
            onSelectDoc={setSelectedDocId}
          />
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STANDARD TREE ITEM (accordion)
// ═══════════════════════════════════════════════════════════════════════════════

function StandardTreeItem({
  std,
  activeCategory,
  onCategoryChange,
  selectedEvidenceId,
  onSelectEvidence,
}: {
  std: StandardDTO;
  activeCategory: string | undefined;
  onCategoryChange: (cat: string) => void;
  selectedEvidenceId: string | null;
  onSelectEvidence: (id: string) => void;
}) {
  // Categorías únicas derivadas de la data (cero hardcode)
  const categories = useMemo(() => {
    const order: string[] = [];
    const seen = new Set<string>();
    for (const se of std.subEvidences) {
      if (!seen.has(se.category)) {
        seen.add(se.category);
        order.push(se.category);
      }
    }
    return order;
  }, [std.subEvidences]);

  const hasTabs = categories.length > 1;
  const currentCat = activeCategory ?? categories[0] ?? "";

  const totalEvidences = std.subEvidences.length;

  return (
    <AccordionItem value={std.id} className="border-b">
      <AccordionTrigger className="hover:no-underline px-2 py-3">
        <div className="text-left flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight line-clamp-2">
            <span className="font-mono text-primary/80 mr-1.5">E{std.code}</span>
            {std.name}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {totalEvidences} {totalEvidences === 1 ? "evidencia" : "evidencias"}
          </p>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-1 pb-2">
        {hasTabs ? (
          <Tabs value={currentCat} onValueChange={onCategoryChange}>
            <TabsList className="w-full h-auto flex-wrap justify-start p-1 bg-muted/40 gap-0.5">
              {categories.map((cat) => {
                const count = std.subEvidences.filter((se) => se.category === cat).length;
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className={cn(
                      "text-[11px] h-7 px-3 gap-1.5 transition-all duration-200",
                      "data-[state=active]:bg-background",
                      "data-[state=active]:shadow-[0_0_12px_-2px] data-[state=active]:shadow-primary/30",
                      "data-[state=active]:ring-1 data-[state=active]:ring-primary/20",
                      "data-[state=active]:text-primary data-[state=active]:font-semibold",
                      "data-[state=inactive]:text-muted-foreground"
                    )}
                  >
                    {cat}
                    <span className="text-[9px] font-mono opacity-70">
                      {count}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-2">
                <EvidencesList
                  items={std.subEvidences.filter((se) => se.category === cat)}
                  selectedEvidenceId={selectedEvidenceId}
                  onSelect={onSelectEvidence}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <EvidencesList
            items={std.subEvidences}
            selectedEvidenceId={selectedEvidenceId}
            onSelect={onSelectEvidence}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCES LIST
// ═══════════════════════════════════════════════════════════════════════════════

function EvidencesList({
  items,
  selectedEvidenceId,
  onSelect,
}: {
  items: SubEvidenceDTO[];
  selectedEvidenceId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground px-3 py-2">
        Sin evidencias en esta categoría.
      </p>
    );
  }
  return (
    <ul className="space-y-0.5">
      {items.map((se) => {
        const isActive = se.id === selectedEvidenceId;
        const docCount = se.documents.length;
        return (
          <li key={se.id}>
            <button
              type="button"
              onClick={() => onSelect(se.id)}
              className={cn(
                "w-full flex items-center gap-2 pl-2 pr-2.5 py-2 rounded-md text-left transition-all duration-200",
                "border-l-2",
                isActive
                  ? [
                      "bg-primary/10 text-primary border-l-primary",
                      "shadow-[0_0_16px_-2px] shadow-primary/40",
                      "ring-1 ring-primary/20",
                    ]
                  : docCount > 0
                  ? "border-l-transparent hover:bg-muted/60 hover:border-l-primary/40 text-foreground/80 hover:text-foreground"
                  : "border-l-transparent hover:bg-muted/40 text-foreground/50 hover:text-foreground/70"
              )}
            >
              <FileText
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isActive
                    ? "text-primary"
                    : docCount > 0
                    ? "text-foreground/60"
                    : "text-muted-foreground/50"
                )}
              />
              <span className="text-xs line-clamp-1 flex-1">
                <span className="font-mono text-[10px] text-muted-foreground/80 mr-1">
                  {se.code}
                </span>
                {se.name}
              </span>
              {docCount > 0 ? (
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="text-[9px] px-1.5 py-0 h-4 shrink-0 font-mono"
                >
                  {docCount}
                </Badge>
              ) : (
                <span className="text-[9px] text-muted-foreground/60 italic shrink-0">
                  sin PDF
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCE VIEWER (panel derecho)
// ═══════════════════════════════════════════════════════════════════════════════

function EvidenceViewer({
  evidence,
  selectedDoc,
  onSelectDoc,
}: {
  evidence: SubEvidenceDTO | null;
  selectedDoc: DocumentDTO | null;
  onSelectDoc: (id: string) => void;
}) {
  if (!evidence) {
    return (
      <div className="flex items-center justify-center flex-1 p-12 text-center">
        <div className="max-w-sm">
          <div className="mx-auto mb-4 rounded-full bg-muted/50 p-4 w-fit">
            <FileStack className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">Selecciona una evidencia</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Elige un estándar del árbol para ver sus documentos.
          </p>
        </div>
      </div>
    );
  }

  const hasDocs = evidence.documents.length > 0;
  const hasMultipleDocs = evidence.documents.length > 1;

  return (
    <>
      {/* Header de la evidencia */}
      <header className="px-4 py-3 border-b bg-card/60">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-[10px]">
                {evidence.category}
              </Badge>
              <span className="font-mono text-[10px] text-primary">
                {evidence.code}
              </span>
            </div>
            <h2 className="text-sm font-semibold mt-1 line-clamp-2">{evidence.name}</h2>
          </div>
          {selectedDoc && (
            <div className="flex items-center gap-1 shrink-0">
              <Button asChild variant="ghost" size="sm" title="Abrir en pestaña">
                <a href={selectedDoc.fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm" title="Descargar">
                <a href={selectedDoc.fileUrl} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Tabs de PDFs si hay >1 */}
        {hasMultipleDocs && (
          <Tabs
            value={selectedDoc?.id ?? evidence.documents[0].id}
            onValueChange={onSelectDoc}
            className="mt-2"
          >
            <TabsList className="h-auto p-1 bg-muted/40 flex-wrap justify-start">
              {evidence.documents.map((d) => (
                <TabsTrigger
                  key={d.id}
                  value={d.id}
                  className="text-[11px] h-7 px-2.5 gap-1"
                >
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[180px] truncate">{d.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </header>

      {/* Visor o empty */}
      <div className="flex-1 min-h-0">
        {hasDocs && selectedDoc ? (
          <PdfSnippetViewer
            key={selectedDoc.id}
            src={selectedDoc.fileUrl}
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full p-12 text-center">
            <div className="max-w-sm">
              <div className="mx-auto mb-4 rounded-full bg-muted/50 p-4 w-fit">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">
                Aún no hay documentos para esta evidencia
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Los PDFs se cargarán desde el panel administrativo.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
