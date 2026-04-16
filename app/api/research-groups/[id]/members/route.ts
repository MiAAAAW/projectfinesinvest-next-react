import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const MEMBER_ROLE_VALUES = ["lider", "miembro", "colaborador"] as const;

const assignMemberSchema = z.object({
  teacherId: z.string().min(1, "Docente requerido"),
  role: z.enum(MEMBER_ROLE_VALUES).default("miembro"),
});

const updateRoleSchema = z.object({
  teacherId: z.string().min(1, "Docente requerido"),
  role: z.enum(MEMBER_ROLE_VALUES),
});

const removeMemberSchema = z.object({
  teacherId: z.string().min(1, "Docente requerido"),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/research-groups/[id]/members - Listar miembros del grupo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const group = await prisma.researchGroup.findFirst({
      where: { id, ...notDeleted },
    });

    if (!group) {
      return errorResponse("Grupo de investigación no encontrado", 404);
    }

    const members = await prisma.researchGroupMember.findMany({
      where: {
        groupId: id,
        teacher: {
          deletedAt: null,
        },
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            specialty: true,
            degree: true,
            published: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { joinedAt: "asc" },
      ],
    });

    const data = members.map((m) => ({
      ...m.teacher,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return errorResponse("Error al obtener miembros");
  }
}

// POST /api/research-groups/[id]/members - Agregar miembro al grupo
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, assignMemberSchema);
    if (validation.error) return validation.error;

    const { teacherId, role } = validation.data;

    // Verificar que el grupo existe
    const group = await prisma.researchGroup.findFirst({
      where: { id, ...notDeleted },
    });
    if (!group) {
      return errorResponse("Grupo de investigación no encontrado", 404);
    }

    // Verificar que el docente existe
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, ...notDeleted },
    });
    if (!teacher) {
      return errorResponse("Docente no encontrado", 404);
    }

    // Validación: solo un líder por grupo
    if (role === "lider") {
      const existingLeader = await prisma.researchGroupMember.findFirst({
        where: {
          groupId: id,
          role: "lider",
          teacherId: { not: teacherId },
        },
        include: {
          teacher: { select: { name: true } },
        },
      });

      if (existingLeader) {
        return errorResponse(
          `Este grupo ya tiene un líder: ${existingLeader.teacher.name}. Primero cambia su rol.`,
          400
        );
      }
    }

    // Crear o actualizar la relación (upsert para idempotencia)
    const member = await prisma.researchGroupMember.upsert({
      where: {
        groupId_teacherId: {
          groupId: id,
          teacherId,
        },
      },
      update: { role },
      create: {
        groupId: id,
        teacherId,
        role,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            specialty: true,
            degree: true,
            published: true,
          },
        },
      },
    });

    return successResponse({
      ...member.teacher,
      role: member.role,
      joinedAt: member.joinedAt,
    }, 201);
  } catch (error) {
    console.error("Error assigning member:", error);
    return errorResponse("Error al agregar miembro");
  }
}

// PUT /api/research-groups/[id]/members - Actualizar rol de miembro
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, updateRoleSchema);
    if (validation.error) return validation.error;

    const { teacherId, role } = validation.data;

    // Verificar que la relación existe
    const existing = await prisma.researchGroupMember.findUnique({
      where: {
        groupId_teacherId: {
          groupId: id,
          teacherId,
        },
      },
    });

    if (!existing) {
      return errorResponse("El docente no es miembro de este grupo", 404);
    }

    // Validación: solo un líder por grupo
    if (role === "lider") {
      const existingLeader = await prisma.researchGroupMember.findFirst({
        where: {
          groupId: id,
          role: "lider",
          teacherId: { not: teacherId },
        },
        include: {
          teacher: { select: { name: true } },
        },
      });

      if (existingLeader) {
        return errorResponse(
          `Ya existe un líder: ${existingLeader.teacher.name}. Primero cambia su rol.`,
          400
        );
      }
    }

    const updated = await prisma.researchGroupMember.update({
      where: {
        groupId_teacherId: {
          groupId: id,
          teacherId,
        },
      },
      data: { role },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            degree: true,
            avatarUrl: true,
            specialty: true,
          },
        },
      },
    });

    return successResponse({
      ...updated.teacher,
      role: updated.role,
      joinedAt: updated.joinedAt,
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return errorResponse("Error al actualizar rol");
  }
}

// DELETE /api/research-groups/[id]/members - Remover miembro del grupo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const validation = validateBody(body, removeMemberSchema);
    if (validation.error) return validation.error;

    const { teacherId } = validation.data;

    // Verificar que la relación existe
    const existing = await prisma.researchGroupMember.findUnique({
      where: {
        groupId_teacherId: {
          groupId: id,
          teacherId,
        },
      },
    });

    if (!existing) {
      return errorResponse("El docente no es miembro de este grupo", 404);
    }

    await prisma.researchGroupMember.delete({
      where: {
        groupId_teacherId: {
          groupId: id,
          teacherId,
        },
      },
    });

    return NextResponse.json({ message: "Miembro removido del grupo" });
  } catch (error) {
    console.error("Error removing member:", error);
    return errorResponse("Error al remover miembro");
  }
}
