import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDeleteWithR2 } from "@/lib/api-utils";

// Schema de validación para actualizar resolución
const updateResolutionSchema = z.object({
  number: z.string().min(1, "Número requerido").optional(),
  subject: z.string().min(1, "Asunto requerido").optional(),
  type: z.string().min(1, "Tipo requerido").optional(),
  date: z.string().optional(),
  year: z.number().int().min(1900, "Año inválido").optional(),
  fileUrl: z.string().optional().nullable(),
  fileSize: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/resolutions/[id] - Obtener resolución por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const resolution = await prisma.resolution.findFirst({
      where: { id, ...notDeleted },
    });

    if (!resolution) {
      return errorResponse("Resolución no encontrada", 404);
    }

    return successResponse(resolution);
  } catch (error) {
    console.error("Error fetching resolution:", error);
    return errorResponse("Error al obtener resolución");
  }
}

// PUT /api/resolutions/[id] - Actualizar resolución
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateResolutionSchema);
    if (validation.error) return validation.error;

    // Verificar que existe
    const existing = await prisma.resolution.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return errorResponse("Resolución no encontrada", 404);
    }

    const data = validation.data;

    const resolution = await prisma.resolution.update({
      where: { id },
      data: {
        ...(data.number && { number: data.number }),
        ...(data.subject && { subject: data.subject }),
        ...(data.type && { type: data.type }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl || null }),
        ...(data.fileSize !== undefined && { fileSize: data.fileSize || null }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return successResponse(resolution);
  } catch (error) {
    console.error("Error updating resolution:", error);
    return errorResponse("Error al actualizar resolución");
  }
}

// DELETE /api/resolutions/[id] · soft-delete BD + cleanup R2 (sin huérfanos)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    // Pre-fetch fileUrl para limpieza R2
    const existing = await prisma.resolution.findFirst({
      where: { id, deletedAt: null },
      select: { fileUrl: true },
    });

    const result = await softDeleteWithR2(prisma.resolution, id, "Resolución", {
      fileUrls: [existing?.fileUrl],
    });
    if (result.error) return result.error;

    return messageResponse("Resolución eliminada");
  } catch (error) {
    console.error("Error deleting resolution:", error);
    return errorResponse("Error al eliminar resolución");
  }
}
