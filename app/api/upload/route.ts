import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile, uploadFiles, type UploadCategory, type DocumentSubCategory } from "@/lib/upload";

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD API
// POST /api/upload - Subir archivos a /public/uploads/
// Nomenclatura profesional: {CAT}-{YYMMDD}-{XXXX}.{ext}
// Límite: 50MB para documentos institucionales
// App Router usa formData() nativo sin límite de bodyParser
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener form data
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    const category = (formData.get("category") as UploadCategory) || "images";
    const subCategory = formData.get("subCategory") as DocumentSubCategory | null;

    // Validar categoría
    const validCategories: UploadCategory[] = ["images", "documents", "gallery", "authorities"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Categoría inválida" },
        { status: 400 }
      );
    }

    // Validar subcategoría para documentos
    if (category === "documents" && subCategory) {
      const validSubCategories: DocumentSubCategory[] = ["reglamentos", "formatos", "manuales", "investigacion"];
      if (!validSubCategories.includes(subCategory)) {
        return NextResponse.json(
          { error: "Subcategoría de documento inválida" },
          { status: 400 }
        );
      }
    }

    // Validar que hay archivos
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron archivos" },
        { status: 400 }
      );
    }

    // Subir archivos (ahora retorna filePath en vez de url)
    if (files.length === 1) {
      const result = await uploadFile(files[0], category, subCategory || undefined);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        data: {
          filePath: result.filePath, // Path interno: storage/documents/...
          filename: result.filename,
        },
      });
    }

    // Múltiples archivos
    const results = await uploadFiles(files, category, subCategory || undefined);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (successful.length === 0) {
      return NextResponse.json(
        { error: "No se pudo subir ningún archivo", details: failed },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: successful.map((r) => ({
        filePath: r.filePath, // Path interno
        filename: r.filename,
      })),
      failed: failed.length > 0 ? failed : undefined,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
