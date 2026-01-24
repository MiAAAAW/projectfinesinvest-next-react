import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { readStorageFile, getMimeFromExtension } from "@/lib/upload";
import { getCurrentUser } from "@/lib/auth";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY IMAGE API - SERVIR IMÁGENES DE GALERÍA
// GET /api/gallery/image/[id] - Sirve una imagen de galería por su ID
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

    // Buscar imagen en BD
    // Admin puede ver cualquier imagen, público solo las publicadas
    const image = await prisma.galleryImage.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { published: true }),
        ...notDeleted,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que tiene src
    if (!image.src) {
      return NextResponse.json(
        { error: "Archivo no disponible" },
        { status: 404 }
      );
    }

    // Leer archivo del storage
    const fileBuffer = await readStorageFile(image.src);

    if (!fileBuffer) {
      console.error(`Gallery image file not found: ${image.src}`);
      return NextResponse.json(
        { error: "Archivo no encontrado en el servidor" },
        { status: 404 }
      );
    }

    // Obtener content-type
    const filename = path.basename(image.src);
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
    console.error("Gallery image error:", error);
    return NextResponse.json(
      { error: "Error al obtener imagen" },
      { status: 500 }
    );
  }
}
