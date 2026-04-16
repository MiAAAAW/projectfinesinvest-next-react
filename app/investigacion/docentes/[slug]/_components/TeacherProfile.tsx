import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  ExternalLink,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  Languages,
  FileText,
  Globe,
  Linkedin,
  Hash,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER PROFILE — vista detallada minimalista
// Recibe un Teacher con relations desde el server. Renderiza cada sección
// condicionalmente (solo si hay datos).
// ═══════════════════════════════════════════════════════════════════════════════

type Formation = {
  id: string;
  degreeType: string | null;
  degreeName: string;
  institution: string | null;
  country: string | null;
  graduationYear: number | null;
  startYear: number | null;
};

type WorkExperience = {
  id: string;
  institution: string;
  position: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
};

type Thesis = {
  id: string;
  thesisTitle: string;
  studentName: string | null;
  thesisType: string | null;
  role: string | null;
  university: string | null;
  acceptanceDate: Date | null;
  repositoryUrl: string | null;
};

type Distinction = {
  id: string;
  name: string;
  grantingInstitution: string | null;
  description: string | null;
  awardYear: number | null;
};

type Language = {
  id: string;
  language: string;
  readingLevel: string | null;
  writingLevel: string | null;
  speakingLevel: string | null;
  listeningLevel: string | null;
  isNative: boolean;
};

type PublicationAuthor = {
  publication: {
    id: string;
    title: string;
    journal: string | null;
    year: number;
    type: string;
    doi: string | null;
    indexedIn: string | null;
  };
};

type Group = { id: string; name: string; status: string };
type MemberGroup = { group: Group };

interface Teacher {
  id: string;
  name: string;
  avatarUrl: string | null;
  academicTitle: string | null;
  degree: string | null;
  specialty: string | null;
  bio: string | null;
  orcid: string | null;
  googleScholar: string | null;
  researchGate: string | null;
  linkedin: string | null;
  personalWebsite: string | null;
  ctiVitaeUrl: string | null;
  isRenacyt: boolean;
  renacytLevel: string | null;
  hindex: number | null;
  formations: Formation[];
  workExperiences: WorkExperience[];
  thesisSupervisions: Thesis[];
  distinctions: Distinction[];
  languages: Language[];
  publicationAuthors: PublicationAuthor[];
  researchGroupMembers: MemberGroup[];
  ledGroups: Group[];
}

