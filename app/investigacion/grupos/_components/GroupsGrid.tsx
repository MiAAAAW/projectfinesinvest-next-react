"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// GROUPS GRID + DETAIL DIALOG
// Grid de grupos de investigación con expand-on-click.
// Patrón similar al modal de Research lines (consistencia de UI).
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Users2, Microscope, Target, GitBranch, GraduationCap, ExternalLink } from "lucide-react";
import { getInitials } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface GroupCardData {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  websiteUrl: string | null;
  status: string;
  researchLine: { id: string; title: string } | null;
  leader: {
    id: string;
    name: string;
    avatarUrl: string | null;
    category: string | null;
    degree: string | null;
  } | null;
  teachers: Array<{
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
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function GroupsGrid({ groups }: { groups: GroupCardData[] }) {
  const [selected, setSelected] = useState<GroupCardData | null>(null);

  if (groups.length === 0) return <EmptyState />;

  const total = groups.length;
  const active = groups.filter((g) => g.status === "activo").length;
  const members = groups.reduce(
    (sum, g) => sum + (g.leader ? 1 : 0) + g.teachers.length + g.students.length,
    0
  );

  return (
    <>
      <ResultsCount
        total={total}
        active={active}
        members={members}
        singular="grupo"
        plural="grupos"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} onClick={() => setSelected(g)} />
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          {selected && <GroupDetail group={selected} />}
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

function GroupCard({ group, onClick }: { group: GroupCardData; onClick: () => void }) {
  const isActive = group.status === "activo";
  const totalTeachers = group.teachers.length + (group.leader ? 1 : 0);
  const totalPeople = totalTeachers + group.students.length;
  const previewPeople = [
    ...(group.leader ? [{ id: group.leader.id, name: group.leader.name, avatarUrl: group.leader.avatarUrl }] : []),
    ...group.teachers.map((t) => ({ id: t.id, name: t.name, avatarUrl: t.avatarUrl })),
    ...group.students.map((s) => ({ id: s.id, name: s.name, avatarUrl: s.avatarUrl })),
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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
          <Microscope className="h-5 w-5" />
        </div>
        <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase tracking-wide">
          {group.status}
        </Badge>
      </div>

      <h3 className="text-base font-semibold leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors flex items-start gap-1.5">
        <span className="min-w-0 flex-1">{group.name}</span>
        {group.websiteUrl && (
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" aria-label="Tiene sitio externo" />
        )}
      </h3>
      {group.code && (
        <p className="text-xs text-muted-foreground font-mono mb-3">{group.code}</p>
      )}

      {group.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {group.description}
        </p>
      )}

      <div className="mt-auto space-y-2.5 pt-3 border-t border-border/50">
        {group.researchLine && (
          <MetaRow icon={<GitBranch className="h-3.5 w-3.5" />} label="Línea">
            <span className="text-foreground/90 line-clamp-1">{group.researchLine.title}</span>
          </MetaRow>
        )}

        <MetaRow icon={<Target className="h-3.5 w-3.5" />} label="Líder">
          {group.leader ? (
            <span className="text-foreground/90 line-clamp-1">{group.leader.name}</span>
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
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 min-w-[70px]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL DIALOG CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

function GroupDetail({ group }: { group: GroupCardData }) {
  const isActive = group.status === "activo";

  return (
    <>
      <DialogHeader className="shrink-0">
        <div className="flex items-start gap-3 mb-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Microscope className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg font-bold leading-tight">
              {group.name}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {group.code && (
                <span className="text-xs font-mono text-muted-foreground">{group.code}</span>
              )}
              <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] uppercase">
                {group.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto space-y-5 min-h-0 -mx-1 px-1">
        {group.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {group.description}
          </p>
        )}

        {group.researchLine && (
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Línea de investigación:</span>
            <span className="font-medium">{group.researchLine.title}</span>
          </div>
        )}

        {group.websiteUrl && (
          <a
            href={group.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {group.websiteUrl.replace(/^https?:\/\//, "")}
          </a>
        )}

        {/* ── Líder ── */}
        {group.leader && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Líder del grupo
            </h4>
            <PersonRow
              name={group.leader.name}
              avatarUrl={group.leader.avatarUrl}
              subtitle={group.leader.category}
              badge={group.leader.degree || undefined}
            />
          </div>
        )}

        {/* ── Docentes ── */}
        {group.teachers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Users2 className="h-3.5 w-3.5" />
              Docentes investigadores
              <span className="text-xs font-normal text-muted-foreground">({group.teachers.length})</span>
            </h4>
            <div className="space-y-1">
              {group.teachers.map((t) => (
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
                  roleLabel={t.role !== "investigador" ? t.role : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Estudiantes ── */}
        {group.students.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Estudiantes
              <span className="text-xs font-normal text-muted-foreground">({group.students.length})</span>
            </h4>
            <div className="space-y-1">
              {group.students.map((s) => (
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

        {!group.leader && group.teachers.length === 0 && group.students.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground italic">
            Este grupo aún no tiene integrantes asignados
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSON ROW (reutilizable dentro del dialog)
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Microscope className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">Aún no hay grupos registrados</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Los grupos de investigación aparecerán aquí una vez que se publiquen.
      </p>
    </div>
  );
}
