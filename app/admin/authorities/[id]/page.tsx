"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT AUTHORITY PAGE
// Formulario para editar autoridad
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EditPageHeader, EditPageSkeleton, PublishSettingsCard, FormActionsCard, FileUpload,
} from "@/components/admin";
import { getInitials } from "@/lib/utils";

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
        uploadFormData.append("folder", "authorities");

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

  if (isFetching) return <EditPageSkeleton />;

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/authorities"
        title="Editar Autoridad"
        description="Modifica la información de la autoridad"
        onDelete={handleDelete}
        isDeleting={false}
        deleteTitle="¿Eliminar autoridad?"
        deleteDescription="Esta acción no se puede deshacer. La autoridad será eliminada permanentemente."
      />

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
                    type="text"
                    placeholder="0000-0002-1234-5678"
                    value={formData.orcid}
                    onChange={(e) => updateField("orcid", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Acepta: ID ORCID o URL completa
                  </p>
                </div>

                {/* Google Scholar */}
                <div className="space-y-2">
                  <Label htmlFor="googleScholar">Google Scholar</Label>
                  <Input
                    id="googleScholar"
                    type="text"
                    placeholder="ABC123xyz o URL completa"
                    value={formData.googleScholar}
                    onChange={(e) => updateField("googleScholar", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Acepta: ID de usuario, o URL completa
                  </p>
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="text"
                    placeholder="in/usuario o URL completa"
                    value={formData.linkedin}
                    onChange={(e) => updateField("linkedin", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Acepta: in/usuario, linkedin.com/in/usuario, o URL completa
                  </p>
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

            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(checked) => updateField("published", checked)}
              order={formData.order}
              onOrderChange={(value) => updateField("order", value)}
            />

            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/authorities"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
