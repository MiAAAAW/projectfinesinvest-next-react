import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD HELPER - ALMACENAMIENTO SEGURO
// - Archivos en /storage/ (PRIVADO, no accesible directamente)
// - Descarga solo via API /api/download/[id]
// - Nomenclatura: {CAT}-{YYMMDD}-{XXXXXXXXXXXX}.{ext} (12 chars random)
// ═══════════════════════════════════════════════════════════════════════════════

export type UploadCategory = "images" | "documents" | "gallery" | "authorities";

// Subcategorías para documentos
export type DocumentSubCategory = "reglamentos" | "formatos" | "manuales" | "investigacion";

interface UploadResult {
  success: boolean;
  filePath?: string;  // Path interno (storage/...)
  filename?: string;
  error?: string;
}

interface UploadOptions {
  category: UploadCategory;
  subCategory?: DocumentSubCategory;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREFIJOS POR CATEGORÍA
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_PREFIXES: Record<UploadCategory, string> = {
  images: "IMG",
  documents: "DOC",
  gallery: "GAL",
  authorities: "AUT",
};

const DOCUMENT_PREFIXES: Record<DocumentSubCategory, string> = {
  reglamentos: "REG",
  formatos: "FRM",
  manuales: "MAN",
  investigacion: "INV",
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE ARCHIVOS
// ═══════════════════════════════════════════════════════════════════════════════

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECTORIO BASE - PRIVADO (fuera de /public/)
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_BASE = path.join(process.cwd(), "storage");

/**
 * Genera un código random de N caracteres (mayúsculas + números)
 * 12 chars = 36^12 = 4.7 × 10^18 combinaciones (prácticamente imposible de enumerar)
 */
function generateRandomCode(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Genera fecha compacta YYMMDD
 */
function getCompactDate(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * Genera nombre de archivo seguro
 * Formato: {CAT}-{YYMMDD}-{XXXXXXXXXXXX}.{ext}
 * Ejemplo: REG-260119-A1B2C3D4E5F6.pdf (12 chars random)
 */
function generateSecureFilename(
  originalName: string,
  options: UploadOptions
): string {
  const ext = path.extname(originalName).toLowerCase();

  let prefix: string;
  if (options.category === "documents" && options.subCategory) {
    prefix = DOCUMENT_PREFIXES[options.subCategory];
  } else {
    prefix = CATEGORY_PREFIXES[options.category];
  }

  const date = getCompactDate();
  const code = generateRandomCode(12); // 12 caracteres para máxima seguridad

  return `${prefix}-${date}-${code}${ext}`;
}

/**
 * Valida el tipo de archivo según la categoría
 */
function validateFileType(
  mimeType: string,
  category: UploadCategory
): boolean {
  if (category === "images" || category === "gallery" || category === "authorities") {
    return ALLOWED_IMAGE_TYPES.includes(mimeType);
  }
  if (category === "documents") {
    return [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES].includes(mimeType);
  }
  return false;
}

/**
 * Obtiene la extensión permitida para un tipo MIME
 */
export function getExtensionFromMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  };
  return mimeToExt[mimeType] || "";
}

/**
 * Obtiene el content-type para una extensión
 */
export function getMimeFromExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const extToMime: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return extToMime[ext] || "application/octet-stream";
}

/**
 * Sube un archivo a /storage/{category}/ (PRIVADO)
 * Retorna el path interno, NO una URL pública
 */
export async function uploadFile(
  file: File,
  category: UploadCategory,
  subCategory?: DocumentSubCategory
): Promise<UploadResult> {
  try {
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Validar tipo
    if (!validateFileType(file.type, category)) {
      return {
        success: false,
        error: `Tipo de archivo no permitido: ${file.type}`,
      };
    }

    // Crear directorio si no existe
    const uploadDir = path.join(STORAGE_BASE, category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generar nombre seguro (12 chars random)
    const filename = generateSecureFilename(file.name, { category, subCategory });
    const filepath = path.join(uploadDir, filename);

    // Convertir File a Buffer y escribir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Retornar path interno (no URL pública)
    const internalPath = `storage/${category}/${filename}`;

    return {
      success: true,
      filePath: internalPath,
      filename,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Error al subir el archivo",
    };
  }
}

/**
 * Lee un archivo del storage privado
 * Compatible con formato antiguo (/uploads/...) y nuevo (storage/...)
 */
export async function readStorageFile(filePath: string): Promise<Buffer | null> {
  try {
    let fullPath: string;

    // Compatibilidad: formato antiguo /uploads/... → public/uploads/...
    if (filePath.startsWith("/uploads/") || filePath.startsWith("uploads/")) {
      const cleanPath = filePath.replace(/^\//, ""); // Quitar / inicial si existe
      fullPath = path.join(process.cwd(), "public", cleanPath);
    }
    // Formato nuevo: storage/...
    else if (filePath.startsWith("storage/")) {
      fullPath = path.join(process.cwd(), filePath);
    }
    // Fallback: intentar como path directo
    else {
      fullPath = path.join(process.cwd(), filePath);
    }

    if (!existsSync(fullPath)) {
      console.error(`File does not exist at: ${fullPath}`);
      return null;
    }
    return await readFile(fullPath);
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

/**
 * Elimina un archivo del storage
 * Compatible con formato antiguo (/uploads/...) y nuevo (storage/...)
 */
export async function deleteStorageFile(filePath: string): Promise<boolean> {
  try {
    let fullPath: string;

    // Compatibilidad: formato antiguo /uploads/... → public/uploads/...
    if (filePath.startsWith("/uploads/") || filePath.startsWith("uploads/")) {
      const cleanPath = filePath.replace(/^\//, "");
      fullPath = path.join(process.cwd(), "public", cleanPath);
    }
    // Formato nuevo: storage/...
    else if (filePath.startsWith("storage/")) {
      fullPath = path.join(process.cwd(), filePath);
    }
    // Fallback
    else {
      fullPath = path.join(process.cwd(), filePath);
    }

    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Sube múltiples archivos
 */
export async function uploadFiles(
  files: File[],
  category: UploadCategory,
  subCategory?: DocumentSubCategory
): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadFile(file, category, subCategory)));
}
