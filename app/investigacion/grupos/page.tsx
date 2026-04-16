import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { GroupsGrid } from "./_components/GroupsGrid";
import type { GroupCardData } from "./_components/GroupsGrid";

// ═══════════════════════════════════════════════════════════════════════════════
// GRUPOS DE INVESTIGACIÓN (página pública)
// Data de: research_groups + teachers (líder, miembros) + students (miembros)
// Grid de cards con dialog expandible al hacer click (similar a Research lines).
// ═══════════════════════════════════════════════════════════════════════════════

export default async function GruposPage() {
  const groups = await prisma.researchGroup.findMany({
    where: { ...notDeleted, published: true },
    include: {
      leader: { select: { id: true, name: true, avatarUrl: true, category: true, degree: true } },
      researchLine: { select: { id: true, title: true } },
      members: {
        where: { active: true },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              category: true,
              employmentType: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      students: {
        where: { active: true, student: { ...notDeleted, published: true } },
        include: {
          student: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  // Mapeo a DTO plano para el client component
  const data: GroupCardData[] = groups.map((g) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    description: g.description,
    websiteUrl: g.websiteUrl,
    status: g.status,
    researchLine: g.researchLine ? { id: g.researchLine.id, title: g.researchLine.title } : null,
    leader: g.leader
      ? {
          id: g.leader.id,
          name: g.leader.name,
          avatarUrl: g.leader.avatarUrl,
          category: g.leader.category,
          degree: g.leader.degree,
        }
      : null,
    teachers: g.members.map((m) => ({
      id: m.teacher.id,
      name: m.teacher.name,
      avatarUrl: m.teacher.avatarUrl,
      category: m.teacher.category,
      employmentType: m.teacher.employmentType,
      role: m.role,
    })),
    students: g.students.map((s) => ({
      id: s.student.id,
      name: s.student.user.name,
      avatarUrl: s.student.user.avatarUrl,
      universityCode: s.student.universityCode,
      program: s.student.program,
      role: s.role,
    })),
  }));

  return (
    <SectionPage
      parent="investigacion"
      title="Grupos de Investigación"
      description="Laboratorios y equipos de investigación de FINESI."
      variant="clean"
    >
      <GroupsGrid groups={data} />
    </SectionPage>
  );
}
