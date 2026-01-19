"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT DOCUMENT PAGE
// Formulario para editar documento existente
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, FileText, ExternalLink, Loader2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/admin/FileUpload";
import { toast } from "sonner";

const documentCategories = [
  { value: "reglamentos", label: "Reglamentos" },
  { value: "formatos", label: "Formatos" },
  { value: "manuales", label: "Manuales" },
  { value: "investigacion", label: "Investigación" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDocumentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentFile, setCurrentFile] = useState<{
    url: string;
    type: string;
    size: string;
  } | null>(null);
  const [downloads, setDownloads] = useState(0);
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

  // Fetch document data from API
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(`/api/documents/${id}`);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error(json.error || "Error al cargar documento");
        }

        const data = json.data;
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "formatos",
          published: data.published ?? true,
        });
        setCurrentFile({
          url: data.fileUrl,
          type: data.fileType || "pdf",
          size: data.fileSize || "",
        });
        setDownloads(data.downloads || 0);
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Error al cargar el documento");
      } finally {
        setIsFetching(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Por favor ingresa un título");
      return;
    }

    setIsLoading(true);

    try {
      let fileUrl = currentFile?.url;
      let fileType = currentFile?.type;
      let fileSize = currentFile?.size;

      // Si hay nuevo archivo, subirlo primero con nomenclatura profesional
      if (file) {
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

        fileUrl = uploadJson.data.filePath; // Path interno (storage/documents/...)
        fileType = getFileType(file);
        fileSize = formatFileSize(file.size);
      }

      // Actualizar documento en BD
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
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

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar documento");
      }

      toast.success("Documento actualizado exitosamente");
      router.push("/admin/documents");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Documento eliminado");
      router.push("/admin/documents");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Error al eliminar documento");
      setIsDeleting(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold">Documento no encontrado</h1>
        <p className="text-muted-foreground mb-4">El documento que buscas no existe o fue eliminado.</p>
        <Button asChild>
          <Link href="/admin/documents">Volver a documentos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/documents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Documento</h1>
            <p className="text-muted-foreground">
              Modifica la información del documento
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El documento será
                eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current File */}
            {currentFile && !file && (
              <Card>
                <CardHeader>
                  <CardTitle>Archivo actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{formData.title || "Documento"}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentFile.type.toUpperCase()} {currentFile.size && `- ${currentFile.size}`}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/api/download/${id}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Upload - Replace */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentFile ? "Reemplazar archivo" : "Archivo"}
                </CardTitle>
                <CardDescription>
                  {currentFile
                    ? "Sube un nuevo archivo para reemplazar el actual"
                    : "Sube el documento (PDF, DOC, XLS)"}
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
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{downloads}</p>
                  <p className="text-sm text-muted-foreground">Descargas totales</p>
                </div>
              </CardContent>
            </Card>

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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Guardando...
                      </span>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar cambios
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
