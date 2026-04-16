import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const evidenceSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  name: z.string().min(1, "Nombre requerido"),
  category: z.string().min(1, "Categoría requerida"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/accreditation/[id]/evidences - Listar sub-evidencias de un estándar
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const subEvidences = await prisma.accreditationSubEvidence.findMany({
      where: { standardId: id, ...notDeleted },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            documents: {
              where: { ...notDeleted, category: "acreditacion" },
            },
          },
        },
      },
    });

    return successResponse(subEvidences);
  } catch (error) {
    console.error("Error fetching sub-evidences:", error);
    return errorResponse("Error al obtener sub-evidencias");
  }
}

// POST /api/accreditation/[id]/evidences - Crear sub-evidencia
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, evidenceSchema);
    if (validation.error) return validation.error;

    // Verificar que el estándar existe
    const standard = await prisma.accreditationStandard.findFirst({
      where: { id, ...notDeleted },
    });

    if (!standard) {
      return errorResponse("Estándar no encontrado", 404);
    }

    const data = validation.data;

    const subEvidence = await prisma.accreditationSubEvidence.create({
      data: {
        standardId: id,
        code: data.code,
        name: data.name,
        category: data.category,
        order: data.order,
        published: data.published,
      },
    });

    return successResponse(subEvidence, 201);
  } catch (error) {
    console.error("Error creating sub-evidence:", error);
    return errorResponse("Error al crear sub-evidencia");
  }
}
