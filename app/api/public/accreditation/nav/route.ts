import { NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: /api/public/accreditation/nav
// Retorna standards + categorías (para dropdown del Navbar).
// Shape compatible con NavItem[]:
//   [{ label, href, children?: [{ label, href }] }]
// ═══════════════════════════════════════════════════════════════════════════════

interface NavResponseItem {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}

export async function GET() {
  try {
    const standards = await prisma.accreditationStandard.findMany({
      where: { ...notDeleted, published: true },
      orderBy: [{ order: "asc" }, { code: "asc" }],
      include: {
        subEvidences: {
          where: { ...notDeleted, published: true },
          select: { category: true },
        },
      },
    });

    const items: NavResponseItem[] = standards.map((s) => {
      // Categorías únicas preservando orden de aparición
      const seen = new Set<string>();
      const cats: string[] = [];
      for (const se of s.subEvidences) {
        if (!seen.has(se.category)) {
          seen.add(se.category);
          cats.push(se.category);
        }
      }

      const children =
        cats.length > 1
          ? cats.map((cat) => ({
              label: cat,
              href: `/acreditacion#std-${s.code}-${encodeURIComponent(cat)}`,
            }))
          : undefined;

      return {
        label: s.name,
        href: `/acreditacion#std-${s.code}`,
        children,
      };
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("Error building accreditation nav:", error);
    return NextResponse.json({ data: [] });
  }
}
