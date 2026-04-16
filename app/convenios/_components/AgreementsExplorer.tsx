"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// AGREEMENTS EXPLORER · split layout con visor PDF embebido
// - Lista izquierda con logo institucional + metadata
// - Visor PDF derecha (mismo plugin que landing/ética/resoluciones)
// - Filtros: búsqueda + status + tipo (todos derivados de la data)
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
import { Building2, Search, Download, ExternalLink, X, Handshake } from "lucide-react";

const PdfSnippetViewer = dynamic(
  () => import("@/components/ui/pdf-snippet-viewer").then((m) => m.PdfSnippetViewer),
  { ssr: false }
);

export interface AgreementItem {
  id: string;
  title: string;
  institution: string;
  country: string | null;
  type: string;
  status: string;
  description: string | null;
  fileUrl: string | null;
  logoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
}

const ALL = "__all__";

export function AgreementsExplorer({ agreements }: { agreements: AgreementItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Early-return: explorer solo renderiza si hay AL MENOS 1 convenio con PDF real.
  // Sin PDFs útiles → solo texto sutil, sin search ni caja vacía.
  const hasAnyPdf = agreements.some(
    (a) => a.fileUrl && /^https?:\/\/[a-z0-9]/i.test(a.fileUrl.trim())
  );
  if (!hasAnyPdf) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        Aún no hay convenios disponibles para visualizar.
      </p>
    );
  }

  // Opciones derivadas (cero hardcode)
  const statuses = useMemo(() => {
    const s = new Set<string>();
    for (const a of agreements) s.add(a.status);
    return Array.from(s).sort();
  }, [agreements]);

  const types = useMemo(() => {
    const s = new Set<string>();
    for (const a of agreements) s.add(a.type);
    return Array.from(s).sort();
  }, [agreements]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agreements.filter((a) => {
      if (statusFilter !== ALL && a.status !== statusFilter) return false;
      if (typeFilter !== ALL && a.type !== typeFilter) return false;
      if (q) {
        const hay =
          `${a.title} ${a.institution} ${a.country ?? ""} ${a.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [agreements, search, statusFilter, typeFilter]);

  useEffect(() => {
    if (selectedId && filtered.some((r) => r.id === selectedId)) return;
    const first = filtered.find((r) => r.fileUrl);
    setSelectedId(first?.id ?? null);
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  const hasFilters = search.trim() !== "" || statusFilter !== ALL || typeFilter !== ALL;

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
            placeholder="Buscar por título, institución o país..."
            className="pl-9 h-10"
          />
        </div>

        {statuses.length > 1 && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[130px] text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {types.length > 1 && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-[150px] text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los tipos</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter(ALL);
              setTypeFilter(ALL);
            }}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          de {agreements.length}
        </span>
      </div>

      {/* Split layout */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh] rounded-lg border bg-card/40 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground text-center py-12">
            {hasFilters ? "No hay resultados con estos filtros." : "No hay convenios publicados."}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[minmax(300px,_360px)_1fr] gap-4 h-[78vh] min-h-[560px]">
          {/* LISTA */}
          <aside className="rounded-lg border bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
            <ul className="overflow-y-auto divide-y">
              {filtered.map((a) => (
                <AgreementListItem
                  key={a.id}
                  a={a}
                  active={a.id === selected?.id}
                  onClick={() => setSelectedId(a.id)}
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
                    <h2 className="text-sm font-semibold truncate">{selected.title}</h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {selected.institution}
                      {selected.country ? ` · ${selected.country}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild variant="ghost" size="sm">
                      <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" title="Abrir en nueva pestaña">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <a href={selected.fileUrl} download title="Descargar">
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
                <div className="max-w-md space-y-3">
                  <div className="mx-auto rounded-full bg-muted/50 p-4 w-fit">
                    <Handshake className="h-8 w-8 text-muted-foreground" />
                  </div>
                  {selected ? (
                    <AgreementDetailsFallback a={selected} />
                  ) : (
                    <>
                      <h3 className="text-base font-semibold">Selecciona un convenio</h3>
                      <p className="text-sm text-muted-foreground">
                        Elige un elemento de la lista para ver su contenido.
                      </p>
                    </>
                  )}
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

function AgreementListItem({
  a,
  active,
  onClick,
}: {
  a: AgreementItem;
  active: boolean;
  onClick: () => void;
}) {
  const start = a.startDate ? new Date(a.startDate).getFullYear() : null;
  const end = a.endDate ? new Date(a.endDate).getFullYear() : null;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full text-left px-4 py-3 flex gap-3 transition-colors",
          active
            ? "bg-primary/10 border-l-2 border-primary"
            : "hover:bg-muted/40 border-l-2 border-transparent"
        )}
      >
        {/* Logo o fallback */}
        <div className="shrink-0 h-10 w-10 rounded-md border bg-muted/50 flex items-center justify-center overflow-hidden">
          {a.logoUrl ? (
            <img
              src={a.logoUrl}
              alt={a.institution}
              className="h-full w-full object-contain"
            />
          ) : (
            <Building2 className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start gap-2">
            <h3
              className={cn(
                "text-sm font-semibold line-clamp-2 flex-1",
                active && "text-primary"
              )}
            >
              {a.title}
            </h3>
            <Badge
              variant={a.status === "vigente" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 h-4 shrink-0 capitalize"
            >
              {a.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {a.institution}
            {a.country ? ` · ${a.country}` : ""}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80">
            <span className="capitalize">{a.type}</span>
            {(start || end) && (
              <>
                <span>·</span>
                <span className="font-mono">
                  {start ?? "—"}–{end ?? "presente"}
                </span>
              </>
            )}
            {!a.fileUrl && (
              <>
                <span>·</span>
                <span className="italic">Sin PDF</span>
              </>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

// Detalles cuando el item seleccionado no tiene PDF
function AgreementDetailsFallback({ a }: { a: AgreementItem }) {
  return (
    <>
      <h3 className="text-base font-semibold">{a.title}</h3>
      <p className="text-sm text-muted-foreground">
        {a.institution}
        {a.country ? ` · ${a.country}` : ""}
      </p>
      {a.description && (
        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{a.description}</p>
      )}
      <p className="text-xs text-muted-foreground italic">
        Este convenio no tiene archivo PDF adjunto.
      </p>
    </>
  );
}
