import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

// Schema de validación para crear convenio
const createSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  institution: z.string().min(1, "La institución es requerida"),
  country: z.string().optional().nullable(),
  type: z.string().min(1, "El tipo es requerido"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.string().default("vigente"),
  fileUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  published: z.boolean().default(true),
});

// GET /api/agreements - Listar convenios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const agreementStatus = searchParams.get("agreementStatus") || "";

    const where: Record<string, unknown> = { ...notDeleted };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { institution: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    if (agreementStatus) where.status = agreementStatus;

    const agreements = await prisma.agreement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(agreements);
  } catch (error) {
    console.error("Error fetching agreements:", error);
    return errorResponse("Error al obtener convenios");
  }
}

// POST /api/agreements - Crear convenio
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, createSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const agreement = await prisma.agreement.create({
      data: {
        title: data.title,
        institution: data.institution,
        country: data.country,
        type: data.type,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status,
        fileUrl: data.fileUrl,
        logoUrl: data.logoUrl,
        description: data.description,
        published: data.published,
      },
    });

    return successResponse(agreement, 201);
  } catch (error) {
    console.error("Error creating agreement:", error);
    return errorResponse("Error al crear convenio");
  }
}
