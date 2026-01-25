"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT OFFICE PAGE
// Formulario para editar oficina
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DynamicIcon } from "@/lib/icons";

// Iconos disponibles para oficinas
const ICON_OPTIONS = [
  { value: "Building2", label: "Edificio" },
  { value: "MapPin", label: "Ubicación" },
  { value: "Briefcase", label: "Maletín" },
  { value: "FlaskConical", label: "Laboratorio" },
  { value: "GraduationCap", label: "Académico" },
  { value: "Users", label: "Personas" },
  { value: "FileText", label: "Documentos" },
  { value: "Settings", label: "Configuración" },
];

interface ScheduleDay {
  day: string;
  hours: string;
}

export default function EditOfficePage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    building: "",
    floor: "",
    phone: "",
    email: "",
    responsible: "",
    icon: "Building2",
    mapUrl: "",
    order: "0",
    published: true,
  });

  // Fetch datos de la oficina desde API
  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const res = await fetch(`/api/offices/${params.id}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Error al cargar oficina");
        }

        const office = json.data;
        setFormData({
          name: office.name || "",
          description: office.description || "",
          location: office.location || "",
          building: office.building || "",
          floor: office.floor || "",
          phone: office.phone || "",
          email: office.email || "",
          responsible: office.responsible || "",
          icon: office.icon || "Building2",
          mapUrl: office.mapUrl || "",
          order: String(office.order ?? 0),
          published: office.published ?? true,
        });

        // Parsear horario si existe
        if (office.schedule) {
          try {
            const parsedSchedule = JSON.parse(office.schedule);
            setSchedule(parsedSchedule);
          } catch {
            setSchedule([{ day: "Lunes - Viernes", hours: "8:00 AM - 4:00 PM" }]);
          }
        } else {
          setSchedule([{ day: "Lunes - Viernes", hours: "8:00 AM - 4:00 PM" }]);
        }
      } catch (error) {
        console.error("Error fetching office:", error);
        toast.error("Error al cargar oficina");
        router.push("/admin/offices");
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) {
      fetchOffice();
    }
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/offices/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          location: formData.location,
          building: formData.building || null,
          floor: formData.floor || null,
          phone: formData.phone || null,
          email: formData.email || null,
          schedule: schedule.length > 0 ? JSON.stringify(schedule) : null,
          responsible: formData.responsible || null,
          icon: formData.icon,
          mapUrl: formData.mapUrl || null,
          order: parseInt(formData.order) || 0,
          published: formData.published,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al actualizar");
      }

      toast.success("Oficina actualizada exitosamente");
      router.push("/admin/offices");
    } catch (error) {
      console.error("Error updating office:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar oficina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/offices/${params.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Oficina eliminada");
      router.push("/admin/offices");
    } catch (error) {
      console.error("Error deleting office:", error);
      toast.error("Error al eliminar oficina");
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addScheduleDay = () => {
    setSchedule([...schedule, { day: "", hours: "" }]);
  };

  const removeScheduleDay = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateScheduleDay = (index: number, field: "day" | "hours", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
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
            <Skeleton className="h-[150px] w-full rounded-lg" />
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
            <Link href="/admin/offices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Oficina</h1>
            <p className="text-muted-foreground">
              Modifica la información de la oficina
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
              <AlertDialogTitle>¿Eliminar oficina?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La oficina será eliminada
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
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Datos principales de la oficina
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la oficina *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Dirección de Investigación"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descripción de la oficina y sus funciones..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>

                {/* Responsible */}
                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsable</Label>
                  <Input
                    id="responsible"
                    placeholder="Ej: Dr. Juan Pérez García"
                    value={formData.responsible}
                    onChange={(e) => updateField("responsible", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
                <CardDescription>
                  Dirección física de la oficina
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Dirección *</Label>
                  <Input
                    id="location"
                    placeholder="Ej: Av. Floral 1153, Puno"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Building */}
                  <div className="space-y-2">
                    <Label htmlFor="building">Edificio</Label>
                    <Input
                      id="building"
                      placeholder="Ej: Edificio Administrativo"
                      value={formData.building}
                      onChange={(e) => updateField("building", e.target.value)}
                    />
                  </div>

                  {/* Floor */}
                  <div className="space-y-2">
                    <Label htmlFor="floor">Piso / Oficina</Label>
                    <Input
                      id="floor"
                      placeholder="Ej: Oficina 201, 2do Piso"
                      value={formData.floor}
                      onChange={(e) => updateField("floor", e.target.value)}
                    />
                  </div>
                </div>

                {/* Map URL */}
                <div className="space-y-2">
                  <Label htmlFor="mapUrl">Enlace a Google Maps</Label>
                  <Input
                    id="mapUrl"
                    type="text"
                    placeholder="maps.google.com/... o URL completa"
                    value={formData.mapUrl}
                    onChange={(e) => updateField("mapUrl", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Acepta URL de Google Maps con o sin https://
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Teléfono y correo de la oficina
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="(051) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="oficina@unap.edu.pe"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Horario de Atención</CardTitle>
                <CardDescription>
                  Días y horas de atención al público
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedule.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Días</Label>
                      <Input
                        placeholder="Ej: Lunes - Viernes"
                        value={item.day}
                        onChange={(e) => updateScheduleDay(index, "day", e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Horario</Label>
                      <Input
                        placeholder="Ej: 8:00 AM - 4:00 PM"
                        value={item.hours}
                        onChange={(e) => updateScheduleDay(index, "hours", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeScheduleDay(index)}
                      disabled={schedule.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addScheduleDay}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar horario
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Icon Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Icono</CardTitle>
                <CardDescription>
                  Icono representativo de la oficina
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.icon}
                  onValueChange={(value) => updateField("icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <DynamicIcon name={icon.value} size={16} />
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Preview */}
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DynamicIcon name={formData.icon} size={32} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <Link href="/admin/offices">Cancelar</Link>
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
