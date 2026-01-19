import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para crear imagen
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

    // Construir filtros
    const where: Record<string, unknown> = {
      ...notDeleted,
    };

    if (search) {
      where.OR = [
        { alt: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
        { event: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (event) {
      where.event = event;
    }

    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    // Obtener total y datos
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Error al obtener imágenes" },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Crear imagen
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const result = galleryImageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Crear imagen
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

    return NextResponse.json({ data: image }, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json(
      { error: "Error al crear imagen" },
      { status: 500 }
    );
  }
}
