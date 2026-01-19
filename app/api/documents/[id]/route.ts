import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para actualizar documento
const updateDocumentSchema = z.object({
  title: z.string().min(1, "Título requerido").optional(),
  description: z.string().optional().nullable(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.string().optional().nullable(),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Obtener documento por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        ...notDeleted,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Error al obtener documento" },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Actualizar documento
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
    const result = updateDocumentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    const data = result.data;

    // Actualizar documento
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.fileUrl && { fileUrl: data.fileUrl }),
        ...(data.fileType && { fileType: data.fileType }),
        ...(data.fileSize !== undefined && { fileSize: data.fileSize }),
        ...(data.category && { category: data.category }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Error al actualizar documento" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Eliminar documento (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Documento eliminado" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Error al eliminar documento" },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id]/download - Incrementar contador de descargas
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, ...notDeleted },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Incrementar descargas
    const updated = await prisma.document.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating download count:", error);
    return NextResponse.json(
      { error: "Error al actualizar contador" },
      { status: 500 }
    );
  }
}
