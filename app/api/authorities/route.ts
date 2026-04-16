import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

const authoritySchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  role: z.string().min(1, "Cargo requerido"),
  department: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  officeHours: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable().transform(v => normalizeUrl(v, 'generic')),
  linkedin: z.string().optional().nullable().transform(v => normalizeUrl(v, 'linkedin')),
  orcid: z.string().optional().nullable().transform(v => normalizeUrl(v, 'orcid')),
  googleScholar: z.string().optional().nullable().transform(v => normalizeUrl(v, 'googleScholar')),
  published: z.boolean().default(true),
  order: z.number().default(0),
});

// GET /api/authorities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { ...notDeleted };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "published") where.published = true;
    else if (status === "draft") where.published = false;

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
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching authorities:", error);
    return errorResponse("Error al obtener autoridades");
  }
}

// POST /api/authorities
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await request.json();

    const validation = validateBody(body, authoritySchema);
    if (validation.error) return validation.error;

    const data = validation.data;

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

    return successResponse(authority, 201);
  } catch (error) {
    console.error("Error creating authority:", error);
    return errorResponse("Error al crear autoridad");
  }
}
