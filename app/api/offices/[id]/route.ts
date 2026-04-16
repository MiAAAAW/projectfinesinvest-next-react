import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";
import { requireAuth, validateBody, errorResponse, successResponse } from "@/lib/api-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateOfficeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional().nullable(),
  location: z.string().min(1, "La ubicación es requerida").optional(),
  building: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  schedule: z.string().optional().nullable(),
  responsible: z.string().optional().nullable(),
  icon: z.string().optional(),
  mapUrl: z.string().optional().nullable().or(z.literal("")).transform(v => normalizeUrl(v, 'googleMaps')),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
});

// GET /api/offices/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const office = await prisma.office.findFirst({
      where: { id, ...notDeleted },
    });

    if (!office) return errorResponse("Oficina no encontrada", 404);

    return successResponse(office);
  } catch (error) {
    console.error("Office GET error:", error);
    return errorResponse("Error al obtener oficina");
  }
}

// PUT /api/offices/[id] - con audit log
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.office.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Oficina no encontrada", 404);

    const body = await request.json();

    const validation = validateBody(body, updateOfficeSchema);
    if (validation.error) return validation.error;

    const data = validation.data;

    const office = await prisma.office.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.building !== undefined && { building: data.building }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.schedule !== undefined && { schedule: data.schedule }),
        ...(data.responsible !== undefined && { responsible: data.responsible }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.mapUrl !== undefined && { mapUrl: data.mapUrl || null }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    // Audit log
    await prisma.officeLog.create({
      data: {
        officeId: office.id,
        changedBy: auth.user!.id,
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(office),
      },
    });

    return successResponse(office);
  } catch (error) {
    console.error("Office PUT error:", error);
    return errorResponse("Error al actualizar oficina");
  }
}

// DELETE /api/offices/[id] - soft delete con audit log
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.office.findFirst({
      where: { id, ...notDeleted },
    });
    if (!existing) return errorResponse("Oficina no encontrada", 404);

    await prisma.office.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Audit log
    await prisma.officeLog.create({
      data: {
        officeId: id,
        changedBy: auth.user!.id,
        action: "DELETE",
        oldValue: JSON.stringify(existing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Office DELETE error:", error);
    return errorResponse("Error al eliminar oficina");
  }
}
