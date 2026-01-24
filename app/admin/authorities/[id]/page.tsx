"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT AUTHORITY PAGE
// Formulario para editar autoridad
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { FileUpload } from "@/components/admin/FileUpload";

// Obtener iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function EditAuthorityPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department: "",
    bio: "",
    email: "",
    phone: "",
    officeHours: "",
    linkedin: "",
    orcid: "",
    googleScholar: "",
    order: "0",
    published: true,
  });

  // Generar preview de la nueva imagen
  const imagePreview = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Fetch datos de la autoridad desde API
  useEffect(() => {
    const fetchAuthority = async () => {
      try {
        const res = await fetch(`/api/authorities/${params.id}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Error al cargar autoridad");
        }

        const authority = json.data;
        setFormData({
          name: authority.name || "",
          role: authority.role || "",
          department: authority.department || "",
          bio: authority.bio || "",
          email: authority.email || "",
          phone: authority.phone || "",
          officeHours: authority.officeHours || "",
          linkedin: authority.linkedin || "",
          orcid: authority.orcid || "",
          googleScholar: authority.googleScholar || "",
          order: String(authority.order ?? 0),
          published: authority.published ?? true,
        });

        // Usar API endpoint para mostrar avatar desde storage privado
        if (authority.avatarUrl) {
          setCurrentAvatar(`/api/authorities/image/${authority.id}`);
        }
      } catch (error) {
        console.error("Error fetching authority:", error);
        toast.error("Error al cargar autoridad");
        router.push("/admin/authorities");
      } finally {
        setIsFetching(false);
      }
    };

    if (params.id) {
      fetchAuthority();
    }
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let newAvatarUrl: string | undefined;

      // Si hay archivo nuevo, subirlo primero
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("category", "authorities");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const json = await uploadRes.json();
          throw new Error(json.error || "Error al subir archivo");
        }

        const uploadData = await uploadRes.json();
        newAvatarUrl = uploadData.data.filePath;
      }

      // Actualizar registro
      const updateData: Record<string, unknown> = {
        name: formData.name,
        role: formData.role,
        department: formData.department || null,
        bio: formData.bio || null,
        email: formData.email || null,
        phone: formData.phone || null,
        officeHours: formData.officeHours || null,
        linkedin: formData.linkedin || null,
        orcid: formData.orcid || null,
        googleScholar: formData.googleScholar || null,
        order: parseInt(formData.order) || 0,
        published: formData.published,
      };

      if (newAvatarUrl) {
        updateData.avatarUrl = newAvatarUrl;
      }

      const res = await fetch(`/api/authorities/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al actualizar");
      }

      toast.success("Autoridad actualizada exitosamente");
      router.push("/admin/authorities");
    } catch (error) {
      console.error("Error updating authority:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar autoridad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/authorities/${params.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Autoridad eliminada");
      router.push("/admin/authorities");
    } catch (error) {
      console.error("Error deleting authority:", error);
      toast.error("Error al eliminar autoridad");
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
            <Link href="/admin/authorities">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Autoridad</h1>
            <p className="text-muted-foreground">
              Modifica la información de la autoridad
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
              <AlertDialogTitle>¿Eliminar autoridad?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La autoridad será eliminada
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
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Datos principales de la autoridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Dr. Juan Pérez García"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo *</Label>
                  <Input
                    id="role"
                    placeholder="Ej: Director de Investigación"
                    value={formData.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    required
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento / Unidad</Label>
                  <Input
                    id="department"
                    placeholder="Ej: FINESI, Escuela Profesional de Estadística"
                    value={formData.department}
                    onChange={(e) => updateField("department", e.target.value)}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    placeholder="Breve descripción de la trayectoria y especialidad..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Datos de contacto y horarios de atención
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@unap.edu.pe"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

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

                {/* Office Hours */}
                <div className="space-y-2">
                  <Label htmlFor="officeHours">Horario de atención</Label>
                  <Input
                    id="officeHours"
                    placeholder="Lunes y Miércoles 10:00 AM - 12:00 PM"
                    value={formData.officeHours}
                    onChange={(e) => updateField("officeHours", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Perfiles Académicos</CardTitle>
                <CardDescription>
                  Enlaces a perfiles de investigación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ORCID */}
                <div className="space-y-2">
                  <Label htmlFor="orcid">ORCID</Label>
                  <Input
                    id="orcid"
                    type="url"
                    placeholder="https://orcid.org/0000-0001-2345-6789"
                    value={formData.orcid}
                    onChange={(e) => updateField("orcid", e.target.value)}
                  />
                </div>

                {/* Google Scholar */}
                <div className="space-y-2">
                  <Label htmlFor="googleScholar">Google Scholar</Label>
                  <Input
                    id="googleScholar"
                    type="url"
                    placeholder="https://scholar.google.com/citations?user=..."
                    value={formData.googleScholar}
                    onChange={(e) => updateField("googleScholar", e.target.value)}
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => updateField("linkedin", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Avatar */}
            {currentAvatar && !imagePreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Foto actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={currentAvatar} alt={formData.name} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Avatar Upload */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentAvatar ? "Cambiar foto" : "Foto de perfil"}
                </CardTitle>
                <CardDescription>
                  {currentAvatar
                    ? "Sube una nueva imagen para reemplazar la actual"
                    : "Imagen del miembro (JPG, PNG, WebP)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  accept="image/jpeg,image/png,image/webp"
                  maxSize={5}
                  value={file}
                  onChange={(f) => setFile(f as File | null)}
                />

                {/* Preview */}
                {imagePreview && (
                  <div className="relative aspect-square w-32 mx-auto rounded-full overflow-hidden border">
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
                    <Link href="/admin/authorities">Cancelar</Link>
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
