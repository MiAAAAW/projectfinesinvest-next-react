import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para actualizar imagen
const updateGalleryImageSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional().nullable(),
  event: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/gallery/[id] - Obtener imagen por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const image = await prisma.galleryImage.findFirst({
      where: {
        id,
        ...notDeleted,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: image });
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    return NextResponse.json(
      { error: "Error al obtener imagen" },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/[id] - Actualizar imagen
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
    const result = updateGalleryImageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existing = await prisma.galleryImage.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    const data = result.data;

    // Actualizar imagen
    const image = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(data.src && { src: data.src }),
        ...(data.alt && { alt: data.alt }),
        ...(data.caption !== undefined && { caption: data.caption }),
        ...(data.event !== undefined && { event: data.event }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date !== undefined && {
          date: data.date ? new Date(data.date) : null,
        }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json({ data: image });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { error: "Error al actualizar imagen" },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/[id] - Eliminar imagen (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.galleryImage.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.galleryImage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Imagen eliminada" });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { error: "Error al eliminar imagen" },
      { status: 500 }
    );
  }
}
