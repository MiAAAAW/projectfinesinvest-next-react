import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";

// Schema de validación para actualizar docente
const updateTeacherSchema = z.object({
  name: z.string().min(1, "Nombre requerido").optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
  specialty: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  orcid: z.string().optional().nullable().transform(v => normalizeUrl(v, 'orcid')),
  googleScholar: z.string().optional().nullable().transform(v => normalizeUrl(v, 'googleScholar')),
  linkedin: z.string().optional().nullable().transform(v => normalizeUrl(v, 'linkedin')),
  bio: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/teachers/[id] - Obtener docente por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeResearchLines = searchParams.get("includeResearchLines") === "true";

    const teacher = await prisma.teacher.findFirst({
      where: {
        id,
        ...notDeleted,
      },
      include: includeResearchLines
        ? {
            researchLines: {
              include: {
                researchLine: {
                  select: {
                    id: true,
                    title: true,
                    icon: true,
                    description: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          }
        : undefined,
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Docente no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Error al obtener docente" },
      { status: 500 }
    );
  }
}

// PUT /api/teachers/[id] - Actualizar docente
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
    const result = updateTeacherSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existing = await prisma.teacher.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Docente no encontrado" },
        { status: 404 }
      );
    }

    const data = result.data;

    // Verificar email único si se cambia
    if (data.email && data.email !== existing.email) {
      const existingEmail = await prisma.teacher.findFirst({
        where: { email: data.email, id: { not: id }, ...notDeleted },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Ya existe un docente con ese email" },
          { status: 400 }
        );
      }
    }

    // Verificar userId único si se cambia
    if (data.userId && data.userId !== existing.userId) {
      const existingUser = await prisma.teacher.findFirst({
        where: { userId: data.userId, id: { not: id }, ...notDeleted },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Este usuario ya está vinculado a otro docente" },
          { status: 400 }
        );
      }
    }

    // Actualizar docente
    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.specialty !== undefined && { specialty: data.specialty }),
        ...(data.degree !== undefined && { degree: data.degree }),
        ...(data.orcid !== undefined && { orcid: data.orcid }),
        ...(data.googleScholar !== undefined && { googleScholar: data.googleScholar }),
        ...(data.linkedin !== undefined && { linkedin: data.linkedin }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.userId !== undefined && { userId: data.userId }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json({ data: teacher });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Error al actualizar docente" },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/[id] - Eliminar docente (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que existe
    const existing = await prisma.teacher.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Docente no encontrado" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.teacher.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Docente eliminado" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Error al eliminar docente" },
      { status: 500 }
    );
  }
}
