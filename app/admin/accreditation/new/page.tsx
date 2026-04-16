"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW ACCREDITATION STANDARD PAGE
// Formulario para crear nuevo estándar de acreditación
// ═══════════════════════════════════════════════════════════════════════════════

import { useEntityForm } from "@/hooks/use-entity-form";
import { CreatePageHeader, FormActionsCard } from "@/components/admin";
import {
  StandardContentCard, StandardSettingsCard, STANDARD_DEFAULTS,
} from "../_components";
import type { StandardFormData } from "../_components";

export default function NewStandardPage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<StandardFormData>({
    endpoint: "/api/accreditation",
    entityName: "estándar",
    redirectPath: "/admin/accreditation",
    defaultValues: STANDARD_DEFAULTS,
    mapFormToApi: (form) => ({
      code: form.code,
      name: form.name,
      description: form.description || null,
      order: parseInt(form.order) || 0,
      published: form.published,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/accreditation"
        title="Nuevo Estándar"
        description="Crea un nuevo estándar de acreditación"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <StandardContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <StandardSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/accreditation"
              saveLabel="Guardar estándar"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
