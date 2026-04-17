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
// SEMILLEROS · NORMATIVA (Resoluciones Rectorales sobre semilleros)
// Reusa tabla `documents` con category="semilleros-normativa". Sin migración.
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY = "semilleros-normativa";

const createSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  fileUrl: z.string().min(1, "URL del archivo requerida"),
  fileType: z.string().optional().nullable(),
  fileSize: z.string().optional().nullable(),
});

// GET · lista pública
export async function GET() {
  try {
    const items = await prisma.document.findMany({
      where: { ...notDeleted, category: CATEGORY },
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
    return successResponse(items);
  } catch (error) {
    console.error("Error fetching semilleros-normativa:", error);
    return errorResponse("Error al obtener normativa");
  }
}

// POST · crear nuevo (auth)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const validation = validateBody(body, createSchema);
    if (validation.error) return validation.error;

    const data = validation.data;
    const doc = await prisma.document.create({
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        fileType: data.fileType ?? "pdf",
        fileSize: data.fileSize,
        category: CATEGORY,
        published: true,
      },
    });

    return successResponse(doc, 201);
  } catch (error) {
    console.error("Error creating semilleros-normativa:", error);
    return errorResponse("Error al crear normativa");
  }
}
