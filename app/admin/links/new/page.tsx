"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW LINK PAGE
// Formulario para crear nuevo enlace externo
// ═══════════════════════════════════════════════════════════════════════════════

import { useEntityForm } from "@/hooks/use-entity-form";
import {
  CreatePageHeader, PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import { LinkContentCard, LinkSettingsCard, LINK_DEFAULTS } from "../_components";
import type { LinkFormData } from "../_components";

export default function NewLinkPage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<LinkFormData>({
    endpoint: "/api/links",
    entityName: "enlace",
    redirectPath: "/admin/links",
    defaultValues: LINK_DEFAULTS,
    mapFormToApi: (form) => ({
      title: form.title,
      url: form.url,
      description: form.description || null,
      category: form.category,
      icon: form.icon,
      order: parseInt(form.order) || 0,
      published: form.published,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/links"
        title="Nuevo Enlace"
        description="Agrega un nuevo enlace externo"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <LinkContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <LinkSettingsCard formData={formData} updateField={updateField} />
            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(checked) => updateField("published", checked)}
              order={formData.order}
              onOrderChange={(value) => updateField("order", value)}
            />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/links"
              saveLabel="Guardar enlace"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
