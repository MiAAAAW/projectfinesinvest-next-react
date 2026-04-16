import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

// Schema de validación para crear anuncio
const announcementSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  content: z.string().min(1, "Contenido requerido"),
  excerpt: z.string().optional().nullable(),
  type: z.string().min(1, "Tipo requerido"),
  icon: z.string().default("FileText"),
  important: z.boolean().default(false),
  published: z.boolean().default(true),
  date: z.string().optional(),
  href: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
});

// GET /api/announcements - Listar anuncios
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
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    const [total, announcements] = await Promise.all([
      prisma.announcement.count({ where }),
      prisma.announcement.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: announcements,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return errorResponse("Error al obtener anuncios");
  }
}

// POST /api/announcements - Crear anuncio
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, announcementSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        type: data.type,
        icon: data.icon,
        important: data.important,
        published: data.published,
        date: data.date ? new Date(data.date) : new Date(),
        href: data.href,
      },
    });

    return successResponse(announcement, 201);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return errorResponse("Error al crear anuncio");
  }
}
