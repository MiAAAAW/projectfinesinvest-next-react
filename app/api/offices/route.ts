import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICES API
// GET /api/offices - Listar oficinas
// POST /api/offices - Crear nueva oficina
// ═══════════════════════════════════════════════════════════════════════════════

// Schema de validación para crear oficina
const createOfficeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  location: z.string().min(1, "La ubicación es requerida"),
  building: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  schedule: z.string().optional().nullable(), // JSON string
  responsible: z.string().optional().nullable(),
  icon: z.string().default("Building2"),
  mapUrl: z.string().optional().nullable().or(z.literal("")).transform(v => normalizeUrl(v, 'googleMaps')),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

// GET - Listar oficinas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // published, draft, all
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Construir filtros
    const where: Record<string, unknown> = { ...notDeleted };

    // Filtro por estado
    if (status === "published") {
      where.published = true;
    } else if (status === "draft") {
      where.published = false;
    }

    // Búsqueda
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { responsible: { contains: search, mode: "insensitive" } },
      ];
    }

    const offices = await prisma.office.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ data: offices });
  } catch (error) {
    console.error("Offices GET error:", error);
    return NextResponse.json(
      { error: "Error al obtener oficinas" },
      { status: 500 }
    );
  }
}

// POST - Crear oficina
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const validation = createOfficeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Crear oficina
    const office = await prisma.office.create({
      data: {
        name: data.name,
        description: data.description || null,
        location: data.location,
        building: data.building || null,
        floor: data.floor || null,
        phone: data.phone || null,
        email: data.email || null,
        schedule: data.schedule || null,
        responsible: data.responsible || null,
        icon: data.icon || "Building2",
        mapUrl: data.mapUrl || null,
        published: data.published ?? true,
        order: data.order ?? 0,
      },
    });

    // Log de creación
    await prisma.officeLog.create({
      data: {
        officeId: office.id,
        changedBy: user.id,
        action: "CREATE",
        newValue: JSON.stringify(office),
      },
    });

    return NextResponse.json({ data: office }, { status: 201 });
  } catch (error) {
    console.error("Offices POST error:", error);
    return NextResponse.json(
      { error: "Error al crear oficina" },
      { status: 500 }
    );
  }
}
