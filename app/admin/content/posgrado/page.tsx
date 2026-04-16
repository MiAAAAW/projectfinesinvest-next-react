"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN · Editor de Posgrado (master-detail, multi-programa)
//
// Estructura:
//   - Header página (section="posgrado") → PageHeaderEditor colapsable.
//   - Índice (section="posgrado-index")   → 2 keys: maestrias, doctorados (CSV).
//   - Programas (section="posgrado-{level}" o "posgrado-{level}-{randomId}") →
//     cada uno editado con ProgramEditor (reutilizado, patrón idéntico a ética).
//
// Soporta N maestrías y M doctorados sin límite. Sin tabla nueva: todo se apoya
// en site_content(UNIQUE section,key). Los 2 programas pre-existentes conservan
// sus slugs (`posgrado-maestria`, `posgrado-doctorado`) por backward-compat.
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  GraduationCap,
  Plus,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeaderEditor } from "@/components/admin/PageHeaderEditor";
import { ProgramEditor } from "./_components/ProgramEditor";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  POSGRADO_HEADER_SECTION,
  POSGRADO_INDEX_SECTION,
  POSGRADO_LEVELS,
  generateProgramSection,
  parseIndexCsv,
  serializeIndexCsv,
  type PosgradoLevel,
} from "@/lib/constants/posgrado";

interface ProgramSummary {
  section: string;
  name: string;
  hasPdf: boolean;
}

type IndexState = Record<PosgradoLevel, string[]>;

const EMPTY_INDEX: IndexState = { maestria: [], doctorado: [] };

// ────────────────────────────────────────────────────────────────────────────
// Fetch helpers
// ────────────────────────────────────────────────────────────────────────────

