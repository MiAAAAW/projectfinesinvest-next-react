import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, softDelete } from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updatePublicationSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  abstract: z.string().optional().nullable(),
  journal: z.string().optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional(),
  volume: z.string().optional().nullable(),
  issue: z.string().optional().nullable(),
  pages: z.string().optional().nullable(),
  doi: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  type: z.string().optional(),
  indexedIn: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

// GET /api/publications/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const publication = await prisma.publication.findFirst({
      where: { id, ...notDeleted },
      include: {
        authors: {
          orderBy: { order: "asc" },
          include: {
            teacher: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!publication) return errorResponse("Publicación no encontrada", 404);

    return successResponse(publication);
  } catch (error) {
    console.error("Publication GET error:", error);
    return errorResponse("Error al obtener publicación");
  }
}

// PUT /api/publications/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.publication.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Publicación no encontrada", 404);

    const body = await request.json();

    const validation = validateBody(body, updatePublicationSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const publication = await prisma.publication.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.abstract !== undefined && { abstract: data.abstract }),
        ...(data.journal !== undefined && { journal: data.journal }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.volume !== undefined && { volume: data.volume }),
        ...(data.issue !== undefined && { issue: data.issue }),
        ...(data.pages !== undefined && { pages: data.pages }),
        ...(data.doi !== undefined && { doi: data.doi }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.indexedIn !== undefined && { indexedIn: data.indexedIn }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });

    return successResponse(publication);
  } catch (error) {
    console.error("Publication PUT error:", error);
    return errorResponse("Error al actualizar publicación");
  }
}

// DELETE /api/publications/[id] - soft delete
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const { error } = await softDelete(prisma.publication, id, "Publicación");
    if (error) return error;

    return successResponse({ success: true });
  } catch (error) {
    console.error("Publication DELETE error:", error);
    return errorResponse("Error al eliminar publicación");
  }
}
