"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT ANNOUNCEMENT PAGE
// Formulario para editar un anuncio existente
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import {
  AnnouncementContentCard, AnnouncementPublishCard,
  AnnouncementClassificationCard, ANNOUNCEMENT_DEFAULTS,
} from "../_components/AnnouncementFormFields";
import type { AnnouncementFormData } from "../_components/AnnouncementFormFields";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAnnouncementPage({ params }: PageProps) {
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
  } = useEntityForm<AnnouncementFormData>({
    endpoint: "/api/announcements",
    entityId: id,
    entityName: "anuncio",
    redirectPath: "/admin/announcements",
    defaultValues: ANNOUNCEMENT_DEFAULTS,
    mapApiToForm: (data) => ({
      title: data.title as string || "",
      excerpt: data.excerpt as string || "",
      content: data.content as string || "",
      type: data.type as string || "noticia",
      icon: data.icon as string || "FileText",
      date: data.date
        ? new Date(data.date as string).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      href: data.href as string || "",
      important: data.important as boolean || false,
      published: data.published as boolean ?? true,
    }),
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Anuncio no encontrado"
        description="El anuncio que buscas no existe o fue eliminado."
        backHref="/admin/announcements"
        backLabel="Volver a anuncios"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/announcements"
        title="Editar Anuncio"
        description="Modifica la información del anuncio"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar anuncio?"
        deleteDescription="Esta acción no se puede deshacer. El anuncio será eliminado permanentemente."
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
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
