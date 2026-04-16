import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { ResolutionsExplorer, type ResolutionItem } from "../_components/ResolutionsExplorer";

// ═══════════════════════════════════════════════════════════════════════════════
// RESOLUCIONES RECTORALES · página pública
// Header (title/description/content) customizable desde admin → site_content.
// ═══════════════════════════════════════════════════════════════════════════════

export default async function ResolucionesRectoralesPage() {
  const [resolutions, contents] = await Promise.all([
    prisma.resolution.findMany({
      where: { ...notDeleted, published: true, type: "rectoral" },
      orderBy: { date: "desc" },
      select: {
        id: true, number: true, subject: true, date: true,
        year: true, fileUrl: true, fileSize: true,
      },
    }),
    prisma.siteContent.findMany({
      where: { ...notDeleted, section: "resoluciones-rectorales" },
    }),
  ]);

  const content: Record<string, string> = {};
  for (const c of contents) content[c.key] = c.value;

  const data: ResolutionItem[] = resolutions.map((r) => ({
    id: r.id,
    number: r.number,
    subject: r.subject,
    date: r.date ? r.date.toISOString() : null,
    year: r.year ?? null,
    fileUrl: r.fileUrl,
    fileSize: r.fileSize,
  }));

  return (
    <SectionPage
      parent="resoluciones"
      title={content.title || "Resoluciones Rectorales"}
      description={content.description || "Resoluciones emitidas por el Rectorado de la UNA Puno."}
      variant="clean"
    >
      {content.content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-muted-foreground mb-8">
          {content.content}
        </div>
      )}
      <ResolutionsExplorer
        resolutions={data}
        emptyLabel="No hay resoluciones rectorales publicadas."
      />
    </SectionPage>
  );
}
