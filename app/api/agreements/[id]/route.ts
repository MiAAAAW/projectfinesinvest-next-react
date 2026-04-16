import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDeleteWithR2 } from "@/lib/api-utils";

// Schema de validación para actualizar convenio
const updateSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  institution: z.string().min(1, "La institución es requerida").optional(),
  country: z.string().optional().nullable(),
  type: z.string().min(1, "El tipo es requerido").optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.string().optional(),
  fileUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/agreements/[id] - Obtener convenio por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const agreement = await prisma.agreement.findFirst({
      where: { id, ...notDeleted },
    });

    if (!agreement) {
      return errorResponse("Convenio no encontrado", 404);
    }

    return successResponse(agreement);
  } catch (error) {
    console.error("Error fetching agreement:", error);
    return errorResponse("Error al obtener convenio");
  }
}

// PUT /api/agreements/[id] - Actualizar convenio
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateSchema);
    if (validation.error) return validation.error;

    // Verificar que existe
    const existing = await prisma.agreement.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return errorResponse("Convenio no encontrado", 404);
    }

    const data = validation.data;

    const agreement = await prisma.agreement.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.institution && { institution: data.institution }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.type && { type: data.type }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.status && { status: data.status }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return successResponse(agreement);
  } catch (error) {
    console.error("Error updating agreement:", error);
    return errorResponse("Error al actualizar convenio");
  }
}

// DELETE /api/agreements/[id] · soft-delete BD + cleanup R2 (fileUrl + logoUrl)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    // Pre-fetch ambos URLs para limpieza R2
    const existing = await prisma.agreement.findFirst({
      where: { id, deletedAt: null },
      select: { fileUrl: true, logoUrl: true },
    });

    const result = await softDeleteWithR2(prisma.agreement, id, "Convenio", {
      fileUrls: [existing?.fileUrl, existing?.logoUrl],
    });
    if (result.error) return result.error;

    return messageResponse("Convenio eliminado");
  } catch (error) {
    console.error("Error deleting agreement:", error);
    return errorResponse("Error al eliminar convenio");
  }
}
