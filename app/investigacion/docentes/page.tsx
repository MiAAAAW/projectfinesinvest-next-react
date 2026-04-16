import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { TeachersExplorer, type TeacherCardData } from "./_components/TeachersExplorer";

// ═══════════════════════════════════════════════════════════════════════════════
// DOCENTES FINESI — página pública
// Server: fetch docentes con counters de publicaciones/tesis/formaciones.
// Client: explorer con búsqueda y filtros (RENACYT, con publicaciones).
// ═══════════════════════════════════════════════════════════════════════════════

export default async function DocentesPage() {
  const teachers = await prisma.teacher.findMany({
    where: { ...notDeleted, published: true },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      gaussSlug: true,
      academicTitle: true,
      degree: true,
      specialty: true,
      avatarUrl: true,
      isRenacyt: true,
      renacytLevel: true,
      bio: true,
      _count: {
        select: {
          publicationAuthors: { where: { publication: { ...notDeleted, published: true } } },
          thesisSupervisions: true,
          formations: true,
        },
      },
    },
  });

  const data: TeacherCardData[] = teachers.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.gaussSlug ?? t.id,
    academicTitle: t.academicTitle,
    degree: t.degree,
    specialty: t.specialty,
    avatarUrl: t.avatarUrl,
    isRenacyt: t.isRenacyt,
    renacytLevel: t.renacytLevel,
    bioSnippet: t.bio ? t.bio.slice(0, 140) : null,
    publicationsCount: t._count.publicationAuthors,
    thesisCount: t._count.thesisSupervisions,
    formationsCount: t._count.formations,
  }));

  return (
    <SectionPage
      parent="investigacion"
      title="Docentes"
      description="Plana docente e investigadores de la Facultad de Ingeniería Estadística e Informática."
      variant="clean"
    >
      <TeachersExplorer teachers={data} />
    </SectionPage>
  );
}
