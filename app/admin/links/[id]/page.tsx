"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT LINK PAGE
// Formulario para editar enlace externo
// ═══════════════════════════════════════════════════════════════════════════════

import { useParams } from "next/navigation";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import { LinkContentCard, LinkSettingsCard, LINK_DEFAULTS } from "../_components";
import type { LinkFormData } from "../_components";

export default function EditLinkPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    handleSubmit,
    handleDelete,
  } = useEntityForm<LinkFormData>({
    endpoint: "/api/links",
    entityId: id,
    entityName: "enlace",
    redirectPath: "/admin/links",
    defaultValues: LINK_DEFAULTS,
    mapApiToForm: (data) => ({
      title: (data.title as string) || "",
      url: (data.url as string) || "",
      description: (data.description as string) || "",
      category: (data.category as string) || "general",
      icon: (data.icon as string) || "ExternalLink",
      order: String(data.order ?? 0),
      published: (data.published as boolean) ?? true,
    }),
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

  if (isFetching) return <EditPageSkeleton />;

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/links"
        title="Editar Enlace"
        description="Modifica la información del enlace externo"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar enlace?"
        deleteDescription="Esta acción no se puede deshacer. El enlace será eliminado permanentemente."
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
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
