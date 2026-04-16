import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const createGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  websiteUrl: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  leaderId: z.string().optional().nullable(),
  researchLineId: z.string().optional().nullable(),
  status: z.string().default("activo"),
  published: z.boolean().default(true),
});

// GET /api/research-groups - Listar grupos de investigación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { ...notDeleted };

    if (status === "activo") where.status = "activo";
    else if (status === "inactivo") where.status = "inactivo";
    else if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const groups = await prisma.researchGroup.findMany({
      where,
      include: {
        leader: {
          select: { id: true, name: true },
        },
        researchLine: {
          select: { id: true, title: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: groups });
  } catch (error) {
    console.error("ResearchGroups GET error:", error);
    return errorResponse("Error al obtener grupos de investigación");
  }
}

// POST /api/research-groups - Crear grupo de investigación
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, createGroupSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    // Verificar código único si se proporcionó
    if (data.code) {
      const existing = await prisma.researchGroup.findUnique({
        where: { code: data.code },
      });
      if (existing) {
        return errorResponse("Ya existe un grupo con ese código", 400);
      }
    }

    const group = await prisma.researchGroup.create({
      data: {
        name: data.name,
        description: data.description || null,
        code: data.code || null,
        websiteUrl: data.websiteUrl || null,
        leaderId: data.leaderId || null,
        researchLineId: data.researchLineId || null,
        status: data.status,
        published: data.published ?? true,
      },
      include: {
        leader: {
          select: { id: true, name: true },
        },
        researchLine: {
          select: { id: true, title: true },
        },
      },
    });

    return successResponse(group, 201);
  } catch (error) {
    console.error("ResearchGroups POST error:", error);
    return errorResponse("Error al crear grupo de investigación");
  }
}
