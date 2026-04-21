import { NextRequest } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import { requireAuth, errorResponse, successResponse } from "@/lib/api-utils";

// Permitir archivos grandes (PDFs de alta resolución, etc.)
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutos para uploads grandes

// Max file size: 150MB
const MAX_FILE_SIZE = 150 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Resolver folder — prioridad: `folder` explícito > `category+subCategory` (legacy) > "uploads" (fallback)
    let folder = (formData.get("folder") as string) || "";
    if (!folder) {
      const category = formData.get("category") as string | null;
      const subCategory = formData.get("subCategory") as string | null;
      if (category) {
        folder = subCategory ? `${category}/${subCategory}` : category;
      } else {
        folder = "uploads";
      }
    }

    if (!file) {
      return errorResponse("No se envió ningún archivo", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse("El archivo excede el tamaño máximo de 150MB", 400);
    }

    if (!ALLOWED_TYPES[file.type]) {
      return errorResponse("Tipo de archivo no permitido", 400);
    }

    const ext = ALLOWED_TYPES[file.type];
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 50);
    const key = `${folder}/${timestamp}-${safeName}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, key, file.type);

    return successResponse({
      url,
      key,
      fileName: file.name,
      fileType: ext,
      fileSize: formatFileSize(file.size),
      contentType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Error al subir archivo");
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
