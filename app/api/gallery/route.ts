import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const galleryImageSchema = z.object({
  src: z.string().min(1, "URL de imagen requerida"),
  alt: z.string().min(1, "Texto alternativo requerido"),
  caption: z.string().optional().nullable(),
  event: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  published: z.boolean().default(true),
  order: z.number().default(0),
});

// GET /api/gallery - Listar imágenes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const event = searchParams.get("event") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { ...notDeleted };

    if (search) {
      where.OR = [
        { alt: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
        { event: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (event) where.event = event;

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    const [total, images] = await Promise.all([
      prisma.galleryImage.count({ where }),
      prisma.galleryImage.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: images,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return errorResponse("Error al obtener imágenes");
  }
}

// POST /api/gallery - Crear imagen
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, galleryImageSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const image = await prisma.galleryImage.create({
      data: {
        src: data.src,
        alt: data.alt,
        caption: data.caption,
        event: data.event,
        category: data.category,
        date: data.date ? new Date(data.date) : null,
        published: data.published,
        order: data.order,
      },
    });

    return successResponse(image, 201);
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return errorResponse("Error al crear imagen");
  }
}
