"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW RESOLUCIÓN RECTORAL PAGE
// Formulario para crear nueva resolución rectoral
// ═══════════════════════════════════════════════════════════════════════════════

import { useEntityForm } from "@/hooks/use-entity-form";
import { CreatePageHeader, FormActionsCard } from "@/components/admin";
import {
  ResolutionContentCard, ResolutionSettingsCard, getResolutionDefaults,
} from "../../_components";
import type { ResolutionFormData } from "../../_components";

export default function NewResolucionRectoralPage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<ResolutionFormData>({
    endpoint: "/api/resolutions",
    entityName: "resolución",
    redirectPath: "/admin/resolutions/rectorales",
    defaultValues: getResolutionDefaults("rectoral"),
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

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/resolutions/rectorales"
        title="Nueva Resolución Rectoral"
        description="Crea una nueva resolución rectoral"
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
              saveLabel="Guardar resolución"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
