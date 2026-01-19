import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para actualizar contenido de sección
const updateSectionSchema = z.record(
  z.string(),
  z.object({
    value: z.string(),
    type: z.enum(["text", "image", "json"]).default("text"),
  })
);

interface RouteParams {
  params: Promise<{ section: string }>;
}

// GET /api/content/[section] - Obtener contenido de una sección
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { section } = await params;

    const content = await prisma.siteContent.findMany({
      where: {
        section,
        ...notDeleted,
      },
      orderBy: { key: "asc" },
    });

    // Convertir a objeto key-value
    const data = content.reduce(
      (acc, item) => {
        acc[item.key] = {
          id: item.id,
          value: item.value,
          type: item.type,
        };
        return acc;
      },
      {} as Record<string, { id: string; value: string; type: string }>
    );

    return NextResponse.json({ data, section });
  } catch (error) {
    console.error("Error fetching section content:", error);
    return NextResponse.json(
      { error: "Error al obtener contenido de la sección" },
      { status: 500 }
    );
  }
}

// PUT /api/content/[section] - Actualizar contenido de una sección
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { section } = await params;
    const body = await request.json();

    // Validar datos
    const result = updateSectionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Formato de datos inválido" },
        { status: 400 }
      );
    }

    const data = result.data;

    // Upsert cada key del contenido
    const updates = await Promise.all(
      Object.entries(data).map(([key, { value, type }]) =>
        prisma.siteContent.upsert({
          where: {
            section_key: { section, key },
          },
          update: { value, type },
          create: { section, key, value, type },
        })
      )
    );

    return NextResponse.json({
      data: updates,
      message: "Contenido actualizado",
    });
  } catch (error) {
    console.error("Error updating section content:", error);
    return NextResponse.json(
      { error: "Error al actualizar contenido" },
      { status: 500 }
    );
  }
}

// DELETE /api/content/[section] - Eliminar toda una sección (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { section } = await params;

    // Soft delete de todos los contenidos de la sección
    await prisma.siteContent.updateMany({
      where: { section, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Sección eliminada" });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Error al eliminar sección" },
      { status: 500 }
    );
  }
}
