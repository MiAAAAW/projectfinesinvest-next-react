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
// POSTERS FINESI — detalle/editar/borrar
// ═══════════════════════════════════════════════════════════════════════════════

const POSTERS_CATEGORY = "posters";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET · detalle
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const poster = await prisma.document.findFirst({
      where: { id, ...notDeleted, category: POSTERS_CATEGORY },
    });
    if (!poster) return errorResponse("Poster no encontrado", 404);
    return successResponse(poster);
  } catch (error) {
    console.error("Error fetching poster:", error);
    return errorResponse("Error al obtener poster");
  }
}

// PATCH · actualizar metadata (título, descripción, published)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateSchema);
    if (validation.error) return validation.error;

    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted, category: POSTERS_CATEGORY },
    });
    if (!existing) return errorResponse("Poster no encontrado", 404);

    const poster = await prisma.document.update({
      where: { id },
      data: validation.data,
    });

    return successResponse(poster);
  } catch (error) {
    console.error("Error updating poster:", error);
    return errorResponse("Error al actualizar poster");
  }
}

// DELETE · soft-delete + cleanup R2
export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.document.findFirst({
      where: { id, ...notDeleted, category: POSTERS_CATEGORY },
      select: { fileUrl: true },
    });
    if (!existing) return errorResponse("Poster no encontrado", 404);

    const result = await softDeleteWithR2(prisma.document, id, "Poster", {
      fileUrls: [existing.fileUrl],
    });
    if (result.error) return result.error;

    return messageResponse("Poster eliminado");
  } catch (error) {
    console.error("Error deleting poster:", error);
    return errorResponse("Error al eliminar poster");
  }
}
