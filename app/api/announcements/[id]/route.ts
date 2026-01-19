import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para actualizar anuncio
const updateAnnouncementSchema = z.object({
  title: z.string().min(1, "Título requerido").optional(),
  content: z.string().min(1, "Contenido requerido").optional(),
  excerpt: z.string().optional().nullable(),
  type: z.string().min(1, "Tipo requerido").optional(),
  icon: z.string().optional(),
  important: z.boolean().optional(),
  published: z.boolean().optional(),
  date: z.string().optional(),
  href: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/announcements/[id] - Obtener anuncio por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        ...notDeleted,
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: announcement });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Error al obtener anuncio" },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/[id] - Actualizar anuncio
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
    const result = updateAnnouncementSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existing = await prisma.announcement.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    const data = result.data;

    // Actualizar anuncio
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.type && { type: data.type }),
        ...(data.icon && { icon: data.icon }),
        ...(data.important !== undefined && { important: data.important }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.href !== undefined && { href: data.href }),
      },
    });

    return NextResponse.json({ data: announcement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Error al actualizar anuncio" },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements/[id] - Eliminar anuncio (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.announcement.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Anuncio eliminado" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Error al eliminar anuncio" },
      { status: 500 }
    );
  }
}
