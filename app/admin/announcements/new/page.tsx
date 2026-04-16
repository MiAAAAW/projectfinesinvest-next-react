"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW ANNOUNCEMENT PAGE
// Formulario para crear nuevo anuncio
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useEntityForm } from "@/hooks/use-entity-form";
import { CreatePageHeader, FormActionsCard } from "@/components/admin";
import {
  AnnouncementContentCard, AnnouncementPublishCard,
  AnnouncementClassificationCard, ANNOUNCEMENT_DEFAULTS,
} from "../_components/AnnouncementFormFields";
import type { AnnouncementFormData } from "../_components/AnnouncementFormFields";

export default function NewAnnouncementPage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<AnnouncementFormData>({
    endpoint: "/api/announcements",
    entityName: "anuncio",
    redirectPath: "/admin/announcements",
    defaultValues: ANNOUNCEMENT_DEFAULTS,
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/announcements"
        title="Nuevo Anuncio"
        description="Crea un nuevo anuncio para el landing"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <AnnouncementContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <AnnouncementPublishCard formData={formData} updateField={updateField} />
            <AnnouncementClassificationCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/announcements"
              saveLabel="Guardar anuncio"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
