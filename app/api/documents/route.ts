import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const documentSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional().nullable(),
  fileUrl: z.string().min(1, "URL del archivo requerida"),
  fileType: z.string().min(1, "Tipo de archivo requerido"),
  fileSize: z.string().optional().nullable(),
  category: z.string().min(1, "Categoría requerida"),
  published: z.boolean().default(true),
});

// GET /api/documents - Listar documentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { ...notDeleted };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: documents,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return errorResponse("Error al obtener documentos");
  }
}

// POST /api/documents - Crear documento
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, documentSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const document = await prisma.document.create({
      data: {
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        category: data.category,
        published: data.published,
      },
    });

    return successResponse(document, 201);
  } catch (error) {
    console.error("Error creating document:", error);
    return errorResponse("Error al crear documento");
  }
}
