import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, softDelete } from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  url: z.string().url("URL inválida").optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "La categoría es requerida").optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

// GET /api/links/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const link = await prisma.externalLink.findFirst({
      where: { id, ...notDeleted },
    });

    if (!link) return errorResponse("Enlace no encontrado", 404);

    return successResponse(link);
  } catch (error) {
    console.error("Link GET error:", error);
    return errorResponse("Error al obtener enlace");
  }
}

// PUT /api/links/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.externalLink.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Enlace no encontrado", 404);

    const body = await request.json();
    const validation = validateBody(body, updateSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const link = await prisma.externalLink.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return successResponse(link);
  } catch (error) {
    console.error("Link PUT error:", error);
    return errorResponse("Error al actualizar enlace");
  }
}

// DELETE /api/links/[id] - soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const result = await softDelete(prisma.externalLink, id, "Enlace");
    if (result.error) return result.error;

    return successResponse({ success: true });
  } catch (error) {
    console.error("Link DELETE error:", error);
    return errorResponse("Error al eliminar enlace");
  }
}
