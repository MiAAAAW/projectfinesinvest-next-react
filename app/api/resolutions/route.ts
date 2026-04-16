import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

// Schema de validación para crear resolución
const resolutionSchema = z.object({
  number: z.string().min(1, "Número requerido"),
  subject: z.string().min(1, "Asunto requerido"),
  type: z.string().min(1, "Tipo requerido"),
  date: z.string().min(1, "Fecha requerida"),
  year: z.number().int().min(1900, "Año inválido"),
  fileUrl: z.string().optional().nullable(),
  fileSize: z.string().optional().nullable(),
  published: z.boolean().default(true),
});

// GET /api/resolutions - Listar resoluciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const year = searchParams.get("year") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { ...notDeleted };

    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;

    if (year) where.year = parseInt(year);

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    const [total, resolutions] = await Promise.all([
      prisma.resolution.count({ where }),
      prisma.resolution.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return successResponse(resolutions);
  } catch (error) {
    console.error("Error fetching resolutions:", error);
    return errorResponse("Error al obtener resoluciones");
  }
}

// POST /api/resolutions - Crear resolución
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, resolutionSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const resolution = await prisma.resolution.create({
      data: {
        number: data.number,
        subject: data.subject,
        type: data.type,
        date: new Date(data.date),
        year: data.year,
        fileUrl: data.fileUrl || null,
        fileSize: data.fileSize || null,
        published: data.published,
      },
    });

    return successResponse(resolution, 201);
  } catch (error) {
    console.error("Error creating resolution:", error);
    return errorResponse("Error al crear resolución");
  }
}
