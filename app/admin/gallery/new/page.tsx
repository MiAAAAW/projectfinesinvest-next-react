"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW GALLERY IMAGE PAGE
// Formulario para subir nueva imagen a la galería
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, ImageIcon } from "lucide-react";
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
import { IMAGE_CATEGORIES } from "@/lib/admin-constants";

export default function NewGalleryImagePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    alt: "",
    caption: "",
    event: "",
    category: "eventos",
    published: true,
  });

  // Generar preview de la imagen
  const imagePreview = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Por favor selecciona una imagen");
      return;
    }

    setIsLoading(true);

    try {
      // Paso 1: Subir archivo a storage
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("category", "gallery");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const json = await uploadRes.json();
        throw new Error(json.error || "Error al subir archivo");
      }

      const uploadData = await uploadRes.json();
      const filePath = uploadData.data.filePath;

      // Paso 2: Crear registro en galería con el path del archivo
      const galleryRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          src: filePath,
          alt: formData.alt,
          caption: formData.caption || null,
          event: formData.event || null,
          category: formData.category,
          published: formData.published,
        }),
      });

      if (!galleryRes.ok) {
        const json = await galleryRes.json();
        throw new Error(json.error || "Error al guardar imagen");
      }

      router.push("/admin/gallery");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Error al subir la imagen");
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
          <Link href="/admin/gallery">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agregar Imagen</h1>
          <p className="text-muted-foreground">
            Sube una nueva imagen a la galería
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Imagen</CardTitle>
                <CardDescription>
                  Sube la imagen (JPG, PNG, WebP)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  maxSize={10}
                  value={file}
                  onChange={(f) => setFile(f as File | null)}
                />

                {/* Preview */}
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
                      {IMAGE_CATEGORIES.map((cat) => (
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
                  <Button type="submit" disabled={isLoading || !file}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Subiendo...
                      </span>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Subir imagen
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
