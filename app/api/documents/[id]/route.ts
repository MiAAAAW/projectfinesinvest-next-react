import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDeleteWithR2 } from "@/lib/api-utils";

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

// GET /api/documents/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, ...notDeleted },
    });

    if (!document) return errorResponse("Documento no encontrado", 404);

    return successResponse(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return errorResponse("Error al obtener documento");
  }
}

// PUT /api/documents/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateDocumentSchema);
    if (validation.error) return validation.error;

    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Documento no encontrado", 404);

    const data = validation.data;

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

    return successResponse(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return errorResponse("Error al actualizar documento");
  }
}

// DELETE /api/documents/[id] · soft-delete BD + cleanup R2 (audit + sin huérfanos)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted },
      select: { fileUrl: true },
    });

    const result = await softDeleteWithR2(prisma.document, id, "Documento", {
      fileUrls: [existing?.fileUrl],
    });
    if (result.error) return result.error;

    return messageResponse("Documento eliminado");
  } catch (error) {
    console.error("Error deleting document:", error);
    return errorResponse("Error al eliminar documento");
  }
}

// PATCH /api/documents/[id] - Incrementar contador de descargas
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, ...notDeleted },
    });

    if (!document) return errorResponse("Documento no encontrado", 404);

    const updated = await prisma.document.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Error updating download count:", error);
    return errorResponse("Error al actualizar contador");
  }
}
