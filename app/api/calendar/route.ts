import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";

// Schema de validación para crear evento
const calendarEventSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  date: z.string().min(1, "Fecha requerida"),
  endDate: z.string().optional().nullable(),
  type: z.string().min(1, "Tipo requerido"),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  href: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
  important: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().default(0),
});

// GET /api/calendar - Listar eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Construir filtros
    const where: Record<string, unknown> = {
      ...notDeleted,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    // Obtener total y datos
    const [total, events] = await Promise.all([
      prisma.calendarEvent.count({ where }),
      prisma.calendarEvent.findMany({
        where,
        orderBy: { date: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}

// POST /api/calendar - Crear evento
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const result = calendarEventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Crear evento
    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        type: data.type,
        description: data.description,
        location: data.location,
        href: data.href,
        important: data.important,
        published: data.published,
        order: data.order,
      },
    });

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
}
