import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { PostersGrid, type PosterDTO } from "./_components/PostersGrid";

// ═══════════════════════════════════════════════════════════════════════════════
// POSTERS FINESI · página pública
// Header editable (site_content, section="posters") + lista de Documents
// con category="posters". Grid con visor PDF optimizado (PdfSnippetViewer).
// ═══════════════════════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const POSTERS_CATEGORY = "posters";

export default async function PostersPage() {
  const [contents, posters] = await Promise.all([
    prisma.siteContent.findMany({
      where: { ...notDeleted, section: "posters" },
    }),
    prisma.document.findMany({
      where: { ...notDeleted, published: true, category: POSTERS_CATEGORY },
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

  const content: Record<string, string> = {};
  for (const c of contents) content[c.key] = c.value;

  const data: PosterDTO[] = posters.map((p) => ({
    id: p.id,
    title: p.title,
    fileUrl: p.fileUrl,
    fileSize: p.fileSize,
    fileType: p.fileType,
  }));

  return (
    <SectionPage
      parent="investigacion"
      title={content.title || "Posters FINESI"}
      description={
        content.description ||
        "Reconocimientos a posters presentados por estudiantes y docentes de la FINESI."
      }
      variant="clean"
    >
      <PostersGrid posters={data} />
    </SectionPage>
  );
}
