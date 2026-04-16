"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT RESEARCH LINE PAGE
// Formulario para editar una línea de investigación existente
// Incluye gestión bidireccional de docentes
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { use, useState } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import { useRelationManager } from "@/hooks/use-relation-manager";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState,
  PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import { ResearchContentCard, ResearchIconCard, RESEARCH_DEFAULTS } from "../_components/ResearchFormFields";
import { TeacherAssignment } from "../_components/TeacherAssignment";
import { ResearchLegacyFields } from "../_components/ResearchLegacyFields";
import type { ResearchFormData } from "../_components/ResearchFormFields";
import type { AssignedTeacher, Teacher } from "../_components/TeacherAssignment";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditResearchLinePage({ params }: PageProps) {
  const { id } = use(params);
  const [showLegacy, setShowLegacy] = useState(false);

  // Form hook
  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    handleSubmit: baseHandleSubmit,
    handleDelete,
  } = useEntityForm<ResearchFormData>({
    endpoint: "/api/research",
    entityId: id,
    entityName: "línea de investigación",
    redirectPath: "/admin/research",
    defaultValues: RESEARCH_DEFAULTS,
    mapApiToForm: (data) => {
      if (data.coordinator || data.members) {
        setShowLegacy(true);
      }
      return {
        title: data.title as string || "",
        description: data.description as string || "",
        icon: data.icon as string || "FlaskConical",
        coordinator: data.coordinator as string || "",
        members: data.members?.toString() || "",
        href: data.href as string || "",
        order: data.order?.toString() || "0",
        published: data.published as boolean ?? true,
      };
    },
    mapFormToApi: (form) => ({
      title: form.title,
      description: form.description,
      icon: form.icon,
      href: form.href || null,
      order: parseInt(form.order) || 0,
      published: form.published,
      coordinator: showLegacy ? (form.coordinator || null) : null,
      members: showLegacy ? (form.members ? parseInt(form.members) : null) : null,
    }),
  });

  // Relation manager hook (docentes)
  const relation = useRelationManager<AssignedTeacher, Teacher>({
    relationEndpoint: `/api/research/${id}/teachers`,
    availableEndpoint: "/api/teachers?status=published&limit=100",
    entityName: "docente",
    idFieldName: "teacherId",
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Línea de investigación no encontrada"
        description="La línea de investigación que buscas no existe o fue eliminada."
        backHref="/admin/research"
        backLabel="Volver a investigación"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/research"
        title="Editar Línea de Investigación"
        description="Modifica la información y gestiona los docentes"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar línea de investigación?"
        deleteDescription="Esta acción no se puede deshacer. La línea será eliminada junto con todas las asignaciones de docentes."
      />

      <form onSubmit={baseHandleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ResearchContentCard formData={formData} updateField={updateField} />

            <TeacherAssignment
              assignedTeachers={relation.assignedItems}
              unassignedTeachers={relation.unassignedItems}
              isLoadingTeachers={relation.isLoadingItems}
              assignDialogOpen={relation.assignDialogOpen}
              setAssignDialogOpen={relation.setAssignDialogOpen}
              selectedTeacherId={relation.selectedItemId}
              setSelectedTeacherId={relation.setSelectedItemId}
              selectedRole={relation.selectedRole}
              setSelectedRole={relation.setSelectedRole}
              isAssigning={relation.isAssigning}
              onAssign={relation.handleAssign}
              onUpdateRole={relation.handleUpdateRole}
              onToggleActive={relation.handleToggleActive}
              onRemove={relation.handleRemove}
            />

            <ResearchLegacyFields
              formData={formData}
              updateField={updateField}
              showLegacy={showLegacy}
              setShowLegacy={setShowLegacy}
              assignedCount={relation.assignedItems.length}
            />
          </div>

          <div className="space-y-6">
            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(checked) => updateField("published", checked)}
              order={formData.order}
              onOrderChange={(value) => updateField("order", value)}
            />
            <ResearchIconCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/research"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
