"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT SUB-EVIDENCE PAGE
// Formulario para editar sub-evidencia + gestionar documentos
// ═══════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import {
  EvidenceContentCard, EvidenceSettingsCard, DocumentUploadCard, EVIDENCE_DEFAULTS,
} from "../../../_components";
import type { EvidenceFormData } from "../../../_components";

interface PageProps {
  params: Promise<{ id: string; evidenceId: string }>;
}

export default function EditEvidencePage({ params }: PageProps) {
  const { id, evidenceId } = use(params);

  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    handleSubmit,
    handleDelete,
  } = useEntityForm<EvidenceFormData>({
    endpoint: `/api/accreditation/${id}/evidences`,
    entityId: evidenceId,
    entityName: "sub-evidencia",
    redirectPath: `/admin/accreditation/${id}`,
    defaultValues: EVIDENCE_DEFAULTS,
    mapApiToForm: (data) => ({
      code: (data.code as string) || "",
      name: (data.name as string) || "",
      category: (data.category as string) || "Planificación",
      order: String(data.order ?? 0),
      published: (data.published as boolean) ?? true,
    }),
    mapFormToApi: (form) => ({
      code: form.code,
      name: form.name,
      category: form.category,
      order: parseInt(form.order) || 0,
      published: form.published,
    }),
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Sub-evidencia no encontrada"
        description="La sub-evidencia que buscas no existe o fue eliminada."
        backHref={`/admin/accreditation/${id}`}
        backLabel="Volver al estándar"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref={`/admin/accreditation/${id}`}
        title="Editar Sub-evidencia"
        description="Modifica la información de la sub-evidencia"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar sub-evidencia?"
        deleteDescription="Esta acción no se puede deshacer. La sub-evidencia y todos sus documentos serán eliminados permanentemente."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <EvidenceContentCard formData={formData} updateField={updateField} />
            <DocumentUploadCard standardId={id} evidenceId={evidenceId} />
          </div>

          <div className="space-y-6">
            <EvidenceSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref={`/admin/accreditation/${id}`}
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
