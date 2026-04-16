import { notFound } from "next/navigation";
import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { siteNav } from "@/config/site-nav";
import { TeacherProfile } from "./_components/TeacherProfile";

// ═══════════════════════════════════════════════════════════════════════════════
// PERFIL DE DOCENTE — ruta pública
// URL: /investigacion/docentes/[slug]
// Resuelve por `gaussSlug` primero, luego fallback a `id` (cuid) por si algún
// docente no tiene slug de Gauss aún.
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateStaticParams() {
  const teachers = await prisma.teacher.findMany({
    where: { ...notDeleted, published: true },
    select: { id: true, gaussSlug: true },
  });
  return teachers.map((t) => ({ slug: t.gaussSlug ?? t.id }));
}

async function fetchTeacher(slug: string) {
  const teacher = await prisma.teacher.findFirst({
    where: {
      ...notDeleted,
      published: true,
      OR: [{ gaussSlug: slug }, { id: slug }],
    },
    include: {
      formations: { orderBy: [{ graduationYear: "desc" }, { displayOrder: "asc" }] },
      workExperiences: {
        orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }, { displayOrder: "asc" }],
      },
      thesisSupervisions: { orderBy: [{ acceptanceDate: "desc" }, { displayOrder: "asc" }] },
      distinctions: { orderBy: [{ awardYear: "desc" }, { displayOrder: "asc" }] },
      languages: { orderBy: { displayOrder: "asc" } },
      publicationAuthors: {
        include: {
          publication: {
            select: {
              id: true,
              title: true,
              journal: true,
              year: true,
              type: true,
              doi: true,
              indexedIn: true,
            },
          },
        },
        where: { publication: { ...notDeleted, published: true } },
        orderBy: { publication: { year: "desc" } },
        take: 10,
      },
      researchGroupMembers: {
        where: { active: true },
        include: { group: { select: { id: true, name: true, status: true } } },
      },
      ledGroups: {
        where: { ...notDeleted },
        select: { id: true, name: true, status: true },
      },
    },
  });
  return teacher;
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await fetchTeacher(slug);
  if (!teacher) notFound();

  const breadcrumb = [
    { label: siteNav.home.label, href: siteNav.home.path },
    { label: siteNav.sections.investigacion.label, href: siteNav.sections.investigacion.path },
    { label: "Docentes", href: "/investigacion/docentes" },
    { label: teacher.name },
  ];

  return (
    <SectionPage title={teacher.name} variant="clean" breadcrumb={breadcrumb}>
      <TeacherProfile teacher={teacher} />
    </SectionPage>
  );
}
