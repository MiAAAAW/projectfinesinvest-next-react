import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const createSemilleroSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),       // Objetivo
  researchLinesText: z.string().optional().nullable(), // Líneas UNAP (texto libre)
  advisorId: z.string().optional().nullable(),
  status: z.string().default("activo"),
  published: z.boolean().default(true),
});

// GET /api/semilleros - Listar semilleros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { ...notDeleted };

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;
    else if (status === "activo") where.status = "activo";
    else if (status === "inactivo") where.status = "inactivo";

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const semilleros = await prisma.semillero.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      include: {
        advisor: {
          select: { id: true, name: true },
        },
        _count: {
          select: { students: true, teachers: true },
        },
      },
    });

    return successResponse(semilleros);
  } catch (error) {
    console.error("Semilleros GET error:", error);
    return errorResponse("Error al obtener semilleros");
  }
}

// POST /api/semilleros - Crear semillero
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, createSemilleroSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const semillero = await prisma.semillero.create({
      data: {
        name: data.name,
        description: data.description || null,
        researchLinesText: data.researchLinesText || null,
        advisorId: data.advisorId || null,
        status: data.status,
        published: data.published ?? true,
      },
    });

    return successResponse(semillero, 201);
  } catch (error) {
    console.error("Semilleros POST error:", error);
    return errorResponse("Error al crear semillero");
  }
}
