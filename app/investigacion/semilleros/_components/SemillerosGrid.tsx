"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// SEMILLEROS GRID + DETAIL DIALOG
// Misma arquitectura que GroupsGrid: cards clickeables + dialog con miembros.
// Específico de semilleros: líneas UNAP como badges múltiples + responsable.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Users2, Sprout, Target, GraduationCap } from "lucide-react";
import { getInitials } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SemilleroCardData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  researchLines: string[];
  responsable: {
    id: string;
    name: string;
    avatarUrl: string | null;
    category: string | null;
    degree: string | null;
  } | null;
  coAdvisors: Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
    category: string | null;
    employmentType: string | null;
    role: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
    universityCode: string;
    program: string | null;
    role: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRID
// ═══════════════════════════════════════════════════════════════════════════════

export function SemillerosGrid({ semilleros }: { semilleros: SemilleroCardData[] }) {
  const [selected, setSelected] = useState<SemilleroCardData | null>(null);

  if (semilleros.length === 0) return <EmptyState />;

  // Contadores derivados de la data (cero hardcode)
  const totalSemilleros = semilleros.length;
  const totalIntegrantes = semilleros.reduce(
    (sum, s) =>
      sum + (s.responsable ? 1 : 0) + s.coAdvisors.length + s.students.length,
    0
  );
  const totalActivos = semilleros.filter((s) => s.status === "activo").length;

  return (
    <>
      <ResultsCount
        total={totalSemilleros}
        active={totalActivos}
        members={totalIntegrantes}
        singular="semillero"
        plural="semilleros"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {semilleros.map((s) => (
          <SemilleroCard key={s.id} semillero={s} onClick={() => setSelected(s)} />
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          {selected && <SemilleroDetail semillero={selected} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS COUNT · stat line arriba del grid
// ═══════════════════════════════════════════════════════════════════════════════

function ResultsCount({
  total,
  active,
  members,
  singular,
  plural,
}: {
  total: number;
  active: number;
  members: number;
  singular: string;
  plural: string;
}) {
  const label = total === 1 ? singular : plural;
  return (
    <div className="mb-5 flex items-center gap-3 text-sm text-muted-foreground">
      <div className="inline-flex items-center gap-1.5 rounded-full border bg-card/40 backdrop-blur-sm px-3 py-1">
        <span className="font-semibold text-foreground">{total}</span>
        <span>{label}</span>
        {active !== total && (
          <>
            <span className="text-muted-foreground/50">·</span>
            <span>
              <span className="font-medium text-foreground/80">{active}</span> activos
            </span>
          </>
        )}
      </div>
      {members > 0 && (
        <div className="inline-flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-foreground">{members}</span>
          <span>integrantes en total</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════════════════════════════════════

function SemilleroCard({
  semillero,
  onClick,
}: {
  semillero: SemilleroCardData;
  onClick: () => void;
}) {
  const isActive = semillero.status === "activo";
  const totalPeople =
    (semillero.responsable ? 1 : 0) + semillero.coAdvisors.length + semillero.students.length;
  const previewPeople = [
    ...(semillero.responsable
      ? [{ id: semillero.responsable.id, name: semillero.responsable.name, avatarUrl: semillero.responsable.avatarUrl }]
      : []),
    ...semillero.coAdvisors.map((t) => ({ id: t.id, name: t.name, avatarUrl: t.avatarUrl })),
    ...semillero.students.map((s) => ({ id: s.id, name: s.name, avatarUrl: s.avatarUrl })),
  ].slice(0, 5);
  const remaining = totalPeople - previewPeople.length;

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative rounded-xl border bg-card/40 backdrop-blur-sm p-5 flex flex-col cursor-pointer hover:border-primary/40 hover:bg-card/70 transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 shrink-0">
          <Sprout className="h-5 w-5" />
        </div>
        <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase tracking-wide">
          {semillero.status}
        </Badge>
      </div>

      <h3 className="text-base font-semibold leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {semillero.name}
      </h3>

      {semillero.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {semillero.description}
        </p>
      )}

      {semillero.researchLines.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {semillero.researchLines.slice(0, 3).map((line) => (
            <Badge key={line} variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-4">
              {line}
            </Badge>
          ))}
          {semillero.researchLines.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              +{semillero.researchLines.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="mt-auto space-y-2.5 pt-3 border-t border-border/50">
        <MetaRow icon={<Target className="h-3.5 w-3.5" />} label="Responsable">
          {semillero.responsable ? (
            <span className="text-foreground/90 line-clamp-1">{semillero.responsable.name}</span>
          ) : (
            <span className="italic text-muted-foreground/70">Por asignar</span>
          )}
        </MetaRow>

        <MetaRow
          icon={<Users2 className="h-3.5 w-3.5" />}
          label={totalPeople === 1 ? "Integrante" : "Integrantes"}
        >
          {totalPeople > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {previewPeople.map((p) => (
                  <Avatar key={p.id} className="h-5 w-5 ring-2 ring-card">
                    {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt={p.name} /> : null}
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                      {getInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {totalPeople}
                {remaining > 0 && ` · +${remaining}`}
              </span>
            </div>
          ) : (
            <span className="italic text-muted-foreground/70">Sin integrantes</span>
          )}
        </MetaRow>
      </div>
    </article>
  );
}

function MetaRow({
  icon, label, children,
}: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 min-w-[90px]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

function SemilleroDetail({ semillero }: { semillero: SemilleroCardData }) {
  const isActive = semillero.status === "activo";

  return (
    <>
      <DialogHeader className="shrink-0">
        <div className="flex items-start gap-3 mb-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
            <Sprout className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg font-bold leading-tight">
              {semillero.name}
            </DialogTitle>
            <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase mt-1">
              {semillero.status}
            </Badge>
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto space-y-5 min-h-0 -mx-1 px-1">
        {semillero.description && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Objetivo
            </h4>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {semillero.description}
            </p>
          </div>
        )}

        {semillero.researchLines.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Líneas de investigación
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {semillero.researchLines.map((line) => (
                <Badge key={line} variant="secondary" className="text-xs">
                  {line}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {semillero.responsable && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Responsable
            </h4>
            <PersonRow
              name={semillero.responsable.name}
              avatarUrl={semillero.responsable.avatarUrl}
              subtitle={semillero.responsable.category}
              badge={semillero.responsable.degree || undefined}
            />
          </div>
        )}

        {semillero.coAdvisors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Users2 className="h-3.5 w-3.5" />
              Co-asesores
              <span className="text-xs font-normal text-muted-foreground">({semillero.coAdvisors.length})</span>
            </h4>
            <div className="space-y-1">
              {semillero.coAdvisors.map((t) => (
                <PersonRow
                  key={t.id}
                  name={t.name}
                  avatarUrl={t.avatarUrl}
                  subtitle={t.category}
                  badge={
                    t.employmentType
                      ? t.employmentType === "N" ? "Nombrado" : "Contratado"
                      : undefined
                  }
                  badgeVariant={t.employmentType === "N" ? "default" : "secondary"}
                  roleLabel={t.role !== "co-asesor" ? t.role : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {semillero.students.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Estudiantes
              <span className="text-xs font-normal text-muted-foreground">({semillero.students.length})</span>
            </h4>
            <div className="space-y-1">
              {semillero.students.map((s) => (
                <PersonRow
                  key={s.id}
                  name={s.name}
                  avatarUrl={s.avatarUrl}
                  subtitle={s.universityCode}
                  badge={s.program || undefined}
                  badgeVariant="outline"
                  roleLabel={s.role !== "miembro" ? s.role : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {!semillero.responsable && semillero.coAdvisors.length === 0 && semillero.students.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground italic">
            Este semillero aún no tiene integrantes asignados
          </div>
        )}
      </div>
    </>
  );
}

function PersonRow({
  name,
  avatarUrl,
  subtitle,
  badge,
  badgeVariant = "secondary",
  roleLabel,
}: {
  name: string;
  avatarUrl: string | null;
  subtitle?: string | null;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
  roleLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="h-8 w-8 shrink-0">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {roleLabel && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
            {roleLabel}
          </Badge>
        )}
        {badge && (
          <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
            {badge}
          </Badge>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Sprout className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">Aún no hay semilleros registrados</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Los semilleros aparecerán aquí una vez que se publiquen.
      </p>
    </div>
  );
}
