"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT CALENDAR EVENT PAGE
// Formulario para editar un evento existente
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
import { CALENDAR_EVENT_TYPES } from "@/lib/admin-constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCalendarEventPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    endDate: "",
    type: "academico",
    location: "",
    href: "",
    important: false,
    published: true,
  });

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/calendar/${id}`);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error(json.error || "Error al cargar evento");
        }

        const data = json.data;
        setFormData({
          title: data.title || "",
          description: data.description || "",
          date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          endDate: data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "",
          type: data.type || "academico",
          location: data.location || "",
          href: data.href || "",
          important: data.important || false,
          published: data.published ?? true,
        });
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Error al cargar el evento");
      } finally {
        setIsFetching(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        endDate: formData.endDate || null,
        description: formData.description || null,
        location: formData.location || null,
        href: formData.href || null,
      };

      const res = await fetch(`/api/calendar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar evento");
      }

      toast.success("Evento actualizado");
      router.push("/admin/calendar");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Evento eliminado");
      router.push("/admin/calendar");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Error al eliminar evento");
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
            <Skeleton className="h-[400px] w-full rounded-lg" />
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
        <h1 className="text-2xl font-bold">Evento no encontrado</h1>
        <p className="text-muted-foreground mb-4">El evento que buscas no existe o fue eliminado.</p>
        <Button asChild>
          <Link href="/admin/calendar">Volver al calendario</Link>
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
            <Link href="/admin/calendar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Evento</h1>
            <p className="text-muted-foreground">
              Modifica la información del evento
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
              <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El evento será eliminado
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
                <CardTitle>Información del Evento</CardTitle>
                <CardDescription>
                  Datos principales del evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título del evento *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Seminario de Investigación"
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
                    placeholder="Descripción detallada del evento..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    placeholder="Ej: Auditorio Principal, Sala de Conferencias"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="href">Enlace externo (opcional)</Label>
                  <Input
                    id="href"
                    type="url"
                    placeholder="https://ejemplo.com/evento"
                    value={formData.href}
                    onChange={(e) => updateField("href", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enlace a más información o inscripción
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
                      Visible en el calendario
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
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha de inicio *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    required
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Para eventos de varios días
                  </p>
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
                  <Label>Tipo de evento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => updateField("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALENDAR_EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                    <Link href="/admin/calendar">Cancelar</Link>
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
