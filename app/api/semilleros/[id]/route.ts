import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, softDelete } from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSemilleroSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional().nullable(),
  researchLinesText: z.string().optional().nullable(),
  advisorId: z.string().optional().nullable(),
  status: z.string().optional(),
  published: z.boolean().optional(),
});

// GET /api/semilleros/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const semillero = await prisma.semillero.findFirst({
      where: { id, ...notDeleted },
      include: {
        advisor: { select: { id: true, name: true, degree: true, category: true } },
        students: {
          where: { active: true },
          include: {
            student: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
          },
          orderBy: { joinedAt: "asc" },
        },
        teachers: {
          where: { active: true },
          include: {
            teacher: { select: { id: true, name: true, avatarUrl: true, category: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!semillero) return errorResponse("Semillero no encontrado", 404);

    return successResponse(semillero);
  } catch (error) {
    console.error("Semillero GET error:", error);
    return errorResponse("Error al obtener semillero");
  }
}

// PUT /api/semilleros/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.semillero.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Semillero no encontrado", 404);

    const body = await request.json();

    const validation = validateBody(body, updateSemilleroSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const semillero = await prisma.semillero.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.researchLinesText !== undefined && { researchLinesText: data.researchLinesText }),
        ...(data.advisorId !== undefined && { advisorId: data.advisorId || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return successResponse(semillero);
  } catch (error) {
    console.error("Semillero PUT error:", error);
    return errorResponse("Error al actualizar semillero");
  }
}

// DELETE /api/semilleros/[id] - soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const { error } = await softDelete(prisma.semillero, id, "Semillero");
    if (error) return error;

    return successResponse({ message: "Semillero eliminado" });
  } catch (error) {
    console.error("Semillero DELETE error:", error);
    return errorResponse("Error al eliminar semillero");
  }
}
