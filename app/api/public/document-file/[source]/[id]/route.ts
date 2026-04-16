import { NextRequest, NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getPresignedDownloadUrl, getR2KeyFromUrl } from "@/lib/r2";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC FILE SERVER: /api/public/document-file/[source]/[id]
// Sirve archivos PDF de las 3 fuentes: document | resolution | agreement
// Usa presigned URLs de R2 (redirect 302) para no consumir banda del server
// ═══════════════════════════════════════════════════════════════════════════════

interface RouteParams {
  params: Promise<{ source: string; id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { source, id } = await params;

    let record: { fileUrl: string | null; title: string } | null = null;

    // Buscar en la fuente correcta
    if (source === "document") {
      const d = await prisma.document.findFirst({
        where: { id, ...notDeleted, published: true },
        select: { fileUrl: true, title: true },
      });
      if (d) record = { fileUrl: d.fileUrl, title: d.title };
    } else if (source === "resolution") {
      const r = await prisma.resolution.findFirst({
        where: { id, ...notDeleted, published: true },
        select: { fileUrl: true, number: true },
      });
      if (r?.fileUrl) record = { fileUrl: r.fileUrl, title: `Resolucion_${r.number}` };
    } else if (source === "agreement") {
      const a = await prisma.agreement.findFirst({
        where: { id, ...notDeleted, published: true },
        select: { fileUrl: true, title: true },
      });
      if (a?.fileUrl) record = { fileUrl: a.fileUrl, title: a.title };
    } else {
      return NextResponse.json({ error: "Fuente inválida" }, { status: 400 });
    }

    if (!record || !record.fileUrl) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    // Nombre amigable de descarga
    const ext = path.extname(record.fileUrl) || ".pdf";
    const safeTitle = record.title
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 60);
    const downloadName = `${safeTitle}${ext}`;

    // Si está en R2 → presigned URL con redirect
    const r2Key = getR2KeyFromUrl(record.fileUrl);
    if (r2Key) {
      const signedUrl = await getPresignedDownloadUrl(r2Key, {
        downloadFilename: downloadName,
        forceDownload: false,
        expiresIn: 300,
      });
      return NextResponse.redirect(signedUrl);
    }

    // Fallback: redirect directo (si es URL externa o legacy)
    return NextResponse.redirect(record.fileUrl);
  } catch (error) {
    console.error("Error serving document file:", error);
    return NextResponse.json(
      { error: "Error al obtener archivo" },
      { status: 500 }
    );
  }
}
