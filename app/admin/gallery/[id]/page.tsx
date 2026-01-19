"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT GALLERY IMAGE PAGE
// Formulario para editar imagen de la galería
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// Mock data
const mockImage = {
  id: "1",
  src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
  alt: "Ceremonia de graduación",
  caption: "Ceremonia de graduación 2025",
  event: "Graduación",
  category: "eventos",
  published: true,
  order: 1,
};

const imageCategories = [
  { value: "eventos", label: "Eventos" },
  { value: "instalaciones", label: "Instalaciones" },
  { value: "academico", label: "Académico" },
  { value: "investigacion", label: "Investigación" },
];

export default function EditGalleryImagePage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    alt: "",
    caption: "",
    event: "",
    category: "eventos",
    published: true,
  });

  // Generar preview de la nueva imagen
  const imagePreview = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Simular fetch de datos
  useEffect(() => {
    // TODO: Fetch desde Supabase usando params.id
    setTimeout(() => {
      setFormData({
        alt: mockImage.alt,
        caption: mockImage.caption,
        event: mockImage.event || "",
        category: mockImage.category,
        published: mockImage.published,
      });
      setCurrentImage(mockImage.src);
      setIsFetching(false);
    }, 500);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Actualizar en Supabase (subir nueva imagen si existe)
    console.log("Actualizar imagen:", params.id, { ...formData, file });

    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/gallery");
    }, 1000);
  };

  const handleDelete = async () => {
    // TODO: Eliminar de Supabase
    console.log("Eliminar imagen:", params.id);
    router.push("/admin/gallery");
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
            <Skeleton className="h-[300px] w-full rounded-lg" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/gallery">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Imagen</h1>
            <p className="text-muted-foreground">
              Modifica la información de la imagen
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La imagen será eliminada
                permanentemente de la galería.
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
            {/* Current Image */}
            {currentImage && !imagePreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Imagen actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={currentImage}
                      alt={formData.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Upload - Replace */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentImage ? "Reemplazar imagen" : "Imagen"}
                </CardTitle>
                <CardDescription>
                  {currentImage
                    ? "Sube una nueva imagen para reemplazar la actual"
                    : "Sube la imagen (JPG, PNG, WebP)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  maxSize={10}
                  value={file}
                  onChange={(f) => setFile(f as File | null)}
                />

                {/* Preview of new image */}
                {imagePreview && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
                <CardDescription>
                  Detalles de la imagen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Alt text */}
                <div className="space-y-2">
                  <Label htmlFor="alt">Texto alternativo *</Label>
                  <Input
                    id="alt"
                    placeholder="Descripción breve de la imagen"
                    value={formData.alt}
                    onChange={(e) => updateField("alt", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Importante para accesibilidad y SEO
                  </p>
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <Label htmlFor="caption">Título/Caption</Label>
                  <Input
                    id="caption"
                    placeholder="Título que se mostrará en la galería"
                    value={formData.caption}
                    onChange={(e) => updateField("caption", e.target.value)}
                  />
                </div>

                {/* Event */}
                <div className="space-y-2">
                  <Label htmlFor="event">Evento relacionado</Label>
                  <Input
                    id="event"
                    placeholder="Ej: Graduación 2025, Conferencia, etc."
                    value={formData.event}
                    onChange={(e) => updateField("event", e.target.value)}
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
                      {imageCategories.map((cat) => (
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
                      Visible en la galería
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
                    <Link href="/admin/gallery">Cancelar</Link>
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
