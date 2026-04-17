import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { AccreditationExplorer, type StandardDTO } from "./_components/AccreditationExplorer";
import { siteNav } from "@/config/site-nav";

// ═══════════════════════════════════════════════════════════════════════════════
// ACREDITACIÓN · página pública única (no hay subrutas)
// Server: fetch estándares + sub-evidencias + documents (category=acreditacion)
// Header editable desde admin via site_content[section="acreditacion"].
// Client: split-layout con accordion + visor PDF.
// ═══════════════════════════════════════════════════════════════════════════════

// force-dynamic: siempre consulta BD fresca. Tras subir PDF en admin se refleja de inmediato.
export const dynamic = "force-dynamic";

export default async function AcreditacionPage() {
  const [standards, contents] = await Promise.all([
    prisma.accreditationStandard.findMany({
      where: { ...notDeleted, published: true },
      orderBy: [{ order: "asc" }, { code: "asc" }],
      include: {
        subEvidences: {
          where: { ...notDeleted, published: true },
          orderBy: [{ order: "asc" }, { code: "asc" }],
          include: {
            documents: {
              where: { ...notDeleted, published: true, category: "acreditacion" },
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                title: true,
                fileUrl: true,
                fileSize: true,
                fileType: true,
              },
            },
          },
        },
      },
    }),
    prisma.siteContent.findMany({
      where: { ...notDeleted, section: "acreditacion" },
    }),
  ]);

  const content: Record<string, string> = {};
  for (const c of contents) content[c.key] = c.value;

  const data: StandardDTO[] = standards.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description,
    subEvidences: s.subEvidences.map((se) => ({
      id: se.id,
      code: se.code,
      name: se.name,
      category: se.category,
      documents: se.documents.map((d) => ({
        id: d.id,
        title: d.title,
        fileUrl: d.fileUrl,
        fileSize: d.fileSize,
        fileType: d.fileType,
      })),
    })),
  }));

  const breadcrumb = [
    { label: siteNav.home.label, href: siteNav.home.path },
    { label: "Acreditación" },
  ];

  return (
    <SectionPage
      title={content.title || "Acreditación"}
      description={
        content.description ||
        "Estándares, sub-evidencias y documentos del proceso de autoevaluación."
      }
      variant="clean"
      breadcrumb={breadcrumb}
      contentMaxWidth="max-w-none"
    >
      <AccreditationExplorer standards={data} />
    </SectionPage>
  );
}
