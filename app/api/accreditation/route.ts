import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

// Schema de validación para crear estándar
const standardSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional().nullable(),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

// GET /api/accreditation - Listar estándares
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { ...notDeleted };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    const standards = await prisma.accreditationStandard.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            subEvidences: {
              where: notDeleted,
            },
          },
        },
      },
    });

    return successResponse(standards);
  } catch (error) {
    console.error("Error fetching standards:", error);
    return errorResponse("Error al obtener estándares");
  }
}

// POST /api/accreditation - Crear estándar
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, standardSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    // Verificar código único
    const existing = await prisma.accreditationStandard.findFirst({
      where: { code: data.code, ...notDeleted },
    });

    if (existing) {
      return errorResponse("Ya existe un estándar con ese código", 400);
    }

    const standard = await prisma.accreditationStandard.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        order: data.order,
        published: data.published,
      },
    });

    return successResponse(standard, 201);
  } catch (error) {
    console.error("Error creating standard:", error);
    return errorResponse("Error al crear estándar");
  }
}
