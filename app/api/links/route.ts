import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const createSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  url: z.string().url("URL inválida"),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "La categoría es requerida"),
  icon: z.string().default("ExternalLink"),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { ...notDeleted };

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

    if (category && category !== "all") where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { url: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const links = await prisma.externalLink.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ data: links });
  } catch (error) {
    console.error("Links GET error:", error);
    return errorResponse("Error al obtener enlaces");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();
    const validation = validateBody(body, createSchema);
    if (validation.error) return validation.error;

    const data = validation.data;
    const link = await prisma.externalLink.create({ data });
    return successResponse(link, 201);
  } catch (error) {
    console.error("Links POST error:", error);
    return errorResponse("Error al crear enlace");
  }
}
