import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { AgreementsExplorer, type AgreementItem } from "./_components/AgreementsExplorer";

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIOS · página pública
// Server: fetch agreements publicados + site_content[section=convenios] (título y
// descripción editables desde admin). Client: split-layout con visor PDF.
// ═══════════════════════════════════════════════════════════════════════════════

export default async function ConveniosPage() {
  const [agreements, contents] = await Promise.all([
    prisma.agreement.findMany({
      where: { ...notDeleted, published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, institution: true, country: true,
        type: true, status: true, description: true,
        fileUrl: true, logoUrl: true,
        startDate: true, endDate: true,
      },
    }),
    prisma.siteContent.findMany({
      where: { ...notDeleted, section: "convenios" },
    }),
  ]);

  const content: Record<string, string> = {};
  for (const c of contents) content[c.key] = c.value;

  const data: AgreementItem[] = agreements.map((a) => ({
    id: a.id,
    title: a.title,
    institution: a.institution,
    country: a.country,
    type: a.type,
    status: a.status,
    description: a.description,
    fileUrl: a.fileUrl,
    logoUrl: a.logoUrl,
    startDate: a.startDate ? a.startDate.toISOString() : null,
    endDate: a.endDate ? a.endDate.toISOString() : null,
  }));

  return (
    <SectionPage
      parent="convenios"
      title={content.title || "Convenios"}
      description={
        content.description ||
        "Convenios institucionales de FINESI con universidades, empresas y organizaciones."
      }
      variant="clean"
    >
      <AgreementsExplorer agreements={data} />
    </SectionPage>
  );
}
