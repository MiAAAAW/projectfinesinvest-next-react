"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT RESOLUCIÓN RECTORAL PAGE
// Formulario para editar una resolución rectoral existente
// ═══════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import {
  ResolutionContentCard, ResolutionSettingsCard, getResolutionDefaults,
} from "../../_components";
import type { ResolutionFormData } from "../../_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditResolucionRectoralPage({ params }: PageProps) {
  const { id } = use(params);

  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    handleSubmit,
    handleDelete,
  } = useEntityForm<ResolutionFormData>({
    endpoint: "/api/resolutions",
    entityId: id,
    entityName: "resolución",
    redirectPath: "/admin/resolutions/rectorales",
    defaultValues: getResolutionDefaults("rectoral"),
    mapApiToForm: (data) => ({
      number: (data.number as string) || "",
      subject: (data.subject as string) || "",
      type: (data.type as string) || "rectoral",
      date: data.date
        ? new Date(data.date as string).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      year: data.year ? String(data.year) : new Date().getFullYear().toString(),
      fileUrl: (data.fileUrl as string) || "",
      fileSize: (data.fileSize as string) || "",
      published: (data.published as boolean) ?? true,
    }),
    mapFormToApi: (form) => ({
      number: form.number,
      subject: form.subject,
      type: "rectoral",
      date: form.date,
      year: parseInt(form.year),
      fileUrl: form.fileUrl || null,
      fileSize: form.fileSize || null,
      published: form.published,
    }),
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Resolución no encontrada"
        description="La resolución que buscas no existe o fue eliminada."
        backHref="/admin/resolutions/rectorales"
        backLabel="Volver a resoluciones rectorales"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/resolutions/rectorales"
        title="Editar Resolución Rectoral"
        description="Modifica la información de la resolución"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar resolución?"
        deleteDescription="Esta acción no se puede deshacer. La resolución será eliminada permanentemente."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ResolutionContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <ResolutionSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/resolutions/rectorales"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
