import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDeleteWithR2 } from "@/lib/api-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// Documents por sub-evidencia — usa la tabla `documents` unificada (category="acreditacion")
// Cada Document con `subEvidenceId` pertenece a esa sub-evidencia. 1:N.
// Soft-delete + cleanup R2: preserva audit, elimina archivo físico (sin huérfanos).
// ═══════════════════════════════════════════════════════════════════════════════

const documentSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  fileUrl: z.string().min(1, "URL del archivo requerida"),
  fileType: z.string().optional().nullable(),
  fileSize: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

const deleteDocumentSchema = z.object({
  documentId: z.string().min(1, "ID del documento requerido"),
});

interface DocumentRouteParams {
  params: Promise<{ id: string; evidenceId: string }>;
}

// GET · listar Documents de la sub-evidencia
export async function GET(request: NextRequest, { params }: DocumentRouteParams) {
  try {
    const { evidenceId } = await params;

    const documents = await prisma.document.findMany({
      where: { subEvidenceId: evidenceId, ...notDeleted, category: "acreditacion" },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return errorResponse("Error al obtener documentos");
  }
}

// POST · crear Document (category="acreditacion", linkeado a la sub-evidencia)
export async function POST(request: NextRequest, { params }: DocumentRouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { evidenceId } = await params;
    const body = await request.json();

    const validation = validateBody(body, documentSchema);
    if (validation.error) return validation.error;

    // Verificar que la sub-evidencia existe
    const subEvidence = await prisma.accreditationSubEvidence.findFirst({
      where: { id: evidenceId, ...notDeleted },
    });
    if (!subEvidence) return errorResponse("Sub-evidencia no encontrada", 404);

    const data = validation.data;

    const document = await prisma.document.create({
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        fileType: data.fileType ?? "pdf",
        fileSize: data.fileSize,
        category: "acreditacion",
        subEvidenceId: evidenceId,
        published: true,
      },
    });

    return successResponse(document, 201);
  } catch (error) {
    console.error("Error creating document:", error);
    return errorResponse("Error al crear documento");
  }
}

// DELETE · soft-delete Document + cleanup R2 (audit preservado, sin huérfanos)
export async function DELETE(request: NextRequest, { params }: DocumentRouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    await params;
    const body = await request.json();

    const validation = validateBody(body, deleteDocumentSchema);
    if (validation.error) return validation.error;

    const { documentId } = validation.data;

    const existing = await prisma.document.findFirst({
      where: { id: documentId, ...notDeleted, category: "acreditacion" },
      select: { fileUrl: true },
    });

    const result = await softDeleteWithR2(prisma.document, documentId, "Documento", {
      fileUrls: [existing?.fileUrl],
    });
    if (result.error) return result.error;

    return messageResponse("Documento eliminado");
  } catch (error) {
    console.error("Error deleting document:", error);
    return errorResponse("Error al eliminar documento");
  }
}
