import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para actualizar evento
const updateCalendarEventSchema = z.object({
  title: z.string().min(1, "Título requerido").optional(),
  date: z.string().optional(),
  endDate: z.string().optional().nullable(),
  type: z.string().min(1, "Tipo requerido").optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  href: z.string().optional().nullable(),
  important: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/calendar/[id] - Obtener evento por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const event = await prisma.calendarEvent.findFirst({
      where: {
        id,
        ...notDeleted,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return NextResponse.json(
      { error: "Error al obtener evento" },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/[id] - Actualizar evento
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validar datos
    const result = updateCalendarEventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const data = result.data;

    // Actualizar evento
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

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: "Error al actualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/[id] - Eliminar evento (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.calendarEvent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Evento eliminado" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento" },
      { status: 500 }
    );
  }
}
