"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT AGREEMENT PAGE
// Formulario para editar un convenio existente
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import {
  AgreementContentCard, AgreementSettingsCard, AGREEMENT_DEFAULTS,
} from "../_components";
import type { AgreementFormData } from "../_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

const mapApiToForm = (data: Record<string, unknown>): AgreementFormData => ({
  title: (data.title as string) || "",
  institution: (data.institution as string) || "",
  country: (data.country as string) || "",
  type: (data.type as string) || "marco",
  startDate: data.startDate
    ? new Date(data.startDate as string).toISOString().split("T")[0]
    : "",
  endDate: data.endDate
    ? new Date(data.endDate as string).toISOString().split("T")[0]
    : "",
  status: (data.status as string) || "vigente",
  fileUrl: (data.fileUrl as string) || "",
  logoUrl: (data.logoUrl as string) || "",
  description: (data.description as string) || "",
  published: (data.published as boolean) ?? true,
});

export default function EditAgreementPage({ params }: PageProps) {
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
  } = useEntityForm<AgreementFormData>({
    endpoint: "/api/agreements",
    entityId: id,
    entityName: "convenio",
    redirectPath: "/admin/agreements",
    defaultValues: AGREEMENT_DEFAULTS,
    mapApiToForm,
    mapFormToApi,
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Convenio no encontrado"
        description="El convenio que buscas no existe o fue eliminado."
        backHref="/admin/agreements"
        backLabel="Volver a convenios"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/agreements"
        title="Editar Convenio"
        description="Modifica la información del convenio"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar convenio?"
        deleteDescription="Esta acción no se puede deshacer. El convenio será eliminado permanentemente."
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
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
