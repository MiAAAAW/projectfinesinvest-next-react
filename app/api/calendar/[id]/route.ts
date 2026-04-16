import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDelete } from "@/lib/api-utils";

// Schema de validación para actualizar evento
const updateCalendarEventSchema = z.object({
  title: z.string().min(1, "Título requerido").optional(),
  date: z.string().optional(),
  endDate: z.string().optional().nullable(),
  type: z.string().min(1, "Tipo requerido").optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  href: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
  important: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/calendar/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const event = await prisma.calendarEvent.findFirst({
      where: { id, ...notDeleted },
    });

    if (!event) return errorResponse("Evento no encontrado", 404);

    return successResponse(event);
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return errorResponse("Error al obtener evento");
  }
}

// PUT /api/calendar/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateCalendarEventSchema);
    if (validation.error) return validation.error;

    const existing = await prisma.calendarEvent.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Evento no encontrado", 404);

    const data = validation.data;

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.type && { type: data.type }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.href !== undefined && { href: data.href }),
        ...(data.important !== undefined && { important: data.important }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return successResponse(event);
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return errorResponse("Error al actualizar evento");
  }
}

// DELETE /api/calendar/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const result = await softDelete(prisma.calendarEvent, id, "Evento");
    if (result.error) return result.error;

    return messageResponse("Evento eliminado");
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return errorResponse("Error al eliminar evento");
  }
}