async function fetchIndex(): Promise<IndexState> {
  const res = await fetch(`/api/content?section=${POSGRADO_INDEX_SECTION}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("No se pudo leer el índice de posgrados");
  const json = await res.json();
  const data = json.data?.[POSGRADO_INDEX_SECTION] ?? {};
  const state: IndexState = { maestria: [], doctorado: [] };
  for (const lvl of POSGRADO_LEVELS) {
    state[lvl.key] = parseIndexCsv(data[lvl.indexKey]?.value);
  }
  return state;
}

async function fetchProgramSummary(section: string): Promise<ProgramSummary> {
  const res = await fetch(`/api/content?section=${section}`, { cache: "no-store" });
  const json = await res.json();
  const data = json.data?.[section] ?? {};
  return {
    section,
    name: data.name?.value?.trim() || "",
    hasPdf: !!data.pdfDocumentId?.value?.trim(),
  };
}

async function persistIndex(next: IndexState): Promise<void> {
  const items = POSGRADO_LEVELS.map((lvl) => ({
    section: POSGRADO_INDEX_SECTION,
    key: lvl.indexKey,
    value: serializeIndexCsv(next[lvl.key]),
    type: "text",
  }));
  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "No se pudo guardar el índice");
  }
}

async function seedProgramName(section: string, name: string): Promise<void> {
  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ section, key: "name", value: name, type: "text" }],
    }),
  });
  if (!res.ok) throw new Error("No se pudo crear el programa");
}

// ────────────────────────────────────────────────────────────────────────────
// Página admin
// ────────────────────────────────────────────────────────────────────────────

export default function PosgradoEditorPage() {
  const [level, setLevel] = useState<PosgradoLevel>("maestria");
  const [index, setIndex] = useState<IndexState>(EMPTY_INDEX);
  const [programs, setPrograms] = useState<Record<string, ProgramSummary>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);

  // Carga inicial: índice + summary de cada programa en paralelo
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const idx = await fetchIndex();
        const all = [...idx.maestria, ...idx.doctorado];
        const summaries = await Promise.all(all.map(fetchProgramSummary));
        if (cancelled) return;
        const map: Record<string, ProgramSummary> = {};
        for (const s of summaries) map[s.section] = s;
        setIndex(idx);
        setPrograms(map);
        setSelected(idx.maestria[0] ?? idx.doctorado[0] ?? null);
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error("Error al cargar posgrados");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Al cambiar de nivel (o si el índice cambia), si la selección actual no
  // pertenece al nivel activo, saltar al primer programa del nivel.
  useEffect(() => {
    const current = index[level];
    if (selected && current.includes(selected)) return;
    setSelected(current[0] ?? null);
  }, [level, index, selected]);

  const levelMeta = POSGRADO_LEVELS.find((l) => l.key === level)!;
  const currentSections = index[level];

  // ── Crear ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Ingresá un nombre");
      return;
    }
    setCreating(true);
    try {
      const section = generateProgramSection(level);
      // [1/2] Crear la sección con el name
      await seedProgramName(section, name);
      // [2/2] Actualizar el índice
      const next: IndexState = {
        ...index,
        [level]: [...index[level], section],
      };
      await persistIndex(next);
      setIndex(next);
      setPrograms((prev) => ({ ...prev, [section]: { section, name, hasPdf: false } }));
      setSelected(section);
      setCreateOpen(false);
      setNewName("");
      toast.success(`${levelMeta.labelSingle} agregad${levelMeta.key === "maestria" ? "a" : "o"}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  };

  // ── Eliminar (cascade del PDF si existe) ────────────────────────────────
  const handleDelete = async (section: string) => {
    const summary = programs[section];
    const displayName = summary?.name || "este programa";
    const hasPdf = summary?.hasPdf;
    const warning = hasPdf
      ? `¿Eliminar "${displayName}"? Se borrará también su PDF del plan de estudios y desaparecerá de la sección Documentos del landing.`
      : `¿Eliminar "${displayName}"? Esta acción no se puede deshacer.`;
    if (!confirm(warning)) return;

    setDeleting(section);
    try {
      // [1/3] Cascade del PDF vinculado (si lo hay)
      if (hasPdf) {
        const res = await fetch(`/api/content?section=${section}`, { cache: "no-store" });
        const json = await res.json();
        const pdfId = json.data?.[section]?.pdfDocumentId?.value?.trim();
        if (pdfId) {
          const delDoc = await fetch(`/api/documents/${pdfId}`, { method: "DELETE" });
          if (!delDoc.ok && delDoc.status !== 404) {
            throw new Error("No se pudo eliminar el PDF vinculado");
          }
        }
      }

      // [2/3] Soft-delete de toda la sección (todos los keys)
      const delSec = await fetch(`/api/content/${section}`, { method: "DELETE" });
      if (!delSec.ok) throw new Error("No se pudo eliminar el contenido del programa");

      // [3/3] Quitar del índice
      const next: IndexState = {
        ...index,
        [level]: index[level].filter((s) => s !== section),
      };
      await persistIndex(next);

      setIndex(next);
      setPrograms((prev) => {
        const copy = { ...prev };
        delete copy[section];
        return copy;
      });
      setSelected((prev) => (prev === section ? next[level][0] ?? null : prev));
      toast.success("Programa eliminado");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  // Callback desde ProgramEditor → refresca el item del sidebar
  const handleEditorMetaChange = useCallback(
    (section: string, meta: { name: string; hasPdf: boolean }) => {
      setPrograms((prev) => ({
        ...prev,
        [section]: {
          section,
          name: meta.name,
          hasPdf: meta.hasPdf,
        },
      }));
    },
    [],
  );

  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header de la página admin */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Posgrado</h1>
              <p className="text-muted-foreground">Programas de Maestría y Doctorado</p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/posgrado" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Ver página
          </Link>
        </Button>
      </div>

      {/* Encabezado público (colapsable) */}
      <PageHeaderEditor
        section={POSGRADO_HEADER_SECTION}
        placeholderTitle="Posgrado"
        placeholderDescription="Programas de posgrado de FINESI — formación avanzada en ingeniería estadística e informática."
      />

      {/* Switcher de nivel (pills minimalistas) */}
      <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1 w-fit">
        {POSGRADO_LEVELS.map((l) => {
          const count = index[l.key].length;
          const active = level === l.key;
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => setLevel(l.key)}
              className={cn(
                "inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-all",
                active
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.labelPlural}
              <span
                className={cn(
                  "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                  active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Master-detail */}
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar · lista de programas del nivel activo */}
        <aside className="space-y-1">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
              {levelMeta.labelPlural}
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2"
              onClick={() => {
                setNewName("");
                setCreateOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Nuevo
            </Button>
          </div>

          {loading ? (
            <p className="px-2 py-8 text-xs text-muted-foreground text-center">Cargando...</p>
          ) : currentSections.length === 0 ? (
            <div className="rounded-md border border-dashed px-3 py-8 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Aún no hay {levelMeta.labelPlural.toLowerCase()}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewName("");
                  setCreateOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Crear {levelMeta.labelArticle === "la" ? "la primera" : "el primer"}{" "}
                {levelMeta.labelSingle.toLowerCase()}
              </Button>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {currentSections.map((section) => {
                const p = programs[section];
                const isSelected = selected === section;
                const isBusy = deleting === section;
                return (
                  <li key={section}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(section)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(section);
                        }
                      }}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/60 text-foreground",
                      )}
                    >
                      <GraduationCap
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="flex-1 min-w-0 text-sm truncate font-medium">
                        {p?.name || <span className="italic text-muted-foreground">Sin título</span>}
                      </span>
                      {p?.hasPdf && (
                        <FileText
                          className={cn(
                            "h-3 w-3 shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground/70",
                          )}
                          aria-label="Tiene PDF"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(section);
                        }}
                        disabled={isBusy}
                        className={cn(
                          "shrink-0 rounded p-0.5 text-muted-foreground/60 transition",
                          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                          "hover:text-destructive hover:bg-destructive/10",
                          "disabled:opacity-100",
                        )}
                        aria-label={`Eliminar ${p?.name || "programa"}`}
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Detalle · editor del programa seleccionado */}
        <section className="min-w-0">
          {loading ? (
            <div className="rounded-md border border-dashed p-16 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : selected ? (
            <ProgramEditor
              key={selected}
              section={selected}
              label={programs[selected]?.name || levelMeta.labelSingle}
              defaultPdfTitle={`Plan de estudios — ${
                programs[selected]?.name || levelMeta.labelSingle
              }`}
              onMetaChange={(meta) => handleEditorMetaChange(selected, meta)}
            />
          ) : (
            <div className="rounded-md border border-dashed p-16 text-center">
              <p className="text-sm text-muted-foreground">
                Seleccioná un programa o creá uno nuevo para empezar a editar.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Modal · crear programa */}
      <Dialog open={createOpen} onOpenChange={(v) => !creating && setCreateOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva {levelMeta.labelSingle.toLowerCase()}</DialogTitle>
            <DialogDescription>
              Asigná un nombre provisional. Podrás completar descripción, contenido, requisitos,
              contacto y PDF del plan de estudios después.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="posgrado-new-name" className="text-xs uppercase tracking-wide">
              Nombre del programa
            </Label>
            <Input
              id="posgrado-new-name"
              placeholder={
                level === "maestria"
                  ? "Ej: Maestría en Ciencia de Datos"
                  : "Ej: Doctorado en Estadística"
              }
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim() && !creating) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              disabled={creating}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear programa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
