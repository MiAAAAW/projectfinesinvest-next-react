"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT RESEARCH GROUP PAGE
// Formulario para editar grupo de investigación
// Incluye gestión de miembros del grupo
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import { GroupContentCard, GroupSettingsCard, GroupMembersCard, GROUP_DEFAULTS } from "../_components";
import type { GroupFormData } from "../_components";

export default function EditResearchGroupPage() {
  const params = useParams();
  const id = params.id as string;

  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [researchLines, setResearchLines] = useState<Array<{ id: string; title: string }>>([]);

  // Fetch teachers and research lines for selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, linesRes] = await Promise.all([
          fetch("/api/teachers?status=published&limit=100"),
          fetch("/api/research?status=published&limit=100"),
        ]);

        if (teachersRes.ok) {
          const json = await teachersRes.json();
          setTeachers((json.data || []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name })));
        }
        if (linesRes.ok) {
          const json = await linesRes.json();
          setResearchLines((json.data || []).map((l: { id: string; title: string }) => ({ id: l.id, title: l.title })));
        }
      } catch (error) {
        console.error("Error fetching select data:", error);
      }
    };
    fetchData();
  }, []);

  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    handleSubmit,
    handleDelete,
  } = useEntityForm<GroupFormData>({
    endpoint: "/api/research-groups",
    entityId: id,
    entityName: "grupo de investigación",
    redirectPath: "/admin/research-groups",
    defaultValues: GROUP_DEFAULTS,
    mapApiToForm: (data) => ({
      name: data.name as string || "",
      description: data.description as string || "",
      code: data.code as string || "",
      websiteUrl: data.websiteUrl as string || "",
      leaderId: (data.leader as { id: string } | null)?.id || data.leaderId as string || "",
      researchLineId: (data.researchLine as { id: string } | null)?.id || data.researchLineId as string || "",
      status: data.status as string || "activo",
      published: data.published as boolean ?? true,
    }),
    mapFormToApi: (form) => ({
      name: form.name,
      description: form.description || null,
      code: form.code || null,
      websiteUrl: form.websiteUrl || null,
      leaderId: form.leaderId || null,
      researchLineId: form.researchLineId || null,
      status: form.status,
      published: form.published,
    }),
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Grupo de investigación no encontrado"
        description="El grupo de investigación que buscas no existe o fue eliminado."
        backHref="/admin/research-groups"
        backLabel="Volver a grupos"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/research-groups"
        title="Editar Grupo de Investigación"
        description="Modifica la información y gestiona los miembros del grupo"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar grupo de investigación?"
        deleteDescription="Esta acción no se puede deshacer. El grupo será eliminado junto con todas las asignaciones de miembros."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <GroupContentCard formData={formData} updateField={updateField} />
            <GroupMembersCard groupId={id} />
          </div>

          <div className="space-y-6">
            <GroupSettingsCard
              formData={formData}
              updateField={updateField}
              teachers={teachers}
              researchLines={researchLines}
            />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/research-groups"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
