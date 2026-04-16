import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDelete } from "@/lib/api-utils";

// Schema de validación para actualizar anuncio
const updateAnnouncementSchema = z.object({
  title: z.string().min(1, "Título requerido").optional(),
  content: z.string().min(1, "Contenido requerido").optional(),
  excerpt: z.string().optional().nullable(),
  type: z.string().min(1, "Tipo requerido").optional(),
  icon: z.string().optional(),
  important: z.boolean().optional(),
  published: z.boolean().optional(),
  date: z.string().optional(),
  href: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/announcements/[id] - Obtener anuncio por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const announcement = await prisma.announcement.findFirst({
      where: { id, ...notDeleted },
    });

    if (!announcement) {
      return errorResponse("Anuncio no encontrado", 404);
    }

    return successResponse(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return errorResponse("Error al obtener anuncio");
  }
}

// PUT /api/announcements/[id] - Actualizar anuncio
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateAnnouncementSchema);
    if (validation.error) return validation.error;

    // Verificar que existe
    const existing = await prisma.announcement.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return errorResponse("Anuncio no encontrado", 404);
    }

    const data = validation.data;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.type && { type: data.type }),
        ...(data.icon && { icon: data.icon }),
        ...(data.important !== undefined && { important: data.important }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.href !== undefined && { href: data.href }),
      },
    });

    return successResponse(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return errorResponse("Error al actualizar anuncio");
  }
}

// DELETE /api/announcements/[id] - Eliminar anuncio (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const result = await softDelete(prisma.announcement, id, "Anuncio");
    if (result.error) return result.error;

    return messageResponse("Anuncio eliminado");
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return errorResponse("Error al eliminar anuncio");
  }
}
