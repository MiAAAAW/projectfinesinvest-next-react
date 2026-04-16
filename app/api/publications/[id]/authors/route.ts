import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const addAuthorSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  teacherId: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

const removeAuthorSchema = z.object({
  authorId: z.string().min(1, "El ID del autor es requerido"),
});

// GET /api/publications/[id]/authors - Listar autores
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const publication = await prisma.publication.findFirst({
      where: { id, ...notDeleted },
    });
    if (!publication) return errorResponse("Publicación no encontrada", 404);

    const authors = await prisma.publicationAuthor.findMany({
      where: { publicationId: id },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return successResponse(authors);
  } catch (error) {
    console.error("Publication authors GET error:", error);
    return errorResponse("Error al obtener autores");
  }
}

// POST /api/publications/[id]/authors - Agregar autor
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const publication = await prisma.publication.findFirst({
      where: { id, ...notDeleted },
    });
    if (!publication) return errorResponse("Publicación no encontrada", 404);

    const body = await request.json();

    const validation = validateBody(body, addAuthorSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const author = await prisma.publicationAuthor.create({
      data: {
        publicationId: id,
        name: data.name,
        teacherId: data.teacherId || null,
        order: data.order,
      },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse(author, 201);
  } catch (error) {
    console.error("Publication author POST error:", error);
    return errorResponse("Error al agregar autor");
  }
}

// DELETE /api/publications/[id]/authors - Remover autor
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const publication = await prisma.publication.findFirst({
      where: { id, ...notDeleted },
    });
    if (!publication) return errorResponse("Publicación no encontrada", 404);

    const body = await request.json();

    const validation = validateBody(body, removeAuthorSchema);
    if (validation.error) return validation.error;

    const { authorId } = validation.data;

    const existing = await prisma.publicationAuthor.findFirst({
      where: { id: authorId, publicationId: id },
    });
    if (!existing) return errorResponse("Autor no encontrado", 404);

    await prisma.publicationAuthor.delete({
      where: { id: authorId },
    });

    return successResponse({ success: true });
  } catch (error) {
    console.error("Publication author DELETE error:", error);
    return errorResponse("Error al remover autor");
  }
}
