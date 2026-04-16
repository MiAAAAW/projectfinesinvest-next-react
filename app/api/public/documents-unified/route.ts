import { NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: /api/public/documents-unified
// Unifica en una sola respuesta: documents + resolutions + agreements
// Solo publicados, ordenados por más recientes
// Formato común para el Centro de Documentos del landing
// ═══════════════════════════════════════════════════════════════════════════════

export interface UnifiedDocument {
  id: string;                    // "document:abc123" | "resolution:xyz" | "agreement:123"
  source: "document" | "resolution" | "agreement";
  sourceId: string;              // ID real del registro
  title: string;
  subtitle?: string | null;      // descripción / asunto / institución
  fileUrl: string;
  fileSize?: string | null;
  category: string;              // categoría para filtrar
  categoryLabel: string;         // label amigable
  date?: string | null;          // fecha relevante
  metadata?: Record<string, unknown>;
}

const CATEGORY_LABELS: Record<string, string> = {
  // Documents
  reglamentos: "Reglamentos",
  formatos: "Formatos",
  manuales: "Manuales",
  investigacion: "Investigación",
  etica: "Ética",
  acreditacion: "Acreditación",
  posgrado: "Posgrado",
  // Resolutions
  "resoluciones-decanales": "Resoluciones Decanales",
  "resoluciones-rectorales": "Resoluciones Rectorales",
  // Agreements
  convenios: "Convenios",
};

export async function GET() {
  try {
    // Fetch paralelo de las 3 tablas
    const [documents, resolutions, agreements] = await Promise.all([
      prisma.document.findMany({
        where: { ...notDeleted, published: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.resolution.findMany({
        where: { ...notDeleted, published: true },
        orderBy: { date: "desc" },
      }),
      prisma.agreement.findMany({
        where: { ...notDeleted, published: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const unified: UnifiedDocument[] = [];

    // Mapear documents → unified
    for (const d of documents) {
      unified.push({
        id: `document:${d.id}`,
        source: "document",
        sourceId: d.id,
        title: d.title,
        subtitle: d.description,
        fileUrl: d.fileUrl,
        fileSize: d.fileSize,
        category: d.category,
        categoryLabel: CATEGORY_LABELS[d.category] ?? d.category,
        date: d.createdAt.toISOString(),
        metadata: {
          fileType: d.fileType,
          downloads: d.downloads,
        },
      });
    }

    // Mapear resolutions → unified
    for (const r of resolutions) {
      if (!r.fileUrl) continue; // solo las que tienen PDF
      const cat = r.type === "decanal" ? "resoluciones-decanales" : "resoluciones-rectorales";
      unified.push({
        id: `resolution:${r.id}`,
        source: "resolution",
        sourceId: r.id,
        title: `Resolución N.° ${r.number}`,
        subtitle: r.subject,
        fileUrl: r.fileUrl,
        fileSize: r.fileSize,
        category: cat,
        categoryLabel: CATEGORY_LABELS[cat],
        date: r.date?.toISOString() ?? null,
        metadata: {
          number: r.number,
          year: r.year,
          type: r.type,
        },
      });
    }

    // Mapear agreements → unified
    for (const a of agreements) {
      if (!a.fileUrl) continue; // solo los que tienen PDF
      unified.push({
        id: `agreement:${a.id}`,
        source: "agreement",
        sourceId: a.id,
        title: a.title,
        subtitle: a.institution + (a.country ? ` — ${a.country}` : ""),
        fileUrl: a.fileUrl,
        fileSize: null,
        category: "convenios",
        categoryLabel: CATEGORY_LABELS["convenios"],
        date: a.startDate?.toISOString() ?? a.createdAt.toISOString(),
        metadata: {
          institution: a.institution,
          country: a.country,
          type: a.type,
          status: a.status,
          logoUrl: a.logoUrl,
        },
      });
    }

    // Ordenar por fecha desc
    unified.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    // Categorías disponibles (solo las que tienen al menos un item)
    const availableCategories = Array.from(new Set(unified.map((u) => u.category)))
      .map((cat) => ({
        value: cat,
        label: CATEGORY_LABELS[cat] ?? cat,
        count: unified.filter((u) => u.category === cat).length,
      }));

    return NextResponse.json({
      data: unified,
      categories: availableCategories,
      total: unified.length,
    });
  } catch (error) {
    console.error("Error fetching unified documents:", error);
    return NextResponse.json(
      { error: "Error al obtener documentos" },
      { status: 500 }
    );
  }
}
