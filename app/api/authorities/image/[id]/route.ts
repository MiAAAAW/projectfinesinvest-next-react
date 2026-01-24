import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { readStorageFile, getMimeFromExtension } from "@/lib/upload";
import { getCurrentUser } from "@/lib/auth";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHORITY AVATAR API - SERVIR AVATARES DE AUTORIDADES
// GET /api/authorities/image/[id] - Sirve el avatar de una autoridad por su ID
// Admins pueden ver cualquier imagen, público solo las publicadas
// ═══════════════════════════════════════════════════════════════════════════════

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar si hay usuario admin logueado
    const user = await getCurrentUser();
    const isAdmin = !!user;

    // Buscar autoridad en BD
    // Admin puede ver cualquier autoridad, público solo las publicadas
    const authority = await prisma.authority.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { published: true }),
        ...notDeleted,
      },
    });

    if (!authority) {
      return NextResponse.json(
        { error: "Autoridad no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que tiene avatar
    if (!authority.avatarUrl) {
      return NextResponse.json(
        { error: "Avatar no disponible" },
        { status: 404 }
      );
    }

    // Leer archivo del storage
    const fileBuffer = await readStorageFile(authority.avatarUrl);

    if (!fileBuffer) {
      console.error(`Authority avatar file not found: ${authority.avatarUrl}`);
      return NextResponse.json(
        { error: "Archivo no encontrado en el servidor" },
        { status: 404 }
      );
    }

    // Obtener content-type
    const filename = path.basename(authority.avatarUrl);
    const contentType = getMimeFromExtension(filename);

    // Servir imagen con cache
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable", // Cache 1 año
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Authority avatar error:", error);
    return NextResponse.json(
      { error: "Error al obtener avatar" },
      { status: 500 }
    );
  }
}
