import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, softDelete } from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  websiteUrl: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  leaderId: z.string().optional().nullable(),
  researchLineId: z.string().optional().nullable(),
  status: z.string().optional(),
  published: z.boolean().optional(),
});

// GET /api/research-groups/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const group = await prisma.researchGroup.findFirst({
      where: { id, ...notDeleted },
      include: {
        leader: {
          select: { id: true, name: true, degree: true },
        },
        researchLine: {
          select: { id: true, title: true },
        },
        members: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                specialty: true,
                degree: true,
                published: true,
              },
            },
          },
          orderBy: [
            { role: "asc" },
            { joinedAt: "asc" },
          ],
        },
      },
    });

    if (!group) return errorResponse("Grupo de investigación no encontrado", 404);

    return successResponse(group);
  } catch (error) {
    console.error("ResearchGroup GET error:", error);
    return errorResponse("Error al obtener grupo de investigación");
  }
}

// PUT /api/research-groups/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.researchGroup.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Grupo de investigación no encontrado", 404);

    const body = await request.json();

    const validation = validateBody(body, updateGroupSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    // Verificar código único si se cambió
    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.researchGroup.findUnique({
        where: { code: data.code },
      });
      if (codeExists) {
        return errorResponse("Ya existe un grupo con ese código", 400);
      }
    }

    const group = await prisma.researchGroup.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.code !== undefined && { code: data.code || null }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl || null }),
        ...(data.leaderId !== undefined && { leaderId: data.leaderId || null }),
        ...(data.researchLineId !== undefined && { researchLineId: data.researchLineId || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.published !== undefined && { published: data.published }),
      },
      include: {
        leader: {
          select: { id: true, name: true },
        },
        researchLine: {
          select: { id: true, title: true },
        },
      },
    });

    return successResponse(group);
  } catch (error) {
    console.error("ResearchGroup PUT error:", error);
    return errorResponse("Error al actualizar grupo de investigación");
  }
}

// DELETE /api/research-groups/[id] - soft delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const result = await softDelete(prisma.researchGroup, id, "Grupo de investigación");
    if (result.error) return result.error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ResearchGroup DELETE error:", error);
    return errorResponse("Error al eliminar grupo de investigación");
  }
}
