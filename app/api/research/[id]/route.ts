import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para actualizar línea de investigación
const updateResearchLineSchema = z.object({
  title: z.string().min(1, "Título requerido").optional(),
  description: z.string().min(1, "Descripción requerida").optional(),
  icon: z.string().optional(),
  coordinator: z.string().optional().nullable(),
  members: z.number().optional().nullable(),
  href: z.string().optional().nullable(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/research/[id] - Obtener línea de investigación por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const researchLine = await prisma.researchLine.findFirst({
      where: {
        id,
        ...notDeleted,
      },
    });

    if (!researchLine) {
      return NextResponse.json(
        { error: "Línea de investigación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: researchLine });
  } catch (error) {
    console.error("Error fetching research line:", error);
    return NextResponse.json(
      { error: "Error al obtener línea de investigación" },
      { status: 500 }
    );
  }
}

// PUT /api/research/[id] - Actualizar línea de investigación
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validar datos
    const result = updateResearchLineSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existing = await prisma.researchLine.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Línea de investigación no encontrada" },
        { status: 404 }
      );
    }

    const data = result.data;

    // Actualizar línea de investigación
    const researchLine = await prisma.researchLine.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.icon && { icon: data.icon }),
        ...(data.coordinator !== undefined && { coordinator: data.coordinator }),
        ...(data.members !== undefined && { members: data.members }),
        ...(data.href !== undefined && { href: data.href }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json({ data: researchLine });
  } catch (error) {
    console.error("Error updating research line:", error);
    return NextResponse.json(
      { error: "Error al actualizar línea de investigación" },
      { status: 500 }
    );
  }
}

// DELETE /api/research/[id] - Eliminar línea de investigación (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.researchLine.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Línea de investigación no encontrada" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.researchLine.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Línea de investigación eliminada" });
  } catch (error) {
    console.error("Error deleting research line:", error);
    return NextResponse.json(
      { error: "Error al eliminar línea de investigación" },
      { status: 500 }
    );
  }
}
