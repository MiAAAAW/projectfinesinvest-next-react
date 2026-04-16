"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// POSGRADO EXPLORER · navegación jerárquica de programas
//
// Nivel superior:  Tabs Maestría · Doctorado  (los niveles sin programas se ocultan)
// Dentro de un nivel con >1 programa: pills minimalistas como sub-selector.
// Con 1 programa: render directo (sin UI extra).
// Con 0 programas: el nivel no aparece (filtrado en el server).
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ExternalLink, GraduationCap, ClipboardList, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PosgradoLevel } from "@/lib/constants/posgrado";

const PdfSnippetViewer = dynamic(
  () => import("@/components/ui/pdf-snippet-viewer").then((m) => m.PdfSnippetViewer),
  { ssr: false },
);

export interface ProgramDTO {
  section: string;
  level: PosgradoLevel;
  name: string | null;
  description: string | null;
  content: string | null;
  requisitos: string | null;
  contacto: string | null;
  pdfDoc: { id: string; title: string; fileUrl: string } | null;
}

export interface PosgradoLevelGroup {
  level: PosgradoLevel;
  labelPlural: string;
  labelSingle: string;
  programs: ProgramDTO[];
}

export function PosgradoExplorer({ groups }: { groups: PosgradoLevelGroup[] }) {
  const visibleGroups = useMemo(() => groups.filter((g) => g.programs.length > 0), [groups]);

  if (visibleGroups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-16 text-center">
        Aún no hay información de programas publicada.
      </p>
    );
  }

  // Si solo queda 1 nivel con programas, obviar el tab de nivel
  if (visibleGroups.length === 1) {
    return <LevelGroup group={visibleGroups[0]} />;
  }

  return (
    <Tabs defaultValue={visibleGroups[0].level} className="space-y-6">
      <TabsList
        className="w-full max-w-md mx-auto grid h-11 p-1 bg-muted/40"
        style={{ gridTemplateColumns: `repeat(${visibleGroups.length}, minmax(0, 1fr))` }}
      >
        {visibleGroups.map((g) => (
          <TabsTrigger
            key={g.level}
            value={g.level}
            className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-[0_0_12px_-2px] data-[state=active]:shadow-primary/30 data-[state=active]:ring-1 data-[state=active]:ring-primary/20 data-[state=active]:text-primary data-[state=active]:font-semibold transition-all"
          >
            <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
            {g.labelPlural}
          </TabsTrigger>
        ))}
      </TabsList>

      {visibleGroups.map((g) => (
        <TabsContent key={g.level} value={g.level} className="mt-6">
          <LevelGroup group={g} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// LEVEL GROUP · render de los programas de un nivel
// ────────────────────────────────────────────────────────────────────────────

function LevelGroup({ group }: { group: PosgradoLevelGroup }) {
  const [activeSection, setActiveSection] = useState(group.programs[0].section);
  const active =
    group.programs.find((p) => p.section === activeSection) ?? group.programs[0];

  // 1 solo programa → sin selector, render directo
  if (group.programs.length === 1) {
    return <ProgramView program={group.programs[0]} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {group.programs.map((p) => {
          const isActive = p.section === active.section;
          const label = p.name?.trim() || `${group.labelSingle} sin título`;
          return (
            <button
              key={p.section}
              type="button"
              onClick={() => setActiveSection(p.section)}
              className={cn(
                "inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium",
                "border transition-all max-w-[20rem]",
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_-2px] shadow-primary/20"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border",
              )}
              aria-pressed={isActive}
            >
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <ProgramView program={active} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// PROGRAM VIEW · render de un programa (secciones condicionales)
// ────────────────────────────────────────────────────────────────────────────

function ProgramView({ program: p }: { program: ProgramDTO }) {
  return (
    <article className="space-y-10">
      {(p.name || p.description) && (
        <header className="text-center space-y-2 pb-2">
          {p.name && (
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
              {p.name}
            </h2>
          )}
          {p.description && (
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-balance">
              {p.description}
            </p>
          )}
        </header>
      )}

      {p.content && (
        <section>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm md:text-base whitespace-pre-wrap">
            {p.content}
          </div>
        </section>
      )}

      {p.requisitos && (
        <section>
          <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold text-foreground/80 mb-3 pb-2 border-b">
            <ClipboardList className="h-3.5 w-3.5" />
            Requisitos de admisión
          </h3>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {p.requisitos}
          </div>
        </section>
      )}

      {p.pdfDoc && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold text-foreground/80 pb-2 flex-1 border-b">
              <FileText className="h-3.5 w-3.5" />
              {p.pdfDoc.title}
            </h3>
            <a
              href={p.pdfDoc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline ml-3 whitespace-nowrap"
            >
              <ExternalLink className="h-3 w-3" />
              Abrir pestaña
            </a>
          </div>
          <div className="rounded-lg border bg-card overflow-hidden h-[70vh] min-h-[500px]">
            <PdfSnippetViewer key={p.pdfDoc.id} src={p.pdfDoc.fileUrl} className="w-full h-full" />
          </div>
        </section>
      )}

      {p.contacto && (
        <section>
          <h3 className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold text-foreground/80 mb-3 pb-2 border-b">
            <Mail className="h-3.5 w-3.5" />
            Contacto del programa
          </h3>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {p.contacto}
          </div>
        </section>
      )}
    </article>
  );
}
