import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import {
  requireAuth,
  validateBody,
  errorResponse,
  successResponse,
  messageResponse,
  softDeleteWithR2,
} from "@/lib/api-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// SEMILLEROS · NORMATIVA (detalle/edit/delete)
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY = "semilleros-normativa";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const doc = await prisma.document.findFirst({
      where: { id, ...notDeleted, category: CATEGORY },
    });
    if (!doc) return errorResponse("Documento no encontrado", 404);
    return successResponse(doc);
  } catch (error) {
    console.error("Error fetching doc:", error);
    return errorResponse("Error al obtener documento");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateSchema);
    if (validation.error) return validation.error;

    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted, category: CATEGORY },
    });
    if (!existing) return errorResponse("Documento no encontrado", 404);

    const updated = await prisma.document.update({
      where: { id },
      data: validation.data,
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Error updating doc:", error);
    return errorResponse("Error al actualizar documento");
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted, category: CATEGORY },
      select: { fileUrl: true },
    });
    if (!existing) return errorResponse("Documento no encontrado", 404);

    const result = await softDeleteWithR2(prisma.document, id, "Documento", {
      fileUrls: [existing.fileUrl],
    });
    if (result.error) return result.error;

    return messageResponse("Documento eliminado");
  } catch (error) {
    console.error("Error deleting doc:", error);
    return errorResponse("Error al eliminar documento");
  }
}
