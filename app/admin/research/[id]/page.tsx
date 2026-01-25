"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT RESEARCH LINE PAGE
// Formulario para editar una línea de investigación existente
// Incluye gestión bidireccional de docentes
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Plus,
  X,
  ChevronDown,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { toast } from "sonner";
import { TEACHER_ROLES, TEACHER_ROLE_LABELS } from "@/lib/admin-constants";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES LOCALES
// ═══════════════════════════════════════════════════════════════════════════════

const ICON_OPTIONS = [
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
  { value: "BarChart3", label: "Gráfico (Estadística)" },
  { value: "Code", label: "Código" },
  { value: "Shield", label: "Seguridad" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  specialty: string | null;
  degree: string | null;
  published: boolean;
}

interface AssignedTeacher extends Teacher {
  role: string;
  joinedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function EditResearchLinePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "FlaskConical",
    coordinator: "", // Legacy
    members: "", // Legacy
    href: "",
    order: "0",
    published: true,
  });

  // Estado de docentes
  const [assignedTeachers, setAssignedTeachers] = useState<AssignedTeacher[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  // Estado del diálogo de asignar
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedRole, setSelectedRole] = useState("investigador");
  const [isAssigning, setIsAssigning] = useState(false);

  // Estado para campos legacy
  const [showLegacy, setShowLegacy] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────────────────────────────────────────

  // Fetch línea de investigación
  useEffect(() => {
    const fetchResearchLine = async () => {
      try {
        const res = await fetch(`/api/research/${id}?includeTeachers=true`);
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

        // Si hay campos legacy con datos, mostrar sección
        if (data.coordinator || data.members) {
          setShowLegacy(true);
        }
      } catch (error) {
        console.error("Error fetching research line:", error);
        toast.error("Error al cargar la línea de investigación");
      } finally {
        setIsFetching(false);
      }
    };

    fetchResearchLine();
  }, [id]);

  // Fetch docentes asignados
  useEffect(() => {
    const fetchAssignedTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        const res = await fetch(`/api/research/${id}/teachers`);
        if (res.ok) {
          const json = await res.json();
          setAssignedTeachers(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching assigned teachers:", error);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    if (!isFetching && !notFound) {
      fetchAssignedTeachers();
    }
  }, [id, isFetching, notFound]);

  // Fetch docentes disponibles
  useEffect(() => {
    const fetchAvailableTeachers = async () => {
      try {
        const res = await fetch("/api/teachers?status=published&limit=100");
        if (res.ok) {
          const json = await res.json();
          setAvailableTeachers(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching available teachers:", error);
      }
    };

    fetchAvailableTeachers();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/research/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          icon: formData.icon,
          href: formData.href || null,
          order: parseInt(formData.order) || 0,
          published: formData.published,
          // Campos legacy (solo si están visibles)
          coordinator: showLegacy ? (formData.coordinator || null) : null,
          members: showLegacy ? (formData.members ? parseInt(formData.members) : null) : null,
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
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar"
      );
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

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) {
      toast.error("Selecciona un docente");
      return;
    }

    setIsAssigning(true);
    try {
      const res = await fetch(`/api/research/${id}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          role: selectedRole,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al asignar docente");
      }

      // Agregar a la lista local
      setAssignedTeachers((prev) => [...prev, json.data]);

      toast.success("Docente asignado");
      setAssignDialogOpen(false);
      setSelectedTeacherId("");
      setSelectedRole("investigador");
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast.error(error instanceof Error ? error.message : "Error al asignar docente");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateRole = async (teacherId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/research/${id}/teachers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, role: newRole }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar rol");
      }

      // Actualizar lista local
      setAssignedTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, role: newRole } : t))
      );

      toast.success("Rol actualizado");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar rol");
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    try {
      const res = await fetch(`/api/research/${id}/teachers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al remover docente");
      }

      // Remover de lista local
      setAssignedTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      toast.success("Docente removido");
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Error al remover docente");
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filtrar docentes no asignados
  const unassignedTeachers = availableTeachers.filter(
    (t) => !assignedTeachers.some((at) => at.id === t.id)
  );

  // Encontrar coordinador actual
  const currentCoordinator = assignedTeachers.find((t) => t.role === "coordinador");

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING
  // ─────────────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: NOT FOUND
  // ─────────────────────────────────────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold">Línea de investigación no encontrada</h1>
        <p className="text-muted-foreground mb-4">
          La línea de investigación que buscas no existe o fue eliminada.
        </p>
        <Button asChild>
          <Link href="/admin/research">Volver a investigación</Link>
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: MAIN
  // ─────────────────────────────────────────────────────────────────────────────

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
            <h1 className="text-2xl font-bold tracking-tight">
              Editar Línea de Investigación
            </h1>
            <p className="text-muted-foreground">
              Modifica la información y gestiona los docentes
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
                Esta acción no se puede deshacer. La línea será eliminada junto
                con todas las asignaciones de docentes.
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
            {/* Información Básica */}
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
                    placeholder="Describe el enfoque y objetivos..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    required
                  />
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="href">Enlace a más información</Label>
                  <Input
                    id="href"
                    type="text"
                    placeholder="ejemplo.com/ruta, #seccion, o URL completa"
                    value={formData.href}
                    onChange={(e) => updateField("href", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Acepta: dominio.com/ruta, #ancla, /ruta-relativa, o URL completa
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* SECCIÓN DE DOCENTES - NUEVA */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Equipo de Investigación
                    <Badge variant="secondary" className="ml-2">
                      {assignedTeachers.length} docentes
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Docentes asignados a esta línea de investigación
                  </CardDescription>
                </div>
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={unassignedTeachers.length === 0}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Agregar Docente
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Docente</DialogTitle>
                      <DialogDescription>
                        Selecciona un docente y asígnale un rol en esta línea
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Docente</Label>
                        <Select
                          value={selectedTeacherId}
                          onValueChange={setSelectedTeacherId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un docente" />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedTeachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.degree && `${teacher.degree} `}
                                {teacher.name}
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
                            {TEACHER_ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedRole === "coordinador" && currentCoordinator && (
                          <p className="text-xs text-amber-600">
                            Ya hay un coordinador: {currentCoordinator.name}. Se
                            reemplazará si continúas.
                          </p>
                        )}
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
                      <Button onClick={handleAssignTeacher} disabled={isAssigning}>
                        {isAssigning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Asignando...
                          </>
                        ) : (
                          "Agregar"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoadingTeachers ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : assignedTeachers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay docentes asignados</p>
                    <p className="text-sm">
                      Agrega docentes usando el botón de arriba
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignedTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {teacher.avatarUrl ? (
                              <AvatarImage
                                src={teacher.avatarUrl}
                                alt={teacher.name}
                              />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(teacher.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {teacher.degree && (
                                <span className="text-muted-foreground">
                                  {teacher.degree}{" "}
                                </span>
                              )}
                              {teacher.name}
                            </p>
                            {teacher.specialty && (
                              <p className="text-xs text-muted-foreground">
                                {teacher.specialty}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Selector de rol */}
                          <Select
                            value={teacher.role}
                            onValueChange={(value) =>
                              handleUpdateRole(teacher.id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TEACHER_ROLES.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Botón remover */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveTeacher(teacher.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* CAMPOS LEGACY - DEPRECADOS */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <Card className="border-dashed border-amber-500/50">
              <Collapsible open={showLegacy} onOpenChange={setShowLegacy}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Campos Legacy (Deprecados)
                      <ChevronDown
                        className={`h-4 w-4 ml-auto transition-transform ${
                          showLegacy ? "rotate-180" : ""
                        }`}
                      />
                    </CardTitle>
                    <CardDescription>
                      Estos campos serán reemplazados por la gestión de docentes.
                      {assignedTeachers.length > 0 && (
                        <span className="text-green-600 ml-1">
                          (Ya tienes {assignedTeachers.length} docentes asignados)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                      <strong>Nota:</strong> Usa la sección &quot;Equipo de
                      Investigación&quot; para gestionar docentes. Estos campos
                      se mantendrán por compatibilidad pero serán ignorados si
                      hay docentes asignados.
                    </div>
                    {/* Coordinator Legacy */}
                    <div className="space-y-2">
                      <Label htmlFor="coordinator" className="text-muted-foreground">
                        Coordinador (texto manual)
                      </Label>
                      <Input
                        id="coordinator"
                        placeholder="Nombre del coordinador"
                        value={formData.coordinator}
                        onChange={(e) => updateField("coordinator", e.target.value)}
                        className="border-dashed"
                      />
                    </div>
                    {/* Members Legacy */}
                    <div className="space-y-2">
                      <Label htmlFor="members" className="text-muted-foreground">
                        Número de investigadores (manual)
                      </Label>
                      <Input
                        id="members"
                        type="number"
                        min="0"
                        placeholder="Ej: 12"
                        value={formData.members}
                        onChange={(e) => updateField("members", e.target.value)}
                        className="border-dashed"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publicación */}
            <Card>
              <CardHeader>
                <CardTitle>Publicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

            {/* Apariencia */}
            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
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
