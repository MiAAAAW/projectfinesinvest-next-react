"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT TEACHER PAGE
// Formulario para editar un docente/investigador existente
// Incluye gestión de líneas de investigación
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState,
  PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import {
  TeacherPersonalCard, TeacherContactCard, TeacherAcademicLinksCard,
  TEACHER_DEFAULTS,
} from "../_components/TeacherFormFields";
import { ResearchLineAssignment } from "../_components/ResearchLineAssignment";
import type { TeacherFormData } from "../_components/TeacherFormFields";
import type { ResearchLine, TeacherResearchLine } from "../_components/ResearchLineAssignment";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTeacherPage({ params }: PageProps) {
  const { id } = use(params);

  // Research lines state (manejo manual por complejidad de la API)
  const [researchLines, setResearchLines] = useState<TeacherResearchLine[]>([]);
  const [availableLines, setAvailableLines] = useState<ResearchLine[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState("");
  const [selectedRole, setSelectedRole] = useState("investigador");

  // Form hook
  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    handleSubmit,
    handleDelete,
  } = useEntityForm<TeacherFormData>({
    endpoint: "/api/teachers",
    entityId: id,
    entityName: "docente",
    redirectPath: "/admin/teachers",
    defaultValues: TEACHER_DEFAULTS,
    mapApiToForm: (data) => {
      // Transform research lines from nested format
      if (data.researchLines) {
        setResearchLines(
          (data.researchLines as Array<{ role: string; joinedAt: string; researchLine: ResearchLine }>).map(
            (rl) => ({ ...rl.researchLine, role: rl.role, joinedAt: rl.joinedAt })
          )
        );
      }
      return {
        name: data.name as string || "",
        code: data.code as string || "",
        email: data.email as string || "",
        phone: data.phone as string || "",
        avatarUrl: data.avatarUrl as string || "",
        specialty: data.specialty as string || "",
        degree: (data.degree as string) || "none",
        academicTitle: data.academicTitle as string || "",
        category: (data.category as string) || "none",
        employmentType: (data.employmentType as string) || "none",
        orcid: data.orcid as string || "",
        googleScholar: data.googleScholar as string || "",
        linkedin: data.linkedin as string || "",
        researchGate: data.researchGate as string || "",
        personalWebsite: data.personalWebsite as string || "",
        ctiVitaeUrl: data.ctiVitaeUrl as string || "",
        bio: data.bio as string || "",
        hindex: data.hindex != null ? String(data.hindex) : "",
        order: data.order?.toString() || "0",
        published: data.published as boolean ?? true,
      };
    },
    mapFormToApi: (form) => ({
      ...form,
      code: form.code || null,
      email: form.email || null,
      phone: form.phone || null,
      avatarUrl: form.avatarUrl || null,
      specialty: form.specialty || null,
      degree: form.degree === "none" ? null : form.degree || null,
      academicTitle: form.academicTitle || null,
      category: form.category === "none" ? null : form.category || null,
      employmentType: form.employmentType === "none" ? null : form.employmentType || null,
      orcid: form.orcid || null,
      googleScholar: form.googleScholar || null,
      linkedin: form.linkedin || null,
      researchGate: form.researchGate || null,
      personalWebsite: form.personalWebsite || null,
      ctiVitaeUrl: form.ctiVitaeUrl || null,
      bio: form.bio || null,
      hindex: form.hindex ? parseInt(form.hindex) : null,
      order: parseInt(form.order) || 0,
    }),
  });

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

  const unassignedLines = availableLines.filter(
    (line) => !researchLines.some((rl) => rl.id === line.id)
  );

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
        body: JSON.stringify({ researchLineId: selectedLineId, role: selectedRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al asignar línea");

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
      setResearchLines((prev) => prev.filter((l) => l.id !== researchLineId));
      toast.success("Línea de investigación removida");
    } catch (error) {
      console.error("Error removing research line:", error);
      toast.error("Error al remover línea de investigación");
    }
  };

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Docente no encontrado"
        description="El docente que buscas no existe o fue eliminado."
        backHref="/admin/teachers"
        backLabel="Volver a docentes"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/teachers"
        title="Editar Docente"
        description="Modifica la información del docente"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar docente?"
        deleteDescription="Esta acción no se puede deshacer. El docente será eliminado permanentemente junto con sus asignaciones."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TeacherPersonalCard formData={formData} updateField={updateField} />
            <TeacherContactCard formData={formData} updateField={updateField} />
            <TeacherAcademicLinksCard formData={formData} updateField={updateField} />

            <ResearchLineAssignment
              assignedLines={researchLines}
              unassignedLines={unassignedLines}
              assignDialogOpen={assignDialogOpen}
              setAssignDialogOpen={setAssignDialogOpen}
              selectedLineId={selectedLineId}
              setSelectedLineId={setSelectedLineId}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              isAssigning={isAssigning}
              onAssign={handleAssignResearchLine}
              onRemove={handleRemoveResearchLine}
            />
          </div>

          <div className="space-y-6">
            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(checked) => updateField("published", checked)}
              order={formData.order}
              onOrderChange={(value) => updateField("order", value)}
            />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/teachers"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
