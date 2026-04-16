import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { PdfSnippetViewer } from "@/components/ui/pdf-snippet-viewer";
import { FileText, ExternalLink } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTICA EN INVESTIGACIÓN
// Contenido editable desde admin (tabla site_content, section="etica").
// Si hay `pdfDocumentId`, resuelve el Document (notDeleted + published) y
// embebe el PDF. Si el Document fue borrado, la sección simplemente no aparece.
// ═══════════════════════════════════════════════════════════════════════════════

function isRealUrl(v: string | null | undefined): v is string {
  return !!v && /^https?:\/\/[a-z0-9]/i.test(v.trim());
}

export default async function EticaPage() {
  const contents = await prisma.siteContent.findMany({
    where: { ...notDeleted, section: "etica" },
  });

  const data: Record<string, string> = {};
  for (const c of contents) {
    data[c.key] = c.value;
  }

  // Resolver PDF Document si existe la referencia
  let pdfDoc: { id: string; title: string; fileUrl: string } | null = null;
  if (data.pdfDocumentId) {
    const doc = await prisma.document.findFirst({
      where: { id: data.pdfDocumentId, ...notDeleted, published: true },
      select: { id: true, title: true, fileUrl: true },
    });
    if (doc && isRealUrl(doc.fileUrl)) pdfDoc = doc;
  }

  const title = data.title || "Ética en Investigación";
  const description = data.description || undefined;
  const hasAnyContent =
    data.content || data.comiteTitle || data.normativas || data.contacto || pdfDoc;

  return (
    <SectionPage
      parent="investigacion"
      title={title}
      description={description}
      variant="clean"
    >
      {data.content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap mb-12">
          {data.content}
        </div>
      )}

      {data.comiteTitle && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">{data.comiteTitle}</h2>
          {data.comiteContent && (
            <div className="text-muted-foreground whitespace-pre-wrap">{data.comiteContent}</div>
          )}
        </section>
      )}

      {data.normativas && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Normativas</h2>
          <div className="text-muted-foreground whitespace-pre-wrap">{data.normativas}</div>
        </section>
      )}

      {/* PDF embebido — solo si el Document existe (no borrado) */}
      {pdfDoc && (
        <section className="mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              {pdfDoc.title}
            </h2>
            <a
              href={pdfDoc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir en nueva pestaña
            </a>
          </div>
          <div className="rounded-lg border bg-card overflow-hidden h-[70vh] min-h-[500px]">
            <PdfSnippetViewer src={pdfDoc.fileUrl} className="w-full h-full" />
          </div>
        </section>
      )}

      {data.contacto && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Contacto</h2>
          <div className="text-muted-foreground whitespace-pre-wrap">{data.contacto}</div>
        </section>
      )}

      {!hasAnyContent && (
        <p className="text-muted-foreground text-center py-12">
          No hay contenido disponible aún.
        </p>
      )}
    </SectionPage>
  );
}
