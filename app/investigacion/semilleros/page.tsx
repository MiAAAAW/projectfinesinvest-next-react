import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { SemillerosGrid } from "./_components/SemillerosGrid";
import type { SemilleroCardData } from "./_components/SemillerosGrid";
import { NormativaSheet } from "./_components/NormativaSheet";
import type { NormativaDoc } from "./_components/NormativaSheet";

const NORMATIVA_CATEGORY = "semilleros-normativa";

// ═══════════════════════════════════════════════════════════════════════════════
// SEMILLEROS (página pública)
// Patrón idéntico a Grupos: cards grid + dialog expandible.
// Líneas UNAP como texto libre (multilinea) → badges/chips.
// Sheet lateral `NormativaSheet` muestra RR relacionadas bajo demanda.
// ═══════════════════════════════════════════════════════════════════════════════

function parseLines(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function SemillerosPage() {
  const [semilleros, normativaRaw] = await Promise.all([
    prisma.semillero.findMany({
      where: { ...notDeleted, published: true },
      include: {
        advisor: {
          select: { id: true, name: true, avatarUrl: true, category: true, degree: true },
        },
        teachers: {
          where: { active: true },
          include: {
            teacher: {
              select: { id: true, name: true, avatarUrl: true, category: true, employmentType: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        students: {
          where: { active: true, student: { ...notDeleted, published: true } },
          include: {
            student: {
              include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.document.findMany({
      where: { ...notDeleted, published: true, category: NORMATIVA_CATEGORY },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileSize: true,
        fileType: true,
      },
    }),
  ]);

  const data: SemilleroCardData[] = semilleros.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    status: s.status,
    researchLines: parseLines(s.researchLinesText),
    responsable: s.advisor
      ? {
          id: s.advisor.id,
          name: s.advisor.name,
          avatarUrl: s.advisor.avatarUrl,
          category: s.advisor.category,
          degree: s.advisor.degree,
        }
      : null,
    coAdvisors: s.teachers.map((t) => ({
      id: t.teacher.id,
      name: t.teacher.name,
      avatarUrl: t.teacher.avatarUrl,
      category: t.teacher.category,
      employmentType: t.teacher.employmentType,
      role: t.role,
    })),
    students: s.students.map((x) => ({
      id: x.student.id,
      name: x.student.user.name,
      avatarUrl: x.student.user.avatarUrl,
      universityCode: x.student.universityCode,
      program: x.student.program,
      role: x.role,
    })),
  }));

  const normativa: NormativaDoc[] = normativaRaw.map((d) => ({
    id: d.id,
    title: d.title,
    fileUrl: d.fileUrl,
    fileSize: d.fileSize,
    fileType: d.fileType,
  }));

  return (
    <SectionPage
      parent="investigacion"
      title="Semilleros de Investigación"
      description="Espacios formativos a nivel universitario (UNAP)."
      variant="clean"
    >
      {/* Botón centrado + Sheet lateral con la normativa — renderiza arriba del grid */}
      <NormativaSheet items={normativa} />
      <SemillerosGrid semilleros={data} />
    </SectionPage>
  );
}
