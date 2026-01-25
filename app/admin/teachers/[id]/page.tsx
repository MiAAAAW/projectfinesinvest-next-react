"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT TEACHER PAGE
// Formulario para editar un docente/investigador existente
// Incluye gestión de líneas de investigación
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicIcon } from "@/lib/icons";
import { toast } from "sonner";
import { TEACHER_DEGREES, TEACHER_ROLES } from "@/lib/admin-constants";

interface ResearchLine {
  id: string;
  title: string;
  icon: string;
  description?: string;
  published?: boolean;
}

interface TeacherResearchLine extends ResearchLine {
  role: string;
  joinedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTeacherPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Research lines state
  const [researchLines, setResearchLines] = useState<TeacherResearchLine[]>([]);
  const [availableLines, setAvailableLines] = useState<ResearchLine[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState("");
  const [selectedRole, setSelectedRole] = useState("investigador");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    specialty: "",
    degree: "",
    orcid: "",
    googleScholar: "",
    linkedin: "",
    bio: "",
    order: "0",
    published: true,
  });

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`/api/teachers/${id}?includeResearchLines=true`);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error(json.error || "Error al cargar docente");
        }

        const data = json.data;
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          avatarUrl: data.avatarUrl || "",
          specialty: data.specialty || "",
          degree: data.degree || "",
          orcid: data.orcid || "",
          googleScholar: data.googleScholar || "",
          linkedin: data.linkedin || "",
          bio: data.bio || "",
          order: data.order?.toString() || "0",
          published: data.published ?? true,
        });

        // Transform research lines
        if (data.researchLines) {
          setResearchLines(
            data.researchLines.map((rl: { role: string; joinedAt: string; researchLine: ResearchLine }) => ({
              ...rl.researchLine,
              role: rl.role,
              joinedAt: rl.joinedAt,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching teacher:", error);
        toast.error("Error al cargar el docente");
      } finally {
        setIsFetching(false);
      }
    };

    fetchTeacher();
  }, [id]);

  // Fetch available research lines
  useEffect(() => {
    const fetchAvailableLines = async () => {
      try {
        const res = await fetch("/api/research?status=published&limit=100");
        const json = await res.json();
        if (res.ok) {
          setAvailableLines(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching research lines:", error);
      }
    };

    fetchAvailableLines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email || null,
          phone: formData.phone || null,
          avatarUrl: formData.avatarUrl || null,
          specialty: formData.specialty || null,
          degree: formData.degree || null,
          orcid: formData.orcid || null,
          googleScholar: formData.googleScholar || null,
          linkedin: formData.linkedin || null,
          bio: formData.bio || null,
          order: parseInt(formData.order) || 0,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar docente");
      }

      toast.success("Docente actualizado");
      router.push("/admin/teachers");
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar docente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Docente eliminado");
      router.push("/admin/teachers");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Error al eliminar docente");
      setIsDeleting(false);
    }
  };

  const handleAssignResearchLine = async () => {
    if (!selectedLineId) {
      toast.error("Selecciona una línea de investigación");
      return;
    }

    setIsAssigning(true);
    try {
      const res = await fetch(`/api/teachers/${id}/research-lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchLineId: selectedLineId,
          role: selectedRole,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al asignar línea");
      }

      // Add to local state
      const line = availableLines.find((l) => l.id === selectedLineId);
      if (line) {
        setResearchLines((prev) => [
          ...prev,
          { ...line, role: selectedRole, joinedAt: new Date().toISOString() },
        ]);
      }

      toast.success("Línea de investigación asignada");
      setAssignDialogOpen(false);
      setSelectedLineId("");
      setSelectedRole("investigador");
    } catch (error) {
      console.error("Error assigning research line:", error);
      toast.error(error instanceof Error ? error.message : "Error al asignar línea");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveResearchLine = async (researchLineId: string) => {
    try {
      const res = await fetch(`/api/teachers/${id}/research-lines`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researchLineId }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al remover línea");
      }

      // Remove from local state
      setResearchLines((prev) => prev.filter((l) => l.id !== researchLineId));
      toast.success("Línea de investigación removida");
    } catch (error) {
      console.error("Error removing research line:", error);
      toast.error("Error al remover línea de investigación");
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filter out already assigned lines
  const unassignedLines = availableLines.filter(
    (line) => !researchLines.some((rl) => rl.id === line.id)
  );

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
        <h1 className="text-2xl font-bold">Docente no encontrado</h1>
        <p className="text-muted-foreground mb-4">El docente que buscas no existe o fue eliminado.</p>
        <Button asChild>
          <Link href="/admin/teachers">Volver a docentes</Link>
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
            <Link href="/admin/teachers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Docente</h1>
            <p className="text-muted-foreground">
              Modifica la información del docente
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
              <AlertDialogTitle>¿Eliminar docente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El docente será eliminado
                permanentemente junto con sus asignaciones.
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
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Datos básicos del docente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Degree */}
                  <div className="space-y-2">
                    <Label>Grado Académico</Label>
                    <Select
                      value={formData.degree}
                      onValueChange={(value) => updateField("degree", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un grado" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEACHER_DEGREES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      placeholder="Juan Carlos Pérez García"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Input
                    id="specialty"
                    placeholder="Ej: Inteligencia Artificial, Estadística Aplicada"
                    value={formData.specialty}
                    onChange={(e) => updateField("specialty", e.target.value)}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    placeholder="Breve descripción del perfil académico y profesional..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                  />
                </div>

                {/* Avatar URL */}
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">URL de Foto</Label>
                  <Input
                    id="avatarUrl"
                    type="text"
                    placeholder="ejemplo.com/foto.jpg o URL completa"
                    value={formData.avatarUrl}
                    onChange={(e) => updateField("avatarUrl", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Acepta: dominio.com/ruta, o URL completa con https://
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="docente@universidad.edu"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+51 999 999 999"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Links */}
            <Card>
              <CardHeader>
                <CardTitle>Enlaces Académicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ORCID */}
                <div className="space-y-2">
                  <Label htmlFor="orcid">ORCID</Label>
                  <Input
                    id="orcid"
                    placeholder="0000-0002-1234-5678"
                    value={formData.orcid}
                    onChange={(e) => updateField("orcid", e.target.value)}
                  />
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

            {/* Research Lines */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Líneas de Investigación</CardTitle>
                  <CardDescription>
                    Líneas de investigación en las que participa
                  </CardDescription>
                </div>
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={unassignedLines.length === 0}>
                      <Plus className="mr-2 h-4 w-4" />
                      Asignar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Asignar Línea de Investigación</DialogTitle>
                      <DialogDescription>
                        Selecciona una línea de investigación y el rol del docente
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Línea de Investigación</Label>
                        <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una línea" />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedLines.map((line) => (
                              <SelectItem key={line.id} value={line.id}>
                                {line.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Rol</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEACHER_ROLES.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setAssignDialogOpen(false)}
                        disabled={isAssigning}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAssignResearchLine} disabled={isAssigning}>
                        {isAssigning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Asignando...
                          </>
                        ) : (
                          "Asignar"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {researchLines.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Este docente no está asignado a ninguna línea de investigación
                  </p>
                ) : (
                  <div className="space-y-2">
                    {researchLines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <DynamicIcon name={line.icon || "FlaskConical"} size={16} className="text-primary" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">{line.title}</span>
                            <Badge
                              variant={line.role === "coordinador" ? "default" : "outline"}
                              className="ml-2 text-xs"
                            >
                              {line.role}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveResearchLine(line.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                    <Link href="/admin/teachers">Cancelar</Link>
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
