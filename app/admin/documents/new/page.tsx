"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW DOCUMENT PAGE
// Formulario para subir nuevo documento
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/admin/FileUpload";
import { toast } from "sonner";

const documentCategories = [
  { value: "reglamentos", label: "Reglamentos" },
  { value: "formatos", label: "Formatos" },
  { value: "manuales", label: "Manuales" },
  { value: "investigacion", label: "Investigación" },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "formatos",
    published: true,
  });

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Obtener tipo de archivo basado en extensión/MIME
  const getFileType = (file: File): string => {
    if (file.type === "application/pdf") return "pdf";
    if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) return "doc";
    if (file.type.includes("excel") || file.type.includes("spreadsheet") || file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) return "xls";
    if (file.type.includes("powerpoint") || file.type.includes("presentation") || file.name.endsWith(".ppt") || file.name.endsWith(".pptx")) return "ppt";
    return "doc";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Por favor ingresa un título");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Subir archivo a /api/upload con nomenclatura profesional
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("category", "documents");
      uploadFormData.append("subCategory", formData.category); // REG, FRM, MAN, INV

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadJson.error || "Error al subir archivo");
      }

      const fileUrl = uploadJson.data.filePath; // Path interno (storage/documents/...)
      const fileType = getFileType(file);
      const fileSize = formatFileSize(file.size);

      // 2. Crear documento en BD
      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          fileUrl,
          fileType,
          fileSize,
          category: formData.category,
          published: formData.published,
        }),
      });

      const docJson = await docRes.json();

      if (!docRes.ok) {
        throw new Error(docJson.error || "Error al crear documento");
      }

      toast.success("Documento subido exitosamente");
      router.push("/admin/documents");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error instanceof Error ? error.message : "Error al subir documento");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subir Documento</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo documento al repositorio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Archivo</CardTitle>
                <CardDescription>
                  Sube el documento (PDF, DOC, XLS)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  maxSize={50}
                  value={file}
                  onChange={(f) => setFile(f as File | null)}
                />
              </CardContent>
            </Card>

            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
                <CardDescription>
                  Detalles del documento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Nombre del documento"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descripción del documento..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateField("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Published */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="published">Publicar</Label>
                    <p className="text-xs text-muted-foreground">
                      Visible en el landing
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => updateField("published", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isLoading || !file}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Subiendo...
                      </span>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Subir documento
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/documents">Cancelar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
