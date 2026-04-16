"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHERS EXPLORER — grid minimalista con búsqueda + filtro RENACYT
// Todos los filtros derivados de la data (cero hardcode de opciones).
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Search, Users, X, GraduationCap, FileText, BookOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeacherCardData {
  id: string;
  name: string;
  slug: string;
  academicTitle: string | null;
  degree: string | null;
  specialty: string | null;
  avatarUrl: string | null;
  isRenacyt: boolean;
  renacytLevel: string | null;
  bioSnippet: string | null;
  publicationsCount: number;
  thesisCount: number;
  formationsCount: number;
}

const ALL = "__all__";

export function TeachersExplorer({ teachers }: { teachers: TeacherCardData[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>(ALL);

  const renacytCount = useMemo(() => teachers.filter((t) => t.isRenacyt).length, [teachers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      if (filter === "renacyt" && !t.isRenacyt) return false;
      if (filter === "non-renacyt" && t.isRenacyt) return false;
      if (q) {
        const hay = `${t.name} ${t.academicTitle ?? ""} ${t.specialty ?? ""} ${t.degree ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [teachers, search, filter]);

  const hasActive = filter !== ALL || search.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, título, especialidad..."
          className="pl-9 h-10"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Pill active={filter === ALL} onClick={() => setFilter(ALL)} label="Todos" count={teachers.length} />
        <Pill
          active={filter === "renacyt"}
          onClick={() => setFilter("renacyt")}
          label="RENACYT"
          count={renacytCount}
          icon={<BadgeCheck className="h-3.5 w-3.5" />}
        />
        <Pill
          active={filter === "non-renacyt"}
          onClick={() => setFilter("non-renacyt")}
          label="Otros"
          count={teachers.length - renacytCount}
        />
        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilter(ALL);
              setSearch("");
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar
          </Button>
        )}
        {!hasActive && (
          <span className="ml-auto text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "docente" : "docentes"}
          </span>
        )}
        {hasActive && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> de {teachers.length}
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-16 text-center">
          No se encontraron docentes con estos filtros.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TeacherCard key={t.id} t={t} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  label,
  count,
  icon,
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
      <span
        className={cn(
          "rounded-full px-1.5 py-0 text-[10px] font-semibold",
          active ? "bg-primary-foreground/20" : "bg-muted"
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD · estilo académico compacto
// ═══════════════════════════════════════════════════════════════════════════════

function TeacherCard({ t }: { t: TeacherCardData }) {
  return (
    <li>
      <Link
        href={`/investigacion/docentes/${t.slug}`}
        className="group flex h-full flex-col rounded-lg border bg-card/40 backdrop-blur-sm p-4 hover:border-primary/40 hover:bg-card/70 transition-colors"
      >
        {/* Header: avatar + badge */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={t.name} avatarUrl={t.avatarUrl} />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {t.name}
            </h3>
            {t.academicTitle ? (
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1 line-clamp-1">
                {t.academicTitle}
              </p>
            ) : t.degree ? (
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{t.degree}</p>
            ) : null}
          </div>
          {t.isRenacyt && (
            <span
              title="Calificado RENACYT"
              className="inline-flex items-center justify-center rounded-full bg-primary/10 p-1 shrink-0"
            >
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
            </span>
          )}
        </div>

        {/* Bio snippet */}
        {t.bioSnippet && (
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{t.bioSnippet}…</p>
        )}

        {/* Footer: counters */}
        <div className="mt-auto flex items-center gap-3 text-[11px] text-muted-foreground">
          <Stat icon={FileText} value={t.publicationsCount} label="pub." />
          <Stat icon={GraduationCap} value={t.thesisCount} label="tesis" />
          <Stat icon={BookOpen} value={t.formationsCount} label="grados" />
        </div>
      </Link>
    </li>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}

// ─── Avatar con fallback a iniciales ──────────────────────────────────────────
function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-10 w-10 rounded-full object-cover shrink-0 border bg-muted"
      />
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}
