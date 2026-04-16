import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { PublicationsExplorer } from "./_components/PublicationsExplorer";
import type { PublicationDTO } from "./_components/PublicationsExplorer";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLICACIONES (página pública)
// Server: fetch publicaciones + autores con flag isFinesi.
// Client: explorer con filtros dinámicos (tipo, año, docente, búsqueda).
// Cero hardcode de opciones — todo viene de la data.
// ═══════════════════════════════════════════════════════════════════════════════

export default async function PublicacionesPage() {
  const publications = await prisma.publication.findMany({
    where: { ...notDeleted, published: true },
    include: {
      authors: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          teacherId: true,
          teacher: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  const data: PublicationDTO[] = publications.map((p) => ({
    id: p.id,
    title: p.title,
    journal: p.journal,
    year: p.year,
    volume: p.volume,
    issue: p.issue,
    pages: p.pages,
    doi: p.doi,
    url: p.url,
    type: p.type,
    indexedIn: p.indexedIn,
    abstract: p.abstract,
    authors: p.authors.map((a) => ({
      id: a.id,
      name: a.name,
      isFinesi: !!a.teacherId,
      teacherId: a.teacherId,
    })),
  }));

  return (
    <SectionPage
      parent="investigacion"
      title="Publicaciones"
      description="Producción científica de los docentes de FINESI."
      variant="clean"
    >
      <PublicationsExplorer publications={data} />
    </SectionPage>
  );
}
