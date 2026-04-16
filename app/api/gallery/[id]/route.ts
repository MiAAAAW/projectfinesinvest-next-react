import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDeleteWithR2 } from "@/lib/api-utils";
import { deleteFromR2, getR2KeyFromUrl } from "@/lib/r2";

const updateGalleryImageSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional().nullable(),
  event: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/gallery/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const image = await prisma.galleryImage.findFirst({
      where: { id, ...notDeleted },
    });

    if (!image) return errorResponse("Imagen no encontrada", 404);

    return successResponse(image);
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    return errorResponse("Error al obtener imagen");
  }
}

// PUT /api/gallery/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateGalleryImageSchema);
    if (validation.error) return validation.error;

    const existing = await prisma.galleryImage.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Imagen no encontrada", 404);

    const data = validation.data;

    const image = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(data.src && { src: data.src }),
        ...(data.alt && { alt: data.alt }),
        ...(data.caption !== undefined && { caption: data.caption }),
        ...(data.event !== undefined && { event: data.event }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    // Si el `src` cambió a una URL distinta, intentar limpiar el archivo
    // anterior de R2 (best-effort — no falla el request si R2 da error).
    // Los paths legacy (storage/..., uploads/...) devuelven null en
    // getR2KeyFromUrl → se saltan automáticamente.
    if (data.src && data.src !== existing.src) {
      const oldKey = getR2KeyFromUrl(existing.src);
      if (oldKey) {
        try {
          await deleteFromR2(oldKey);
        } catch (err) {
          console.warn(`[PUT gallery] R2 cleanup failed for ${oldKey}:`, err);
        }
      }
    }

    return successResponse(image);
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return errorResponse("Error al actualizar imagen");
  }
}

// DELETE /api/gallery/[id] · soft-delete BD + cleanup R2 (sin huérfanos)
// Los src legacy con formato `storage/...` o `uploads/...` son ignorados por
// getR2KeyFromUrl (devuelve null) y no intenta borrarlos — safe por diseño.
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.galleryImage.findFirst({
      where: { id, ...notDeleted },
      select: { src: true },
    });

    const result = await softDeleteWithR2(prisma.galleryImage, id, "Imagen", {
      fileUrls: [existing?.src],
    });
    if (result.error) return result.error;

    return messageResponse("Imagen eliminada");
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return errorResponse("Error al eliminar imagen");
  }
}
