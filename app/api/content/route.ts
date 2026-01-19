import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/content - Listar todas las secciones de contenido
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "";

    // Construir filtros
    const where: Record<string, unknown> = {
      ...notDeleted,
    };

    if (section) {
      where.section = section;
    }

    const content = await prisma.siteContent.findMany({
      where,
      orderBy: [{ section: "asc" }, { key: "asc" }],
    });

    // Agrupar por sección
    const grouped = content.reduce(
      (acc, item) => {
        if (!acc[item.section]) {
          acc[item.section] = {};
        }
        acc[item.section][item.key] = {
          id: item.id,
          value: item.value,
          type: item.type,
        };
        return acc;
      },
      {} as Record<string, Record<string, { id: string; value: string; type: string }>>
    );

    return NextResponse.json({ data: grouped });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Error al obtener contenido" },
      { status: 500 }
    );
  }
}

// POST /api/content - Crear o actualizar múltiples contenidos (batch upsert)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body as {
      items: Array<{
        section: string;
        key: string;
        value: string;
        type?: string;
      }>;
    };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Se requiere un array de items" },
        { status: 400 }
      );
    }

    // Batch upsert
    const results = await Promise.all(
      items.map((item) =>
        prisma.siteContent.upsert({
          where: {
            section_key: {
              section: item.section,
              key: item.key,
            },
          },
          update: {
            value: item.value,
            type: item.type || "text",
          },
          create: {
            section: item.section,
            key: item.key,
            value: item.value,
            type: item.type || "text",
          },
        })
      )
    );

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Error al guardar contenido" },
      { status: 500 }
    );
  }
}
