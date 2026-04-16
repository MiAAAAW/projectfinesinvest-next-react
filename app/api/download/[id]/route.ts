import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { readStorageFile, getMimeFromExtension } from "@/lib/upload";
import { getPresignedDownloadUrl, getR2KeyFromUrl } from "@/lib/r2";
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

    // Obtener nombre de archivo y extensión
    const filename = path.basename(document.fileUrl);
    const ext = path.extname(filename);

    // Crear nombre amigable para descarga (usar título del documento)
    const safeTitle = document.title
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);
    const downloadName = `${safeTitle}${ext}`;

    // ═══════════════════════════════════════════════════════════════════════════
    // FLUJO 1: Archivo en Cloudflare R2 (formato nuevo) → Presigned URL
    // ═══════════════════════════════════════════════════════════════════════════
    const r2Key = getR2KeyFromUrl(document.fileUrl);
    if (r2Key) {
      // Incrementar contador de descargas solo para usuarios públicos
      if (!isAdmin) {
        prisma.document.update({
          where: { id },
          data: { downloads: { increment: 1 } },
        }).catch(err => console.error("Error updating download count:", err));
      }

      // Generar URL firmada con Content-Disposition personalizado
      const signedUrl = await getPresignedDownloadUrl(r2Key, {
        downloadFilename: downloadName,
        forceDownload,
        expiresIn: 300, // 5 minutos
      });

      // Redirect al browser - descarga directo de R2, no pasa por este server
      return NextResponse.redirect(signedUrl);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FLUJO 2: Archivo en storage local (legacy) → leer disco y servir buffer
    // ═══════════════════════════════════════════════════════════════════════════
    const fileBuffer = await readStorageFile(document.fileUrl);

    if (!fileBuffer) {
      console.error(`File not found: ${document.fileUrl}`);
      return NextResponse.json(
        { error: "Archivo no encontrado en el servidor" },
        { status: 404 }
      );
    }

    // Incrementar contador de descargas solo para usuarios públicos
    if (!isAdmin) {
      prisma.document.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      }).catch(err => console.error("Error updating download count:", err));
    }

    const contentType = getMimeFromExtension(filename);
    const disposition = forceDownload ? "attachment" : "inline";

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${downloadName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
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
