import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDelete } from "@/lib/api-utils";

const updateEvidenceSchema = z.object({
  code: z.string().min(1, "Código requerido").optional(),
  name: z.string().min(1, "Nombre requerido").optional(),
  category: z.string().min(1, "Categoría requerida").optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

interface EvidenceRouteParams {
  params: Promise<{ id: string; evidenceId: string }>;
}

// GET /api/accreditation/[id]/evidences/[evidenceId] - Obtener sub-evidencia con documentos
export async function GET(request: NextRequest, { params }: EvidenceRouteParams) {
  try {
    const { evidenceId } = await params;

    const subEvidence = await prisma.accreditationSubEvidence.findFirst({
      where: { id: evidenceId, ...notDeleted },
      include: {
        documents: {
          where: { ...notDeleted, category: "acreditacion" },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!subEvidence) {
      return errorResponse("Sub-evidencia no encontrada", 404);
    }

    return successResponse(subEvidence);
  } catch (error) {
    console.error("Error fetching sub-evidence:", error);
    return errorResponse("Error al obtener sub-evidencia");
  }
}

// PUT /api/accreditation/[id]/evidences/[evidenceId] - Actualizar sub-evidencia
export async function PUT(request: NextRequest, { params }: EvidenceRouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { evidenceId } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateEvidenceSchema);
    if (validation.error) return validation.error;

    const existing = await prisma.accreditationSubEvidence.findFirst({
      where: { id: evidenceId, ...notDeleted },
    });

    if (!existing) {
      return errorResponse("Sub-evidencia no encontrada", 404);
    }

    const data = validation.data;

    const subEvidence = await prisma.accreditationSubEvidence.update({
      where: { id: evidenceId },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return successResponse(subEvidence);
  } catch (error) {
    console.error("Error updating sub-evidence:", error);
    return errorResponse("Error al actualizar sub-evidencia");
  }
}

// DELETE /api/accreditation/[id]/evidences/[evidenceId] - Eliminar sub-evidencia (soft delete)
export async function DELETE(request: NextRequest, { params }: EvidenceRouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { evidenceId } = await params;

    const result = await softDelete(prisma.accreditationSubEvidence, evidenceId, "Sub-evidencia");
    if (result.error) return result.error;

    return messageResponse("Sub-evidencia eliminada");
  } catch (error) {
    console.error("Error deleting sub-evidence:", error);
    return errorResponse("Error al eliminar sub-evidencia");
  }
}
