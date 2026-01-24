import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHORITIES API
// GET /api/authorities - Listar autoridades
// POST /api/authorities - Crear autoridad (requiere auth)
// ═══════════════════════════════════════════════════════════════════════════════

// Schema de validación para crear autoridad
const authoritySchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  role: z.string().min(1, "Cargo requerido"),
  department: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  officeHours: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  orcid: z.string().url().optional().nullable(),
  googleScholar: z.string().url().optional().nullable(),
  published: z.boolean().default(true),
  order: z.number().default(0),
});

// GET /api/authorities - Listar autoridades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Construir filtros
    const where: Record<string, unknown> = {
      ...notDeleted,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    // Obtener total y datos
    const [total, authorities] = await Promise.all([
      prisma.authority.count({ where }),
      prisma.authority.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: authorities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching authorities:", error);
    return NextResponse.json(
      { error: "Error al obtener autoridades" },
      { status: 500 }
    );
  }
}

// POST /api/authorities - Crear autoridad
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const result = authoritySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Crear autoridad
    const authority = await prisma.authority.create({
      data: {
        name: data.name,
        role: data.role,
        department: data.department,
        bio: data.bio,
        email: data.email,
        phone: data.phone,
        officeHours: data.officeHours,
        avatarUrl: data.avatarUrl,
        linkedin: data.linkedin,
        orcid: data.orcid,
        googleScholar: data.googleScholar,
        published: data.published,
        order: data.order,
      },
    });

    return NextResponse.json({ data: authority }, { status: 201 });
  } catch (error) {
    console.error("Error creating authority:", error);
    return NextResponse.json(
      { error: "Error al crear autoridad" },
      { status: 500 }
    );
  }
}
