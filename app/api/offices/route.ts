import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const createOfficeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  location: z.string().min(1, "La ubicación es requerida"),
  building: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  schedule: z.string().optional().nullable(),
  responsible: z.string().optional().nullable(),
  icon: z.string().default("Building2"),
  mapUrl: z.string().optional().nullable().or(z.literal("")).transform(v => normalizeUrl(v, 'googleMaps')),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

// GET /api/offices - Listar oficinas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { ...notDeleted };

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

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
    return errorResponse("Error al obtener oficinas");
  }
}

// POST /api/offices - Crear oficina
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, createOfficeSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

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

    // Audit log
    await prisma.officeLog.create({
      data: {
        officeId: office.id,
        changedBy: auth.user!.id,
        action: "CREATE",
        newValue: JSON.stringify(office),
      },
    });

    return successResponse(office, 201);
  } catch (error) {
    console.error("Offices POST error:", error);
    return errorResponse("Error al crear oficina");
  }
}
