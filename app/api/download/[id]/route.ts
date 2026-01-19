import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { readStorageFile, getMimeFromExtension } from "@/lib/upload";
import { getCurrentUser } from "@/lib/auth";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════════
// DOWNLOAD API - DESCARGA SEGURA DE ARCHIVOS
// GET /api/download/[id] - Descarga un documento por su ID
// - Verifica que el documento exista y esté publicado (o usuario admin)
// - Incrementa contador de descargas (solo para público)
// - Sirve el archivo desde storage privado
// ═══════════════════════════════════════════════════════════════════════════════

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar si se quiere forzar descarga
    const { searchParams } = new URL(request.url);
    const forceDownload = searchParams.get("download") === "true";

    // Verificar si hay usuario admin logueado
    const user = await getCurrentUser();
    const isAdmin = !!user;

    // Buscar documento en BD
    // Admin puede ver cualquier documento, público solo publicados
    const document = await prisma.document.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { published: true }), // Admin ve todos, público solo publicados
        ...notDeleted,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que tiene archivo
    if (!document.fileUrl) {
      return NextResponse.json(
        { error: "Archivo no disponible" },
        { status: 404 }
      );
    }

    // Leer archivo del storage privado
    const fileBuffer = await readStorageFile(document.fileUrl);

    if (!fileBuffer) {
      console.error(`File not found: ${document.fileUrl}`);
      return NextResponse.json(
        { error: "Archivo no encontrado en el servidor" },
        { status: 404 }
      );
    }

    // Incrementar contador de descargas solo para usuarios públicos (no admin)
    if (!isAdmin) {
      prisma.document.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      }).catch(err => console.error("Error updating download count:", err));
    }

    // Obtener nombre de archivo y content-type
    const filename = path.basename(document.fileUrl);
    const contentType = getMimeFromExtension(filename);

    // Crear nombre amigable para descarga (usar título del documento)
    const safeTitle = document.title
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);
    const ext = path.extname(filename);
    const downloadName = `${safeTitle}${ext}`;

    // Servir archivo
    // inline = mostrar en navegador (PDFs, imágenes)
    // attachment = forzar descarga
    const disposition = forceDownload ? "attachment" : "inline";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${downloadName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate", // Sin cache para desarrollo
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Error al descargar el archivo" },
      { status: 500 }
    );
  }
}
