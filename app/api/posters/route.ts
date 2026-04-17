import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import {
  requireAuth,
  validateBody,
  errorResponse,
  successResponse,
} from "@/lib/api-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// POSTERS FINESI — lista flat de Documents con category="posters"
// Reusa la tabla `documents`. Sin modelo dedicado, sin migración.
// ═══════════════════════════════════════════════════════════════════════════════

const POSTERS_CATEGORY = "posters";

const createSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  fileUrl: z.string().min(1, "URL del archivo requerida"),
  fileType: z.string().optional().nullable(),
  fileSize: z.string().optional().nullable(),
});

// GET · listar posters publicados
export async function GET() {
  try {
    const posters = await prisma.document.findMany({
      where: { ...notDeleted, category: POSTERS_CATEGORY },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        published: true,
        createdAt: true,
      },
    });
    return successResponse(posters);
  } catch (error) {
    console.error("Error fetching posters:", error);
    return errorResponse("Error al obtener posters");
  }
}

// POST · crear poster nuevo
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const validation = validateBody(body, createSchema);
    if (validation.error) return validation.error;

    const data = validation.data;
    const poster = await prisma.document.create({
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        fileType: data.fileType ?? "pdf",
        fileSize: data.fileSize,
        category: POSTERS_CATEGORY,
        published: true,
      },
    });

    return successResponse(poster, 201);
  } catch (error) {
    console.error("Error creating poster:", error);
    return errorResponse("Error al crear poster");
  }
}
