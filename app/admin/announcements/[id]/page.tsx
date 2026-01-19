"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT ANNOUNCEMENT PAGE
// Formulario para editar un anuncio existente
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

const announcementTypes = [
  { value: "convocatoria", label: "Convocatoria" },
  { value: "comunicado", label: "Comunicado" },
  { value: "evento", label: "Evento" },
  { value: "noticia", label: "Noticia" },
];

const iconOptions = [
  { value: "FileText", label: "Documento" },
  { value: "Calendar", label: "Calendario" },
  { value: "Bell", label: "Campana" },
  { value: "Megaphone", label: "Megáfono" },
  { value: "AlertCircle", label: "Alerta" },
  { value: "Award", label: "Premio" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAnnouncementPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    type: "noticia",
    icon: "FileText",
    date: new Date().toISOString().split("T")[0],
    href: "",
    important: false,
    published: true,
  });

  // Fetch announcement data
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch(`/api/announcements/${id}`);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error(json.error || "Error al cargar anuncio");
        }

        const data = json.data;
        setFormData({
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          type: data.type || "noticia",
          icon: data.icon || "FileText",
          date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          href: data.href || "",
          important: data.important || false,
          published: data.published ?? true,
        });
      } catch (error) {
        console.error("Error fetching announcement:", error);
        toast.error("Error al cargar el anuncio");
      } finally {
        setIsFetching(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar anuncio");
      }

      toast.success("Anuncio actualizado");
      router.push("/admin/announcements");
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar anuncio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Anuncio eliminado");
      router.push("/admin/announcements");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Error al eliminar anuncio");
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
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[150px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold">Anuncio no encontrado</h1>
        <p className="text-muted-foreground mb-4">El anuncio que buscas no existe o fue eliminado.</p>
        <Button asChild>
          <Link href="/admin/announcements">Volver a anuncios</Link>
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
            <Link href="/admin/announcements">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Anuncio</h1>
            <p className="text-muted-foreground">
              Modifica la información del anuncio
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
              <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El anuncio será eliminado
                permanentemente.
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
            <Card>
              <CardHeader>
                <CardTitle>Contenido</CardTitle>
                <CardDescription>
                  Información principal del anuncio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Título del anuncio"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumen</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Breve descripción del anuncio (se muestra en la lista)"
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo 160 caracteres recomendado
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Contenido completo *</Label>
                  <Textarea
                    id="content"
                    placeholder="Contenido detallado del anuncio..."
                    rows={10}
                    value={formData.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes usar formato Markdown
                  </p>
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="href">Enlace externo (opcional)</Label>
                  <Input
                    id="href"
                    type="url"
                    placeholder="https://ejemplo.com/documento.pdf"
                    value={formData.href}
                    onChange={(e) => updateField("href", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si se proporciona, el botón &quot;Leer más&quot; llevará a este enlace
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Publicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <Separator />

                {/* Important */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="important">Destacado</Label>
                    <p className="text-xs text-muted-foreground">
                      Mostrar con badge &quot;Importante&quot;
                    </p>
                  </div>
                  <Switch
                    id="important"
                    checked={formData.important}
                    onCheckedChange={(checked) => updateField("important", checked)}
                  />
                </div>

                <Separator />

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Classification */}
            <Card>
              <CardHeader>
                <CardTitle>Clasificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label>Tipo de anuncio</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => updateField("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {announcementTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <Label>Icono</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => updateField("icon", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un icono" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Link href="/admin/announcements">Cancelar</Link>
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
