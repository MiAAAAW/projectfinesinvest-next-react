import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { normalizeUrl } from "@/lib/url-utils";

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICE BY ID API
// GET /api/offices/[id] - Obtener una oficina
// PUT /api/offices/[id] - Actualizar oficina
// DELETE /api/offices/[id] - Eliminar oficina (soft delete)
// ═══════════════════════════════════════════════════════════════════════════════

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema de validación para actualizar
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

// GET - Obtener una oficina
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const office = await prisma.office.findFirst({
      where: { id, ...notDeleted },
    });

    if (!office) {
      return NextResponse.json(
        { error: "Oficina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: office });
  } catch (error) {
    console.error("Office GET error:", error);
    return NextResponse.json(
      { error: "Error al obtener oficina" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar oficina
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que existe
    const existing = await prisma.office.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Oficina no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validar datos
    const validation = updateOfficeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Actualizar
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

    // Log de actualización
    await prisma.officeLog.create({
      data: {
        officeId: office.id,
        changedBy: user.id,
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(office),
      },
    });

    return NextResponse.json({ data: office });
  } catch (error) {
    console.error("Office PUT error:", error);
    return NextResponse.json(
      { error: "Error al actualizar oficina" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar oficina (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que existe
    const existing = await prisma.office.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Oficina no encontrada" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.office.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Log de eliminación
    await prisma.officeLog.create({
      data: {
        officeId: id,
        changedBy: user.id,
        action: "DELETE",
        oldValue: JSON.stringify(existing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Office DELETE error:", error);
    return NextResponse.json(
      { error: "Error al eliminar oficina" },
      { status: 500 }
    );
  }
}
