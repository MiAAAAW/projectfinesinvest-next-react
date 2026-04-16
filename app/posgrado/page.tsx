import { prisma, notDeleted } from "@/lib/prisma";
import { SectionPage } from "@/components/layout/SectionPage";
import { siteNav } from "@/config/site-nav";
import {
  PosgradoExplorer,
  type ProgramDTO,
  type PosgradoLevelGroup,
} from "./_components/PosgradoExplorer";
import {
  POSGRADO_HEADER_SECTION,
  POSGRADO_INDEX_SECTION,
  POSGRADO_LEVELS,
  POSGRADO_PROGRAM_TEXT_KEYS,
  parseIndexCsv,
  type PosgradoLevel,
} from "@/lib/constants/posgrado";

// ═══════════════════════════════════════════════════════════════════════════════
// POSGRADO · página pública (multi-programa por nivel)
//
// Fuentes en site_content:
//   - POSGRADO_HEADER_SECTION  → header (title, description)
//   - POSGRADO_INDEX_SECTION   → keys `maestrias` / `doctorados` (CSV de sections)
//   - Cada programa           → su propia section con campos name/description/…/pdfDocumentId
// ═══════════════════════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

function isRealUrl(v: string | null | undefined): v is string {
  return !!v && /^https?:\/\/[a-z0-9]/i.test(v.trim());
}

async function resolveProgram(
  section: string,
  level: PosgradoLevel,
): Promise<ProgramDTO | null> {
  const rows = await prisma.siteContent.findMany({
    where: { ...notDeleted, section },
  });
  if (rows.length === 0) return null;

  const content: Record<string, string> = {};
  for (const r of rows) content[r.key] = r.value;

  // Si ningún campo significativo tiene valor, no mostrar el programa
  const hasAnyContent =
    POSGRADO_PROGRAM_TEXT_KEYS.some((k) => content[k]?.trim()) ||
    !!content.pdfDocumentId?.trim();
  if (!hasAnyContent) return null;

  let pdfDoc: ProgramDTO["pdfDoc"] = null;
  if (content.pdfDocumentId) {
    const doc = await prisma.document.findFirst({
      where: { id: content.pdfDocumentId, ...notDeleted, published: true },
      select: { id: true, title: true, fileUrl: true },
    });
    if (doc && isRealUrl(doc.fileUrl)) pdfDoc = doc;
  }

  return {
    section,
    level,
    name: content.name?.trim() || null,
    description: content.description?.trim() || null,
    content: content.content?.trim() || null,
    requisitos: content.requisitos?.trim() || null,
    contacto: content.contacto?.trim() || null,
    pdfDoc,
  };
}

async function fetchIndex(): Promise<Record<PosgradoLevel, string[]>> {
  const rows = await prisma.siteContent.findMany({
    where: { ...notDeleted, section: POSGRADO_INDEX_SECTION },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  const result: Record<PosgradoLevel, string[]> = { maestria: [], doctorado: [] };
  for (const lvl of POSGRADO_LEVELS) {
    result[lvl.key] = parseIndexCsv(map[lvl.indexKey]);
  }
  return result;
}

async function fetchHeader() {
  const rows = await prisma.siteContent.findMany({
    where: { ...notDeleted, section: POSGRADO_HEADER_SECTION },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export default async function PosgradoPage() {
  const [header, index] = await Promise.all([fetchHeader(), fetchIndex()]);

  // Resolver los programas de ambos niveles en paralelo, preservando orden
  const groups: PosgradoLevelGroup[] = await Promise.all(
    POSGRADO_LEVELS.map(async (lvl) => {
      const sections = index[lvl.key];
      const resolved = await Promise.all(
        sections.map((section) => resolveProgram(section, lvl.key)),
      );
      const programs = resolved.filter((p): p is ProgramDTO => p !== null);
      return {
        level: lvl.key,
        labelPlural: lvl.labelPlural,
        labelSingle: lvl.labelSingle,
        programs,
      };
    }),
  );

  const breadcrumb = [
    { label: siteNav.home.label, href: siteNav.home.path },
    { label: "Posgrado" },
  ];

  return (
    <SectionPage
      title={header.title || "Posgrado"}
      description={
        header.description ||
        "Programas de posgrado de FINESI — formación avanzada en ingeniería estadística e informática."
      }
      variant="clean"
      breadcrumb={breadcrumb}
    >
      <PosgradoExplorer groups={groups} />
    </SectionPage>
  );
}
