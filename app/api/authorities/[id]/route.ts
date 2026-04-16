import { NextRequest } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse, messageResponse, softDelete } from "@/lib/api-utils";

const updateAuthoritySchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  officeHours: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
  linkedin: z.string().optional().nullable().transform(v => normalizeUrl(v, 'linkedin')),
  orcid: z.string().optional().nullable().transform(v => normalizeUrl(v, 'orcid')),
  googleScholar: z.string().optional().nullable().transform(v => normalizeUrl(v, 'googleScholar')),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/authorities/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const authority = await prisma.authority.findFirst({
      where: { id, ...notDeleted },
    });

    if (!authority) return errorResponse("Autoridad no encontrada", 404);

    return successResponse(authority);
  } catch (error) {
    console.error("Error fetching authority:", error);
    return errorResponse("Error al obtener autoridad");
  }
}

// PUT /api/authorities/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateAuthoritySchema);
    if (validation.error) return validation.error;

    const existing = await prisma.authority.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Autoridad no encontrada", 404);

    const data = validation.data;

    const authority = await prisma.authority.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.officeHours !== undefined && { officeHours: data.officeHours }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.linkedin !== undefined && { linkedin: data.linkedin }),
        ...(data.orcid !== undefined && { orcid: data.orcid }),
        ...(data.googleScholar !== undefined && { googleScholar: data.googleScholar }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return successResponse(authority);
  } catch (error) {
    console.error("Error updating authority:", error);
    return errorResponse("Error al actualizar autoridad");
  }
}

// DELETE /api/authorities/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const result = await softDelete(prisma.authority, id, "Autoridad");
    if (result.error) return result.error;

    return messageResponse("Autoridad eliminada");
  } catch (error) {
    console.error("Error deleting authority:", error);
    return errorResponse("Error al eliminar autoridad");
  }
}
