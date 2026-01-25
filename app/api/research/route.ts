import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";

// Schema de validación para crear línea de investigación
const researchLineSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().min(1, "Descripción requerida"),
  icon: z.string().default("FlaskConical"),
  coordinator: z.string().optional().nullable(),
  members: z.number().optional().nullable(),
  href: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
  published: z.boolean().default(true),
  order: z.number().default(0),
});

// GET /api/research - Listar líneas de investigación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const includeTeachers = searchParams.get("includeTeachers") === "true";

    // Construir filtros
    const where: Record<string, unknown> = {
      ...notDeleted,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { coordinator: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    // Obtener total y datos
    const [total, researchLines] = await Promise.all([
      prisma.researchLine.count({ where }),
      prisma.researchLine.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: includeTeachers
          ? {
              teachers: {
                where: {
                  teacher: {
                    deletedAt: null,
                    // Solo incluir publicados si se pide status=published (landing)
                    ...(status === "published" ? { published: true } : {}),
                  },
                },
                include: {
                  teacher: {
                    select: {
                      id: true,
                      name: true,
                      degree: true,
                      avatarUrl: true,
                      specialty: true,
                      email: true,
                      published: true,
                    },
                  },
                },
                orderBy: [
                  { role: "asc" }, // coordinador first
                  { joinedAt: "asc" },
                ],
              },
            }
          : undefined,
      }),
    ]);

    // Transform data to include computed fields
    const transformedData = researchLines.map((line) => {
      const data: Record<string, unknown> = { ...line };

      if (includeTeachers && "teachers" in line) {
        const teachers = line.teachers as Array<{
          role: string;
          joinedAt: Date;
          teacher: {
            id: string;
            name: string;
            degree: string | null;
            avatarUrl: string | null;
            specialty: string | null;
            email: string | null;
          };
        }>;

        // Find coordinator
        const coordinatorRel = teachers.find((t) => t.role === "coordinador");
        if (coordinatorRel) {
          data.coordinatorTeacher = coordinatorRel.teacher;
        }

        // Count members
        data.teacherCount = teachers.length;
      }

      return data;
    });

    return NextResponse.json({
      data: transformedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching research lines:", error);
    return NextResponse.json(
      { error: "Error al obtener líneas de investigación" },
      { status: 500 }
    );
  }
}

// POST /api/research - Crear línea de investigación
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const result = researchLineSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Crear línea de investigación
    const researchLine = await prisma.researchLine.create({
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        coordinator: data.coordinator,
        members: data.members,
        href: data.href,
        published: data.published,
        order: data.order,
      },
    });

    return NextResponse.json({ data: researchLine }, { status: 201 });
  } catch (error) {
    console.error("Error creating research line:", error);
    return NextResponse.json(
      { error: "Error al crear línea de investigación" },
      { status: 500 }
    );
  }
}
