import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma";
import { prisma, notDeleted } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import {
  composeFullName,
  STUDENT_DEFAULT_STATUS,
  STUDENT_STATUSES,
  SEMESTER_PERIODS,
} from "@/lib/constants/students";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════════════════════
// API: /api/students
// Admin-only. POST crea User + Student + UserRole(estudiante) en transacción.
// ═══════════════════════════════════════════════════════════════════════════════

const VALID_SEMESTERS = SEMESTER_PERIODS.map((s) => s.value);
const VALID_STATUSES = STUDENT_STATUSES.map((s) => s.value);

const semesterField = z
  .string()
  .refine((v) => VALID_SEMESTERS.includes(v), {
    message: 'Semestre inválido (debe ser "I" o "II")',
  })
  .optional()
  .nullable();

const statusField = z
  .string()
  .refine((v) => VALID_STATUSES.includes(v), {
    message: "Estado inválido",
  });

const createStudentSchema = z.object({
  // Identidad (User)
  firstName: z.string().min(1, "Nombre requerido").max(100),
  lastNamePaternal: z.string().min(1, "Apellido paterno requerido").max(80),
  lastNameMaternal: z.string().max(80).optional().nullable(),
  email: z.string().email("Email inválido").max(190).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  documentNumber: z.string().max(12).optional().nullable(),
  avatarUrl: z.string().optional().nullable().transform((v) => normalizeUrl(v, "generic")),

  // Académico (Student)
  universityCode: z.string().min(1).max(12, "Máximo 12 caracteres"),
  program: z.string().max(100).optional().nullable(),
  admissionYear: z.number().int().min(1900).max(2200).optional().nullable(),
  admissionSemester: semesterField,
  admissionType: z.string().max(60).optional().nullable(),
  currentSemester: z.number().int().min(1).max(20).optional().nullable(),
  graduationYear: z.number().int().min(1900).max(2200).optional().nullable(),
  graduationSemester: semesterField,
  status: statusField.default(STUDENT_DEFAULT_STATUS),

  // Perfil
  bio: z.string().optional().nullable(),
  orcid: z.string().optional().nullable().transform((v) => normalizeUrl(v, "orcid")),
  googleScholar: z.string().optional().nullable().transform((v) => normalizeUrl(v, "googleScholar")),
  scopusId: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable().transform((v) => normalizeUrl(v, "linkedin")),
  researchInterests: z.string().optional().nullable(),

  // Meta
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  notes: z.string().optional().nullable(),
});

// Campos que NO se exponen a usuarios no-admin (PII)
const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

const ADMIN_USER_SELECT = {
  ...PUBLIC_USER_SELECT,
  email: true,
  phone: true,
  dni: true,
  active: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// GET — listar (admin) con paginación + búsqueda + filtros
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    // Requiere admin: lista completa con PII solo para administradores.
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const program = searchParams.get("program") || "";
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { ...notDeleted };

    if (program) where.program = program;
    if (featured === "true") where.featured = true;

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;
    else if (status && status !== "all") where.status = status;

    if (search) {
      where.OR = [
        { universityCode: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { dni: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: ADMIN_USER_SELECT } },
      }),
    ]);

    return NextResponse.json({
      data: students,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Error al obtener estudiantes" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — crear estudiante (admin, atómico)
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const result = createStudentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const data = result.data;

    // Obtener el rol "estudiante"
    const estudianteRole = await prisma.role.findFirst({
      where: { code: "estudiante", active: true },
    });
    if (!estudianteRole) {
      return NextResponse.json(
        { error: "Rol 'estudiante' no encontrado en el sistema" },
        { status: 500 }
      );
    }

    const fullName = composeFullName(
      data.firstName,
      data.lastNamePaternal,
      data.lastNameMaternal
    );
    const normalizedEmail = data.email?.toLowerCase() ?? null;
    const emailForUser =
      normalizedEmail || `estudiante.${data.universityCode.toLowerCase()}@placeholder.local`;

    // Password inutilizable (random; el student no loguea con este hash).
    const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

    try {
      const created = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: emailForUser,
            passwordHash: randomPassword,
            name: fullName,
            dni: data.documentNumber || null,
            phone: data.phone || null,
            avatarUrl: data.avatarUrl || null,
            active: true,
            verified: false,
          },
        });

        const newStudent = await tx.student.create({
          data: {
            userId: newUser.id,
            universityCode: data.universityCode,
            program: data.program,
            admissionYear: data.admissionYear,
            admissionSemester: data.admissionSemester,
            admissionType: data.admissionType,
            currentSemester: data.currentSemester,
            graduationYear: data.graduationYear,
            graduationSemester: data.graduationSemester,
            status: data.status,
            bio: data.bio,
            orcid: data.orcid,
            googleScholar: data.googleScholar,
            scopusId: data.scopusId,
            linkedin: data.linkedin,
            researchInterests: data.researchInterests,
            published: data.published,
            featured: data.featured,
            order: data.order,
            notes: data.notes,
          },
        });

        await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: estudianteRole.id,
            active: true,
            validFrom: new Date(),
            grantedBy: admin.id,
            notes: "Rol asignado al crear perfil de estudiante",
          },
        });

        return { ...newStudent, user: newUser };
      });

      return NextResponse.json({ data: created }, { status: 201 });
    } catch (err) {
      // Manejo específico de duplicados (TOCTOU-safe)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "campo único";
        const friendly =
          target.includes("email") ? "Ya existe un usuario con ese email" :
          target.includes("dni") ? "Ya existe un usuario con ese documento" :
          target.includes("university_code") ? "Ya existe un estudiante con ese código universitario" :
          `Valor duplicado en ${target}`;
        return NextResponse.json({ error: friendly }, { status: 400 });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Error al crear estudiante" }, { status: 500 });
  }
}
