"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW AGREEMENT PAGE
// Formulario para crear nuevo convenio
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useEntityForm } from "@/hooks/use-entity-form";
import { CreatePageHeader, FormActionsCard } from "@/components/admin";
import {
  AgreementContentCard, AgreementSettingsCard, AGREEMENT_DEFAULTS,
} from "../_components";
import type { AgreementFormData } from "../_components";

const mapFormToApi = (form: AgreementFormData) => ({
  title: form.title,
  institution: form.institution,
  country: form.country || null,
  type: form.type,
  startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
  endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
  status: form.status,
  fileUrl: form.fileUrl || null,
  logoUrl: form.logoUrl || null,
  description: form.description || null,
  published: form.published,
});

export default function NewAgreementPage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<AgreementFormData>({
    endpoint: "/api/agreements",
    entityName: "convenio",
    redirectPath: "/admin/agreements",
    defaultValues: AGREEMENT_DEFAULTS,
    mapFormToApi,
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/agreements"
        title="Nuevo Convenio"
        description="Crea un nuevo convenio institucional"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AgreementContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <AgreementSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/agreements"
              saveLabel="Guardar convenio"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
