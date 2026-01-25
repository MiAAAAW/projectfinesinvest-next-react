import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";

// Schema de validación para crear docente
const teacherSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
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
  published: z.boolean().default(true),
  order: z.number().default(0),
});

// GET /api/teachers - Listar docentes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const includeResearchLines = searchParams.get("includeResearchLines") === "true";

    // Construir filtros
    const where: Record<string, unknown> = {
      ...notDeleted,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { specialty: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    // Obtener total y datos
    const [total, teachers] = await Promise.all([
      prisma.teacher.count({ where }),
      prisma.teacher.findMany({
        where,
        orderBy: [{ order: "asc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: includeResearchLines
          ? {
              researchLines: {
                include: {
                  researchLine: {
                    select: {
                      id: true,
                      title: true,
                      icon: true,
                    },
                  },
                },
              },
            }
          : undefined,
      }),
    ]);

    return NextResponse.json({
      data: teachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Error al obtener docentes" },
      { status: 500 }
    );
  }
}

// POST /api/teachers - Crear docente
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const result = teacherSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verificar email único si se proporciona
    if (data.email) {
      const existingEmail = await prisma.teacher.findFirst({
        where: { email: data.email, ...notDeleted },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Ya existe un docente con ese email" },
          { status: 400 }
        );
      }
    }

    // Verificar userId único si se proporciona
    if (data.userId) {
      const existingUser = await prisma.teacher.findFirst({
        where: { userId: data.userId, ...notDeleted },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Este usuario ya está vinculado a otro docente" },
          { status: 400 }
        );
      }
    }

    // Crear docente
    const teacher = await prisma.teacher.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        specialty: data.specialty,
        degree: data.degree,
        orcid: data.orcid,
        googleScholar: data.googleScholar,
        linkedin: data.linkedin,
        bio: data.bio,
        userId: data.userId,
        published: data.published,
        order: data.order,
      },
    });

    return NextResponse.json({ data: teacher }, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Error al crear docente" },
      { status: 500 }
    );
  }
}
