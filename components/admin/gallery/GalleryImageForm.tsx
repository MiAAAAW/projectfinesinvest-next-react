"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// GalleryImageForm · formulario reutilizable (crear + editar) para galería.
// Usado por:
//   - Modal in-page en /admin/gallery (crear + editar — flujo rápido)
//   - Ruta standalone /admin/gallery/new (deep-link compat)
//
// Modo crear  → POST /api/gallery con src=url R2
// Modo editar → PUT /api/gallery/{id}; si hay archivo nuevo sube a R2 y reemplaza
// ═══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Save } from "lucide-react";
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
import { FileUpload } from "@/components/admin/FileUpload";
import { IMAGE_CATEGORIES } from "@/lib/admin-constants";
import { toast } from "sonner";

export interface GalleryImageDTO {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
  event: string | null;
  category: string | null;
  published: boolean;
}

interface FormValues {
  alt: string;
  caption: string;
  event: string;
  category: string;
  published: boolean;
}

function initialValues(image?: GalleryImageDTO): FormValues {
  return {
    alt: image?.alt ?? "",
    caption: image?.caption ?? "",
    event: image?.event ?? "",
    category: image?.category ?? IMAGE_CATEGORIES[0]?.value ?? "eventos",
    published: image?.published ?? true,
  };
}

function currentSrcFor(image: GalleryImageDTO): string {
  if (image.src && /^https?:\/\//i.test(image.src)) return image.src;
  return `/api/gallery/image/${image.id}`;
}

export interface GalleryImageFormProps {
  /** Si se pasa, es modo edición; si no, es modo creación. */
  image?: GalleryImageDTO;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function GalleryImageForm({
  image,
  onSuccess,
  onCancel,
}: GalleryImageFormProps) {
  const isEdit = !!image;

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<FormValues>(() => initialValues(image));

  const newPreview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  const displayPreview = newPreview ?? (image ? currentSrcFor(image) : null);

  const updateField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !file) {
      toast.error("Selecciona una imagen primero");
      return;
    }
    if (!values.alt.trim()) {
      toast.error("El texto alternativo es requerido");
      return;
    }

    setLoading(true);
    try {
      // [1] Si hay archivo nuevo → subir a R2 antes del save
      let newUrl: string | undefined;
      if (file) {
        const uploadFd = new FormData();
        uploadFd.append("file", file);
        uploadFd.append(
          "folder",
          values.category ? `gallery/${values.category}` : "gallery",
        );

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFd,
        });
        if (!uploadRes.ok) {
          const json = await uploadRes.json().catch(() => ({}));
          throw new Error(json.error || "Error al subir archivo");
        }
        const uploadData = await uploadRes.json();
        newUrl = uploadData?.data?.url;
        if (!newUrl) throw new Error("La subida no devolvió una URL válida");
      }

      // [2] Crear o actualizar el registro
      const payload: Record<string, unknown> = {
        alt: values.alt.trim(),
        caption: values.caption.trim() || null,
        event: values.event.trim() || null,
        category: values.category,
        published: values.published,
      };
      if (newUrl) payload.src = newUrl;

      if (isEdit) {
        const res = await fetch(`/api/gallery/${image!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Error al actualizar imagen");
        }
        toast.success("Imagen actualizada");
      } else {
        if (!newUrl) throw new Error("Falta la URL del archivo");
        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, src: newUrl }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Error al guardar imagen");
        }
        toast.success("Imagen agregada");
      }

      if (!isEdit) {
        setFile(null);
        setValues(initialValues());
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Upload + preview */}
      <div className="space-y-3">
        <FileUpload
          accept="image/jpeg,image/png,image/webp,image/gif"
          maxSize={10}
          value={file}
          onChange={(f) => setFile(f as File | null)}
        />
        {isEdit && !newPreview && (
          <p className="text-[11px] text-muted-foreground -mt-1">
            Dejalo vacío si no querés reemplazar el archivo actual.
          </p>
        )}
        {displayPreview && (
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted/40">
            <Image
              src={displayPreview}
              alt={newPreview ? "Nueva imagen" : "Imagen actual"}
              fill
              className="object-contain"
              unoptimized={!!newPreview}
              sizes="(max-width:640px) 100vw, 640px"
            />
            {newPreview && (
              <span className="absolute top-2 left-2 inline-flex items-center rounded-md bg-primary/90 text-primary-foreground px-2 py-0.5 text-[10px] font-semibold">
                NUEVA
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="glry-alt" className="text-xs uppercase tracking-wide">
            Texto alternativo *
          </Label>
          <Input
            id="glry-alt"
            placeholder="Descripción breve de la imagen"
            value={values.alt}
            onChange={(e) => updateField("alt", e.target.value)}
            required
            disabled={loading}
          />
          <p className="text-[11px] text-muted-foreground">Accesibilidad + SEO</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="glry-caption" className="text-xs uppercase tracking-wide">
              Título
            </Label>
            <Input
              id="glry-caption"
              placeholder="Título visible"
              value={values.caption}
              onChange={(e) => updateField("caption", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="glry-event" className="text-xs uppercase tracking-wide">
              Evento
            </Label>
            <Input
              id="glry-event"
              placeholder="Ej: Congreso 2026"
              value={values.event}
              onChange={(e) => updateField("event", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">Categoría</Label>
            <Select
              value={values.category}
              onValueChange={(v) => updateField("category", v)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="flex items-end">
            <div className="flex items-center gap-3 rounded-md border px-3 h-10 min-w-[160px]">
              <Switch
                checked={values.published}
                onCheckedChange={(v) => updateField("published", v)}
                disabled={loading}
              />
              <div className="leading-tight">
                <Label className="text-xs uppercase tracking-wide">Publicar</Label>
                <p className="text-[10px] text-muted-foreground">Visible en galería</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || (!isEdit && !file)}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Guardando..." : "Subiendo..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Guardar cambios" : "Subir imagen"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