export function TeacherProfile({ teacher: t }: { teacher: Teacher }) {
  const allGroups = [
    ...t.ledGroups.map((g) => ({ ...g, role: "Líder" as const })),
    ...t.researchGroupMembers.map((m) => ({ ...m.group, role: "Miembro" as const })),
  ];

  return (
    <div className="space-y-10">
      {/* ═══ HERO ═══ */}
      <header className="flex flex-col sm:flex-row gap-6 items-start -mt-6">
        <Avatar name={t.name} avatarUrl={t.avatarUrl} size="lg" />

        <div className="flex-1 min-w-0 space-y-3">
          {t.academicTitle && (
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
              {t.academicTitle}
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {t.isRenacyt && (
              <Badge variant="secondary" className="gap-1 text-[11px]">
                <BadgeCheck className="h-3 w-3 text-primary" />
                RENACYT
                {t.renacytLevel && <span className="font-mono">· {t.renacytLevel}</span>}
              </Badge>
            )}
            {t.hindex != null && (
              <Badge variant="outline" className="gap-1 text-[11px]">
                <Hash className="h-3 w-3" />
                h-index {t.hindex}
              </Badge>
            )}
            {t.degree && !t.academicTitle && (
              <Badge variant="outline" className="text-[11px]">{t.degree}</Badge>
            )}
            {t.specialty && <span className="text-xs text-muted-foreground">{t.specialty}</span>}
          </div>

          {/* Action links — solo si la URL es real (http/https + dominio) */}
          <div className="flex flex-wrap gap-2 pt-1">
            {isRealUrl(t.ctiVitaeUrl) && (
              <ActionLink href={t.ctiVitaeUrl!} icon={ExternalLink} label="CTI Vitae" primary />
            )}
            {t.orcid && (
              <ActionLink href={`https://orcid.org/${t.orcid}`} icon={ExternalLink} label="ORCID" />
            )}
            {isRealUrl(t.googleScholar) && (
              <ActionLink href={t.googleScholar!} icon={ExternalLink} label="Scholar" />
            )}
            {isRealUrl(t.researchGate) && (
              <ActionLink href={t.researchGate!} icon={ExternalLink} label="ResearchGate" />
            )}
            {isRealUrl(t.linkedin) && (
              <ActionLink href={t.linkedin!} icon={Linkedin} label="LinkedIn" />
            )}
            {isRealUrl(t.personalWebsite) && (
              <ActionLink href={t.personalWebsite!} icon={Globe} label="Web personal" />
            )}
          </div>
        </div>
      </header>

      {/* ═══ BIO ═══ */}
      {t.bio && (
        <Section title="Biografía">
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{t.bio}</p>
        </Section>
      )}

      {/* ═══ GRUPOS ═══ */}
      {allGroups.length > 0 && (
        <Section icon={Users} title="Grupos de investigación">
          <ul className="flex flex-wrap gap-2">
            {allGroups.map((g, i) => (
              <li key={`${g.id}-${i}`}>
                <Link
                  href={`/investigacion/grupos#${g.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs hover:border-primary/40 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{g.name}</span>
                  <span className="text-[10px] text-muted-foreground">· {g.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ═══ EDUCACIÓN ═══ */}
      {t.formations.length > 0 && (
        <Section icon={GraduationCap} title="Educación" count={t.formations.length}>
          <ul className="space-y-3">
            {t.formations.map((f) => (
              <li key={f.id} className="flex gap-3 text-sm">
                <YearCol start={f.startYear} end={f.graduationYear} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{f.degreeName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[f.institution, f.country].filter(Boolean).join(" · ")}
                  </p>
                  {f.degreeType && (
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {f.degreeType}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ═══ EXPERIENCIA ═══ */}
      {t.workExperiences.length > 0 && (
        <Section icon={Briefcase} title="Experiencia laboral" count={t.workExperiences.length}>
          <ul className="space-y-3">
            {t.workExperiences.map((w) => (
              <li key={w.id} className="flex gap-3 text-sm">
                <YearCol start={yearOf(w.startDate)} end={w.isCurrent ? null : yearOf(w.endDate)} current={w.isCurrent} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{w.institution}</p>
                  {(w.position || w.description) && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {[w.position, w.description].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ═══ PUBLICACIONES RECIENTES ═══ */}
      {t.publicationAuthors.length > 0 && (
        <Section icon={FileText} title="Publicaciones recientes" count={t.publicationAuthors.length}>
          <ul className="space-y-3">
            {t.publicationAuthors.map((pa) => {
              const p = pa.publication;
              return (
                <li key={p.id} className="text-sm">
                  <p className="font-medium leading-snug line-clamp-2">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {[p.journal, p.year, p.indexedIn].filter(Boolean).join(" · ")}
                  </p>
                  {p.doi && (
                    <a
                      href={`https://doi.org/${p.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1 font-mono"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      {p.doi}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
            <Link
              href={`/investigacion/publicaciones`}
              className="text-primary hover:underline"
            >
              Ver todas las publicaciones →
            </Link>
          </p>
        </Section>
      )}

      {/* ═══ TESIS DIRIGIDAS ═══ */}
      {t.thesisSupervisions.length > 0 && (
        <ThesisSection thesis={t.thesisSupervisions} />
      )}

      {/* ═══ DISTINCIONES ═══ */}
      {t.distinctions.length > 0 && (
        <Section icon={Award} title="Distinciones" count={t.distinctions.length}>
          <ul className="space-y-3">
            {t.distinctions.map((d) => (
              <li key={d.id} className="flex gap-3 text-sm">
                <YearCol single={d.awardYear} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">{d.name}</p>
                  {d.grantingInstitution && (
                    <p className="text-xs text-muted-foreground mt-0.5">{d.grantingInstitution}</p>
                  )}
                  {d.description && <p className="text-xs text-muted-foreground mt-1">{d.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ═══ IDIOMAS ═══ */}
      {t.languages.length > 0 && (
        <Section icon={Languages} title="Idiomas" count={t.languages.length}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {t.languages.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm">
                <span className="font-medium capitalize">{l.language.toLowerCase()}</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {[l.readingLevel && `L:${abbr(l.readingLevel)}`, l.writingLevel && `E:${abbr(l.writingLevel)}`, l.speakingLevel && `H:${abbr(l.speakingLevel)}`]
                    .filter(Boolean)
                    .join(" ")}
                  {l.isNative && " · nativo"}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESIS SECTION — con colapsable (pueden ser hasta 65)
// ═══════════════════════════════════════════════════════════════════════════════

function ThesisSection({ thesis }: { thesis: Thesis[] }) {
  const visible = thesis.slice(0, 8);
  const rest = thesis.slice(8);

  return (
    <Section icon={BookOpen} title="Tesis dirigidas" count={thesis.length}>
      <ul className="space-y-3">
        {visible.map((s) => (
          <ThesisItem key={s.id} s={s} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs text-primary hover:underline select-none list-none">
            <span className="group-open:hidden">Ver {rest.length} tesis más ▾</span>
            <span className="hidden group-open:inline">Ocultar ▴</span>
          </summary>
          <ul className="space-y-3 mt-3">
            {rest.map((s) => (
              <ThesisItem key={s.id} s={s} />
            ))}
          </ul>
        </details>
      )}
    </Section>
  );
}

function ThesisItem({ s }: { s: Thesis }) {
  return (
    <li className="flex gap-3 text-sm">
      <YearCol single={yearOf(s.acceptanceDate)} />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug line-clamp-2">{s.thesisTitle}</p>
        {s.studentName && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            <span className="font-semibold">Tesista:</span> {s.studentName}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          {s.role && <span>{s.role}</span>}
          {s.thesisType && <span>· {s.thesisType}</span>}
        </div>
        {isRealUrl(s.repositoryUrl) && (
          <a
            href={s.repositoryUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            Repositorio
          </a>
        )}
      </div>
    </li>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS / SHARED UI
// ═══════════════════════════════════════════════════════════════════════════════

function Section({
  title,
  count,
  icon: Icon,
  children,
}: {
  title: string;
  count?: number;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold text-foreground/80 mb-4 pb-2 border-b">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{title}</span>
        {count != null && (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">{count}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
        primary
          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

function YearCol({
  start,
  end,
  single,
  current,
}: {
  start?: number | null;
  end?: number | null;
  single?: number | null;
  current?: boolean;
}) {
  if (single !== undefined) {
    return (
      <div className="w-12 shrink-0 text-right">
        <span className="text-xs font-mono text-muted-foreground">{single ?? "—"}</span>
      </div>
    );
  }
  return (
    <div className="w-16 shrink-0 text-right pt-0.5">
      <span className="text-xs font-mono text-muted-foreground leading-none block">
        {start ?? "—"}
      </span>
      <span className="text-[10px] font-mono text-muted-foreground/60 leading-none block mt-0.5">
        {current ? "actual" : end ?? ""}
      </span>
    </div>
  );
}

function Avatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl: string | null;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-24 w-24 text-xl" : "h-10 w-10 text-xs";
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
        className={cn("rounded-full object-cover shrink-0 border bg-muted", dim)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 border border-primary/20",
        dim
      )}
    >
      {initials}
    </div>
  );
}

function yearOf(d: Date | null) {
  if (!d) return null;
  const y = new Date(d).getFullYear();
  return Number.isFinite(y) ? y : null;
}

// Valida que sea URL real: http(s):// + dominio con al menos 1 letra
function isRealUrl(value: string | null | undefined): value is string {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^https?:\/\/[a-z0-9]/i.test(trimmed);
}

function abbr(level: string): string {
  const map: Record<string, string> = {
    BASICO: "Ba",
    INTERMEDIO: "In",
    AVANZADO: "Av",
    "BÁSICO": "Ba",
  };
  return map[level.toUpperCase()] ?? level.slice(0, 2);
}
