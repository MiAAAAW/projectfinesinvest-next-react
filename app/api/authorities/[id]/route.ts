import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHORITY BY ID API
// GET /api/authorities/[id] - Obtener autoridad por ID
// PUT /api/authorities/[id] - Actualizar autoridad
// DELETE /api/authorities/[id] - Eliminar autoridad (soft delete)
// ═══════════════════════════════════════════════════════════════════════════════

// Schema de validación para actualizar autoridad
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

// GET /api/authorities/[id] - Obtener autoridad por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const authority = await prisma.authority.findFirst({
      where: {
        id,
        ...notDeleted,
      },
    });

    if (!authority) {
      return NextResponse.json(
        { error: "Autoridad no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: authority });
  } catch (error) {
    console.error("Error fetching authority:", error);
    return NextResponse.json(
      { error: "Error al obtener autoridad" },
      { status: 500 }
    );
  }
}

// PUT /api/authorities/[id] - Actualizar autoridad
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validar datos
    const result = updateAuthoritySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existing = await prisma.authority.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Autoridad no encontrada" },
        { status: 404 }
      );
    }

    const data = result.data;

    // Actualizar autoridad
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

    return NextResponse.json({ data: authority });
  } catch (error) {
    console.error("Error updating authority:", error);
    return NextResponse.json(
      { error: "Error al actualizar autoridad" },
      { status: 500 }
    );
  }
}

// DELETE /api/authorities/[id] - Eliminar autoridad (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.authority.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Autoridad no encontrada" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.authority.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Autoridad eliminada" });
  } catch (error) {
    console.error("Error deleting authority:", error);
    return NextResponse.json(
      { error: "Error al eliminar autoridad" },
      { status: 500 }
    );
  }
}
