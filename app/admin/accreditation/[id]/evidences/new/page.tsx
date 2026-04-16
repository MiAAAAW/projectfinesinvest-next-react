"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW SUB-EVIDENCE PAGE
// Formulario para crear nueva sub-evidencia
// ═══════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import { CreatePageHeader, FormActionsCard } from "@/components/admin";
import {
  EvidenceContentCard, EvidenceSettingsCard, EVIDENCE_DEFAULTS,
} from "../../../_components";
import type { EvidenceFormData } from "../../../_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewEvidencePage({ params }: PageProps) {
  const { id } = use(params);

  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<EvidenceFormData>({
    endpoint: `/api/accreditation/${id}/evidences`,
    entityName: "sub-evidencia",
    redirectPath: `/admin/accreditation/${id}`,
    defaultValues: EVIDENCE_DEFAULTS,
    mapFormToApi: (form) => ({
      code: form.code,
      name: form.name,
      category: form.category,
      order: parseInt(form.order) || 0,
      published: form.published,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref={`/admin/accreditation/${id}`}
        title="Nueva Sub-evidencia"
        description="Crea una nueva sub-evidencia para este estándar"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <EvidenceContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <EvidenceSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref={`/admin/accreditation/${id}`}
              saveLabel="Guardar sub-evidencia"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
