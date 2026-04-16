import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDelete } from "@/lib/api-utils";

const updateStandardSchema = z.object({
  code: z.string().min(1, "Código requerido").optional(),
  name: z.string().min(1, "Nombre requerido").optional(),
  description: z.string().optional().nullable(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/accreditation/[id] - Obtener estándar con sub-evidencias
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const standard = await prisma.accreditationStandard.findFirst({
      where: { id, ...notDeleted },
      include: {
        subEvidences: {
          where: notDeleted,
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: {
                documents: {
                  where: { ...notDeleted, category: "acreditacion" },
                },
              },
            },
          },
        },
      },
    });

    if (!standard) {
      return errorResponse("Estándar no encontrado", 404);
    }

    return successResponse(standard);
  } catch (error) {
    console.error("Error fetching standard:", error);
    return errorResponse("Error al obtener estándar");
  }
}

// PUT /api/accreditation/[id] - Actualizar estándar
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateStandardSchema);
    if (validation.error) return validation.error;

    const existing = await prisma.accreditationStandard.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return errorResponse("Estándar no encontrado", 404);
    }

    const data = validation.data;

    // Verificar código único si cambió
    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.accreditationStandard.findFirst({
        where: { code: data.code, ...notDeleted, NOT: { id } },
      });
      if (duplicate) {
        return errorResponse("Ya existe un estándar con ese código", 400);
      }
    }

    const standard = await prisma.accreditationStandard.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return successResponse(standard);
  } catch (error) {
    console.error("Error updating standard:", error);
    return errorResponse("Error al actualizar estándar");
  }
}

// DELETE /api/accreditation/[id] - Eliminar estándar (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const result = await softDelete(prisma.accreditationStandard, id, "Estándar");
    if (result.error) return result.error;

    return messageResponse("Estándar eliminado");
  } catch (error) {
    console.error("Error deleting standard:", error);
    return errorResponse("Error al eliminar estándar");
  }
}
