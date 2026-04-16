import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

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

    const where: Record<string, unknown> = { ...notDeleted };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

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
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return errorResponse("Error al obtener eventos");
  }
}

// POST /api/calendar - Crear evento
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, calendarEventSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

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

    return successResponse(event, 201);
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return errorResponse("Error al crear evento");
  }
}
