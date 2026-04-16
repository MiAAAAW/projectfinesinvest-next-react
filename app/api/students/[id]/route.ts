import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma";
import { prisma, notDeleted } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import {
  composeFullName,
  STUDENT_STATUSES,
  SEMESTER_PERIODS,
} from "@/lib/constants/students";

// ═══════════════════════════════════════════════════════════════════════════════
// API: /api/students/[id]
// Admin-only. Atomicidad en transacción para User + Student.
// ═══════════════════════════════════════════════════════════════════════════════

const VALID_SEMESTERS = SEMESTER_PERIODS.map((s) => s.value);
const VALID_STATUSES = STUDENT_STATUSES.map((s) => s.value);

// Status que implican que el estudiante YA no es estudiante activo.
// Al cambiar a estos, el UserRole(estudiante) se desactiva automáticamente.
const INACTIVE_STATUSES = new Set(["egresado", "bachiller", "titulado", "retirado"]);

const semesterField = z
  .string()
  .refine((v) => VALID_SEMESTERS.includes(v), {
    message: 'Semestre inválido (debe ser "I" o "II")',
  })
  .optional()
  .nullable();

const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastNamePaternal: z.string().min(1).max(80).optional(),
  lastNameMaternal: z.string().max(80).optional().nullable(),
  // email: si viene null explícito se rechaza (User.email es NOT NULL). Solo permitimos
  // cambiarlo a otro email válido o no tocarlo.
  email: z.string().email("Email inválido").max(190).optional(),
  phone: z.string().max(20).optional().nullable(),
  documentNumber: z.string().max(12).optional().nullable(),
  avatarUrl: z.string().optional().nullable().transform((v) => normalizeUrl(v, "generic")),

  universityCode: z.string().min(1).max(12).optional(),
  program: z.string().max(100).optional().nullable(),
  admissionYear: z.number().int().min(1900).max(2200).optional().nullable(),
  admissionSemester: semesterField,
  admissionType: z.string().max(60).optional().nullable(),
  currentSemester: z.number().int().min(1).max(20).optional().nullable(),
  graduationYear: z.number().int().min(1900).max(2200).optional().nullable(),
  graduationSemester: semesterField,
  status: z
    .string()
    .refine((v) => VALID_STATUSES.includes(v), { message: "Estado inválido" })
    .optional(),

  bio: z.string().optional().nullable(),
  orcid: z.string().optional().nullable().transform((v) => normalizeUrl(v, "orcid")),
  googleScholar: z.string().optional().nullable().transform((v) => normalizeUrl(v, "googleScholar")),
  scopusId: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable().transform((v) => normalizeUrl(v, "linkedin")),
  researchInterests: z.string().optional().nullable(),

  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  notes: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ADMIN_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  dni: true,
  avatarUrl: true,
  active: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// GET — admin only
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const student = await prisma.student.findFirst({
      where: { id, ...notDeleted },
      include: { user: { select: { ...ADMIN_USER_SELECT, verified: true } } },
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Error al obtener estudiante" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT — actualizar (atómico, sin legacy-name corruption)
// ─────────────────────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const result = updateStudentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

    const existing = await prisma.student.findFirst({
      where: { id, ...notDeleted },
      include: { user: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Normalizar email
    const normalizedEmail = data.email?.toLowerCase();

    try {
      const updated = await prisma.$transaction(async (tx) => {
        // ─── Actualizar User ─────────────────────────────
        const userUpdate: Record<string, unknown> = {};
        if (normalizedEmail !== undefined) userUpdate.email = normalizedEmail;
        if (data.phone !== undefined) userUpdate.phone = data.phone;
        if (data.documentNumber !== undefined) userUpdate.dni = data.documentNumber;
        if (data.avatarUrl !== undefined) userUpdate.avatarUrl = data.avatarUrl;

        // Cambio de nombre: SOLO si el admin pasó los 3 campos explícitamente recomponemos.
        // Si solo pasa UNO de los apellidos, no reconstruimos (evitamos corrupción por
        // split legacy). El admin tiene la responsabilidad de enviar name completo.
        const allNamePartsPresent =
          data.firstName !== undefined && data.lastNamePaternal !== undefined;
        if (allNamePartsPresent) {
          const newFull = composeFullName(
            data.firstName as string,
            data.lastNamePaternal as string,
            data.lastNameMaternal ?? null
          );
          if (newFull) userUpdate.name = newFull;
        }

        if (Object.keys(userUpdate).length > 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: userUpdate,
          });
        }

        // ─── Actualizar Student ──────────────────────────
        const studentUpdate: Prisma.StudentUpdateInput = {};
        const scalarFields = [
          "universityCode",
          "program",
          "admissionYear",
          "admissionSemester",
          "admissionType",
          "currentSemester",
          "graduationYear",
          "graduationSemester",
          "status",
          "bio",
          "orcid",
          "googleScholar",
          "scopusId",
          "linkedin",
          "researchInterests",
          "published",
          "featured",
          "order",
          "notes",
        ] as const;

        for (const field of scalarFields) {
          const value = data[field];
          if (value !== undefined) {
            (studentUpdate as Record<string, unknown>)[field] = value;
          }
        }

        const updatedStudent = await tx.student.update({
          where: { id },
          data: studentUpdate,
          include: { user: { select: ADMIN_USER_SELECT } },
        });

        // ─── Si el status pasa a inactivo, desactivar UserRole(estudiante) ──
        if (data.status && INACTIVE_STATUSES.has(data.status)) {
          await tx.userRole.updateMany({
            where: {
              userId: existing.userId,
              role: { code: "estudiante" },
              active: true,
            },
            data: { active: false, validUntil: new Date() },
          });
        }

        return updatedStudent;
      });

      return NextResponse.json({ data: updated });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "campo único";
        const friendly =
          target.includes("email") ? "Otro usuario ya tiene ese email" :
          target.includes("dni") ? "Otro usuario ya tiene ese documento" :
          target.includes("university_code") ? "Otro estudiante ya tiene ese código" :
          `Valor duplicado en ${target}`;
        return NextResponse.json({ error: friendly }, { status: 400 });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Error al actualizar estudiante" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — soft-delete + limpia cascades + desactiva cuenta y rol
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.student.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete del Student
      await tx.student.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // ⚠️ IMPORTANTE: al hacer soft-delete, los ResearchGroupStudent y SemilleroStudent
      // quedan "huérfanos" apuntando a un student con deletedAt. Para evitar que
      // aparezcan en queries públicas que no filtran deletedAt, los BORRAMOS
      // (no se pierde data porque la eliminación del estudiante es explícita).
      await tx.researchGroupStudent.deleteMany({ where: { studentId: id } });
      await tx.semilleroStudent.deleteMany({ where: { studentId: id } });

      // Desactivar el User (no soft-delete para preservar historial de roles)
      await tx.user.update({
        where: { id: existing.userId },
        data: { active: false },
      });

      // Terminar rol estudiante con validUntil = now
      await tx.userRole.updateMany({
        where: {
          userId: existing.userId,
          role: { code: "estudiante" },
          active: true,
        },
        data: {
          active: false,
          validUntil: new Date(),
        },
      });
    });

    return NextResponse.json({ message: "Estudiante eliminado" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Error al eliminar estudiante" }, { status: 500 });
  }
}
