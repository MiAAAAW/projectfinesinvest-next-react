"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLICATIONS EXPLORER
// Grid de cards compactas con filtros dinámicos (tipo, año, docente) + búsqueda.
// Todas las opciones de filtros se derivan de la data (cero hardcode).
// Filtrado reactivo con useMemo (sin API calls extra).
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FileText, FileStack, Book, ExternalLink, Search, Users2, X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PublicationDTO {
  id: string;
  title: string;
  journal: string | null;
  year: number;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  url: string | null;
  type: string;
  indexedIn: string | null;
  abstract: string | null;
  authors: Array<{
    id: string;
    name: string;
    isFinesi: boolean;
    teacherId: string | null;
  }>;
}

// Labels y orden para tipos (se generan a partir de la data)
const TYPE_LABELS: Record<string, { label: string; icon: LucideIcon }> = {
  articulo: { label: "Artículo", icon: FileText },
  capitulo: { label: "Capítulo", icon: FileStack },
  libro: { label: "Libro", icon: Book },
};

const getTypeLabel = (type: string) => TYPE_LABELS[type]?.label ?? type;
const getTypeIcon = (type: string) => TYPE_LABELS[type]?.icon ?? FileText;

const ALL = "__all__";

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function PublicationsExplorer({ publications }: { publications: PublicationDTO[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [yearFilter, setYearFilter] = useState<string>(ALL);
  const [teacherFilter, setTeacherFilter] = useState<string>(ALL);

  // ─── Opciones derivadas de la data ────────────────────────────────────
  const types = useMemo(() => {
    const counts = new Map<string, number>();
    publications.forEach((p) => counts.set(p.type, (counts.get(p.type) ?? 0) + 1));
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: getTypeLabel(value), count }))
      .sort((a, b) => b.count - a.count);
  }, [publications]);

  const years = useMemo(() => {
    const s = new Set<number>();
    publications.forEach((p) => s.add(p.year));
    return Array.from(s).sort((a, b) => b - a);
  }, [publications]);

  const teachers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    publications.forEach((p) => {
      const seen = new Set<string>();
      p.authors.forEach((a) => {
        if (!a.isFinesi || !a.teacherId || seen.has(a.teacherId)) return;
        seen.add(a.teacherId);
        const existing = map.get(a.teacherId);
        if (existing) existing.count++;
        else map.set(a.teacherId, { id: a.teacherId, name: a.name, count: 1 });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [publications]);

  // ─── Filtrado ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publications.filter((p) => {
      if (typeFilter !== ALL && p.type !== typeFilter) return false;
      if (yearFilter !== ALL && String(p.year) !== yearFilter) return false;
      if (teacherFilter !== ALL) {
        const hit = p.authors.some((a) => a.teacherId === teacherFilter);
        if (!hit) return false;
      }
      if (q) {
        const inTitle = p.title.toLowerCase().includes(q);
        const inJournal = (p.journal ?? "").toLowerCase().includes(q);
        const inAuthor = p.authors.some((a) => a.name.toLowerCase().includes(q));
        const inDoi = (p.doi ?? "").toLowerCase().includes(q);
        if (!inTitle && !inJournal && !inAuthor && !inDoi) return false;
      }
      return true;
    });
  }, [publications, search, typeFilter, yearFilter, teacherFilter]);

  const hasActiveFilters = typeFilter !== ALL || yearFilter !== ALL || teacherFilter !== ALL || search.trim() !== "";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter(ALL);
    setYearFilter(ALL);
    setTeacherFilter(ALL);
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, autor, revista o DOI..."
          className="pl-9 h-10"
        />
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-2">
        <TypePill
          active={typeFilter === ALL}
          onClick={() => setTypeFilter(ALL)}
          label="Todos"
          count={publications.length}
        />
        {types.map((t) => {
          const Icon = getTypeIcon(t.value);
          return (
            <TypePill
              key={t.value}
              active={typeFilter === t.value}
              onClick={() => setTypeFilter(t.value)}
              label={t.label}
              count={t.count}
              icon={<Icon className="h-3.5 w-3.5" />}
            />
          );
        })}
      </div>

      {/* Year + Teacher filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">Año</label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">Docente</label>
          <Select value={teacherFilter} onValueChange={setTeacherFilter}>
            <SelectTrigger className="h-8 w-[240px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar
          </Button>
        )}

        <div className="ml-auto text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>
          {" "}de {publications.length} publicaciones
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState onClear={clearFilters} hasFilters={hasActiveFilters} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <PublicationCard key={p.id} pub={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE PILL
// ═══════════════════════════════════════════════════════════════════════════════

function TypePill({
  active, onClick, label, count, icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors border",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
      <span className={cn(
        "rounded-full px-1.5 py-0 text-[10px] font-semibold",
        active ? "bg-primary-foreground/20" : "bg-muted"
      )}>
        {count}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLICATION CARD · compact academic style
// ═══════════════════════════════════════════════════════════════════════════════

function PublicationCard({ pub }: { pub: PublicationDTO }) {
  const TypeIcon = getTypeIcon(pub.type);
  const typeLabel = getTypeLabel(pub.type);
  const finesiAuthors = pub.authors.filter((a) => a.isFinesi).length;

  // Formato compacto de revista + volumen/páginas
  const venuePieces: string[] = [];
  if (pub.journal) venuePieces.push(pub.journal);
  const biblio: string[] = [];
  if (pub.volume) biblio.push(`Vol. ${pub.volume}`);
  if (pub.issue) biblio.push(`No. ${pub.issue}`);
  if (pub.pages) biblio.push(`pp. ${pub.pages}`);
  const venue = venuePieces.join(" · ");

  return (
    <li className="group flex flex-col rounded-lg border bg-card/40 backdrop-blur-sm p-4 hover:border-primary/40 hover:bg-card/70 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <TypeIcon className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wide">{typeLabel}</span>
        </div>
        <span className="text-muted-foreground/50">·</span>
        <span className="text-[11px] font-semibold text-foreground/80">{pub.year}</span>
        {pub.indexedIn && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {pub.indexedIn}
            </Badge>
          </>
        )}
        {finesiAuthors > 1 && (
          <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 h-4 gap-1">
            <Users2 className="h-2.5 w-2.5" />
            {finesiAuthors} FINESI
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-3 mb-2 group-hover:text-primary transition-colors">
        {pub.title}
      </h3>

      {/* Venue + biblio */}
      {(venue || biblio.length > 0) && (
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {venue}
          {venue && biblio.length > 0 && " · "}
          {biblio.join(" · ")}
        </p>
      )}

      {/* Authors */}
      <p className="text-xs line-clamp-2 mt-auto">
        {pub.authors.slice(0, 6).map((a, i) => (
          <span key={a.id}>
            <span className={cn(a.isFinesi && "font-semibold text-foreground")}>
              {a.name}
            </span>
            {i < Math.min(pub.authors.length, 6) - 1 && <span className="text-muted-foreground">, </span>}
          </span>
        ))}
        {pub.authors.length > 6 && (
          <span className="text-muted-foreground"> +{pub.authors.length - 6} más</span>
        )}
      </p>

      {/* DOI link */}
      {pub.doi && (
        <a
          href={`https://doi.org/${pub.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-2 self-start"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="font-mono">{pub.doi.length > 40 ? pub.doi.slice(0, 40) + "…" : pub.doi}</span>
        </a>
      )}
    </li>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">
        {hasFilters ? "Sin resultados" : "Aún no hay publicaciones"}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {hasFilters
          ? "Ninguna publicación coincide con los filtros actuales."
          : "Las publicaciones aparecerán aquí cuando se publiquen."}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
