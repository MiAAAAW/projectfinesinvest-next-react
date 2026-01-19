"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT RESEARCH LINE PAGE
// Formulario para editar una línea de investigación existente
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

const iconOptions = [
  { value: "FlaskConical", label: "Matraz (Ciencia)" },
  { value: "Microscope", label: "Microscopio" },
  { value: "Dna", label: "ADN" },
  { value: "Brain", label: "Cerebro" },
  { value: "Cpu", label: "Procesador (Tech)" },
  { value: "Database", label: "Base de datos" },
  { value: "Globe", label: "Globo (Global)" },
  { value: "Leaf", label: "Hoja (Ambiente)" },
  { value: "Building", label: "Edificio" },
  { value: "GraduationCap", label: "Graduación" },
  { value: "BookOpen", label: "Libro abierto" },
  { value: "Users", label: "Usuarios" },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditResearchLinePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "FlaskConical",
    coordinator: "",
    members: "",
    href: "",
    order: "0",
    published: true,
  });

  // Fetch research line data
  useEffect(() => {
    const fetchResearchLine = async () => {
      try {
        const res = await fetch(`/api/research/${id}`);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error(json.error || "Error al cargar línea de investigación");
        }

        const data = json.data;
        setFormData({
          title: data.title || "",
          description: data.description || "",
          icon: data.icon || "FlaskConical",
          coordinator: data.coordinator || "",
          members: data.members?.toString() || "",
          href: data.href || "",
          order: data.order?.toString() || "0",
          published: data.published ?? true,
        });
      } catch (error) {
        console.error("Error fetching research line:", error);
        toast.error("Error al cargar la línea de investigación");
      } finally {
        setIsFetching(false);
      }
    };

    fetchResearchLine();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/research/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          members: formData.members ? parseInt(formData.members) : null,
          order: parseInt(formData.order) || 0,
          coordinator: formData.coordinator || null,
          href: formData.href || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar línea de investigación");
      }

      toast.success("Línea de investigación actualizada");
      router.push("/admin/research");
    } catch (error) {
      console.error("Error updating research line:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar línea de investigación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/research/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Línea de investigación eliminada");
      router.push("/admin/research");
    } catch (error) {
      console.error("Error deleting research line:", error);
      toast.error("Error al eliminar línea de investigación");
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
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
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
        <h1 className="text-2xl font-bold">Línea de investigación no encontrada</h1>
        <p className="text-muted-foreground mb-4">La línea de investigación que buscas no existe o fue eliminada.</p>
        <Button asChild>
          <Link href="/admin/research">Volver a investigación</Link>
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
            <Link href="/admin/research">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Línea de Investigación</h1>
            <p className="text-muted-foreground">
              Modifica la información de la línea de investigación
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
              <AlertDialogTitle>¿Eliminar línea de investigación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La línea de investigación será eliminada
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
                <CardTitle>Información</CardTitle>
                <CardDescription>
                  Datos principales de la línea de investigación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre de la línea *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Inteligencia Artificial y Machine Learning"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el enfoque y objetivos de esta línea de investigación..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    required
                  />
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="href">Enlace a más información (opcional)</Label>
                  <Input
                    id="href"
                    type="url"
                    placeholder="https://ejemplo.com/linea-investigacion"
                    value={formData.href}
                    onChange={(e) => updateField("href", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si se proporciona, aparecerá un botón &quot;Ver proyectos&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle>Equipo</CardTitle>
                <CardDescription>
                  Información sobre el equipo de investigación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coordinator */}
                <div className="space-y-2">
                  <Label htmlFor="coordinator">Coordinador</Label>
                  <Input
                    id="coordinator"
                    placeholder="Nombre del coordinador de la línea"
                    value={formData.coordinator}
                    onChange={(e) => updateField("coordinator", e.target.value)}
                  />
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <Label htmlFor="members">Número de investigadores</Label>
                  <Input
                    id="members"
                    type="number"
                    min="0"
                    placeholder="Ej: 12"
                    value={formData.members}
                    onChange={(e) => updateField("members", e.target.value)}
                  />
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

                {/* Order */}
                <div className="space-y-2">
                  <Label htmlFor="order">Orden de aparición</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) => updateField("order", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Menor número = aparece primero
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <Link href="/admin/research">Cancelar</Link>
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
