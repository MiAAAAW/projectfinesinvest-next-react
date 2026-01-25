import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { TEACHER_ROLE_VALUES } from "@/lib/admin-constants";

// ═══════════════════════════════════════════════════════════════════════════════
// API: /api/research/[id]/teachers
// Gestiona docentes asignados a una línea de investigación
// Flujo inverso: desde la línea hacia los docentes
// ═══════════════════════════════════════════════════════════════════════════════

// Schema para asignar docente a línea
const assignTeacherSchema = z.object({
  teacherId: z.string().min(1, "Docente requerido"),
  role: z.enum(TEACHER_ROLE_VALUES).default("investigador"),
});

// Schema para actualizar rol
const updateRoleSchema = z.object({
  teacherId: z.string().min(1, "Docente requerido"),
  role: z.enum(TEACHER_ROLE_VALUES),
});

// Schema para remover docente
const removeTeacherSchema = z.object({
  teacherId: z.string().min(1, "Docente requerido"),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/research/[id]/teachers - Listar docentes de una línea
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar que la línea existe
    const researchLine = await prisma.researchLine.findFirst({
      where: { id, ...notDeleted },
    });

    if (!researchLine) {
      return NextResponse.json(
        { error: "Línea de investigación no encontrada" },
        { status: 404 }
      );
    }

    // Obtener docentes asignados (filtrar soft-deleted)
    const teachers = await prisma.teacherResearchLine.findMany({
      where: {
        researchLineId: id,
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
            phone: true,
            avatarUrl: true,
            specialty: true,
            degree: true,
            published: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // coordinador primero
        { joinedAt: "asc" },
      ],
    });

    // Transformar datos para respuesta
    const data = teachers.map((t) => ({
      ...t.teacher,
      role: t.role,
      joinedAt: t.joinedAt,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching research line teachers:", error);
    return NextResponse.json(
      { error: "Error al obtener docentes" },
      { status: 500 }
    );
  }
}

// POST /api/research/[id]/teachers - Asignar docente a línea
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validar datos
    const result = assignTeacherSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teacherId, role } = result.data;

    // Verificar que la línea existe
    const researchLine = await prisma.researchLine.findFirst({
      where: { id, ...notDeleted },
    });

    if (!researchLine) {
      return NextResponse.json(
        { error: "Línea de investigación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el docente existe
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, ...notDeleted },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Docente no encontrado" },
        { status: 404 }
      );
    }

    // Validación de negocio: solo un coordinador por línea
    if (role === "coordinador") {
      const existingCoordinator = await prisma.teacherResearchLine.findFirst({
        where: {
          researchLineId: id,
          role: "coordinador",
          teacherId: { not: teacherId },
        },
        include: {
          teacher: { select: { name: true } },
        },
      });

      if (existingCoordinator) {
        return NextResponse.json(
          {
            error: `Esta línea ya tiene un coordinador: ${existingCoordinator.teacher.name}. Primero cambia su rol.`
          },
          { status: 400 }
        );
      }
    }

    // Crear o actualizar la relación (upsert para idempotencia)
    const teacherResearchLine = await prisma.teacherResearchLine.upsert({
      where: {
        teacherId_researchLineId: {
          teacherId,
          researchLineId: id,
        },
      },
      update: { role },
      create: {
        teacherId,
        researchLineId: id,
        role,
      },
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

    return NextResponse.json({
      data: {
        ...teacherResearchLine.teacher,
        role: teacherResearchLine.role,
        joinedAt: teacherResearchLine.joinedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error assigning teacher:", error);
    return NextResponse.json(
      { error: "Error al asignar docente" },
      { status: 500 }
    );
  }
}

// PUT /api/research/[id]/teachers - Actualizar rol de docente
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
    const result = updateRoleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teacherId, role } = result.data;

    // Verificar que la relación existe
    const existing = await prisma.teacherResearchLine.findUnique({
      where: {
        teacherId_researchLineId: {
          teacherId,
          researchLineId: id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "El docente no está asignado a esta línea" },
        { status: 404 }
      );
    }

    // Validación: solo un coordinador por línea
    if (role === "coordinador") {
      const existingCoordinator = await prisma.teacherResearchLine.findFirst({
        where: {
          researchLineId: id,
          role: "coordinador",
          teacherId: { not: teacherId },
        },
        include: {
          teacher: { select: { name: true } },
        },
      });

      if (existingCoordinator) {
        return NextResponse.json(
          {
            error: `Ya existe un coordinador: ${existingCoordinator.teacher.name}. Primero cambia su rol.`
          },
          { status: 400 }
        );
      }
    }

    // Actualizar rol
    const updated = await prisma.teacherResearchLine.update({
      where: {
        teacherId_researchLineId: {
          teacherId,
          researchLineId: id,
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
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        ...updated.teacher,
        role: updated.role,
        joinedAt: updated.joinedAt,
      },
    });
  } catch (error) {
    console.error("Error updating teacher role:", error);
    return NextResponse.json(
      { error: "Error al actualizar rol" },
      { status: 500 }
    );
  }
}

// DELETE /api/research/[id]/teachers - Remover docente de línea
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validar datos
    const result = removeTeacherSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teacherId } = result.data;

    // Verificar que la relación existe
    const existing = await prisma.teacherResearchLine.findUnique({
      where: {
        teacherId_researchLineId: {
          teacherId,
          researchLineId: id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "El docente no está asignado a esta línea" },
        { status: 404 }
      );
    }

    // Eliminar relación
    await prisma.teacherResearchLine.delete({
      where: {
        teacherId_researchLineId: {
          teacherId,
          researchLineId: id,
        },
      },
    });

    return NextResponse.json({ message: "Docente removido de la línea" });
  } catch (error) {
    console.error("Error removing teacher:", error);
    return NextResponse.json(
      { error: "Error al remover docente" },
      { status: 500 }
    );
  }
}
