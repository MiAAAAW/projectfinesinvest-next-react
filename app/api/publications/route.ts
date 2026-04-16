import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const createPublicationSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  abstract: z.string().optional().nullable(),
  journal: z.string().optional().nullable(),
  year: z.number().int().min(1900).max(2100),
  volume: z.string().optional().nullable(),
  issue: z.string().optional().nullable(),
  pages: z.string().optional().nullable(),
  doi: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  type: z.string().min(1, "El tipo es requerido"),
  indexedIn: z.string().optional().nullable(),
  published: z.boolean().default(true),
});

// GET /api/publications - Listar publicaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { ...notDeleted };

    if (type && type !== "all") where.type = type;
    if (year && year !== "all") where.year = parseInt(year);

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { journal: { contains: search, mode: "insensitive" } },
      ];
    }

    const publications = await prisma.publication.findMany({
      where,
      include: {
        _count: {
          select: { authors: true },
        },
      },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return successResponse(publications);
  } catch (error) {
    console.error("Publications GET error:", error);
    return errorResponse("Error al obtener publicaciones");
  }
}

// POST /api/publications - Crear publicación
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, createPublicationSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const publication = await prisma.publication.create({
      data: {
        title: data.title,
        abstract: data.abstract || null,
        journal: data.journal || null,
        year: data.year,
        volume: data.volume || null,
        issue: data.issue || null,
        pages: data.pages || null,
        doi: data.doi || null,
        url: data.url || null,
        type: data.type,
        indexedIn: data.indexedIn || null,
        published: data.published ?? true,
      },
    });

    return successResponse(publication, 201);
  } catch (error) {
    console.error("Publications POST error:", error);
    return errorResponse("Error al crear publicación");
  }
}
