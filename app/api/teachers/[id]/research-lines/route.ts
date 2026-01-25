import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { TEACHER_ROLE_VALUES } from "@/lib/admin-constants";

// Schema para asignar línea de investigación
const assignSchema = z.object({
  researchLineId: z.string().min(1, "Línea de investigación requerida"),
  role: z.enum(TEACHER_ROLE_VALUES).default("investigador"),
});

// Schema para actualizar rol
const updateRoleSchema = z.object({
  researchLineId: z.string().min(1, "Línea de investigación requerida"),
  role: z.enum(TEACHER_ROLE_VALUES),
});

// Schema para remover
const removeSchema = z.object({
  researchLineId: z.string().min(1, "Línea de investigación requerida"),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/teachers/[id]/research-lines - Obtener líneas de un docente
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar que el docente existe
    const teacher = await prisma.teacher.findFirst({
      where: { id, ...notDeleted },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Docente no encontrado" },
        { status: 404 }
      );
    }

    const researchLines = await prisma.teacherResearchLine.findMany({
      where: {
        teacherId: id,
        researchLine: {
          deletedAt: null,
        },
      },
      include: {
        researchLine: {
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            published: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({
      data: researchLines.map((r) => ({
        ...r.researchLine,
        role: r.role,
        joinedAt: r.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching teacher research lines:", error);
    return NextResponse.json(
      { error: "Error al obtener líneas de investigación" },
      { status: 500 }
    );
  }
}

// POST /api/teachers/[id]/research-lines - Asignar línea de investigación
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
    const result = assignSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { researchLineId, role } = result.data;

    // Verificar que el docente existe
    const teacher = await prisma.teacher.findFirst({
      where: { id, ...notDeleted },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Docente no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la línea existe
    const researchLine = await prisma.researchLine.findFirst({
      where: { id: researchLineId, ...notDeleted },
    });

    if (!researchLine) {
      return NextResponse.json(
        { error: "Línea de investigación no encontrada" },
        { status: 404 }
      );
    }

    // Si el rol es coordinador, verificar que no haya otro coordinador
    if (role === "coordinador") {
      const existingCoordinator = await prisma.teacherResearchLine.findFirst({
        where: {
          researchLineId,
          role: "coordinador",
          teacherId: { not: id },
        },
      });

      if (existingCoordinator) {
        return NextResponse.json(
          { error: "Esta línea ya tiene un coordinador asignado" },
          { status: 400 }
        );
      }
    }

    // Crear o actualizar la relación
    const teacherResearchLine = await prisma.teacherResearchLine.upsert({
      where: {
        teacherId_researchLineId: {
          teacherId: id,
          researchLineId,
        },
      },
      update: { role },
      create: {
        teacherId: id,
        researchLineId,
        role,
      },
      include: {
        researchLine: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
      },
    });

    // Respuesta normalizada (igual que research/[id]/teachers)
    return NextResponse.json({
      data: {
        ...teacherResearchLine.researchLine,
        role: teacherResearchLine.role,
        joinedAt: teacherResearchLine.joinedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error assigning research line:", error);
    return NextResponse.json(
      { error: "Error al asignar línea de investigación" },
      { status: 500 }
    );
  }
}

// PUT /api/teachers/[id]/research-lines - Actualizar rol en línea
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

    const { researchLineId, role } = result.data;

    // Verificar que la relación existe
    const existing = await prisma.teacherResearchLine.findUnique({
      where: {
        teacherId_researchLineId: {
          teacherId: id,
          researchLineId,
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
          researchLineId,
          role: "coordinador",
          teacherId: { not: id },
        },
        include: {
          teacher: { select: { name: true } },
        },
      });

      if (existingCoordinator) {
        return NextResponse.json(
          {
            error: `Ya existe un coordinador: ${existingCoordinator.teacher.name}. Primero cambia su rol.`,
          },
          { status: 400 }
        );
      }
    }

    // Actualizar rol
    const updated = await prisma.teacherResearchLine.update({
      where: {
        teacherId_researchLineId: {
          teacherId: id,
          researchLineId,
        },
      },
      data: { role },
      include: {
        researchLine: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        ...updated.researchLine,
        role: updated.role,
        joinedAt: updated.joinedAt,
      },
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Error al actualizar rol" },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/[id]/research-lines - Remover línea de investigación
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
    const result = removeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { researchLineId } = result.data;

    // Verificar que la relación existe
    const existing = await prisma.teacherResearchLine.findUnique({
      where: {
        teacherId_researchLineId: {
          teacherId: id,
          researchLineId,
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
          teacherId: id,
          researchLineId,
        },
      },
    });

    return NextResponse.json({ message: "Línea de investigación removida" });
  } catch (error) {
    console.error("Error removing research line:", error);
    return NextResponse.json(
      { error: "Error al remover línea de investigación" },
      { status: 500 }
    );
  }
}
