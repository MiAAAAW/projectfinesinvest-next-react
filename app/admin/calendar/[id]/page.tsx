"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT CALENDAR EVENT PAGE
// Formulario para editar un evento existente
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import {
  CalendarContentCard, CalendarPublishCard,
  CalendarDatesCard, CalendarTypeCard, CALENDAR_DEFAULTS,
} from "../_components/CalendarFormFields";
import type { CalendarFormData } from "../_components/CalendarFormFields";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCalendarEventPage({ params }: PageProps) {
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
  } = useEntityForm<CalendarFormData>({
    endpoint: "/api/calendar",
    entityId: id,
    entityName: "evento",
    redirectPath: "/admin/calendar",
    defaultValues: CALENDAR_DEFAULTS,
    mapApiToForm: (data) => ({
      title: data.title as string || "",
      description: data.description as string || "",
      date: data.date
        ? new Date(data.date as string).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: data.endDate
        ? new Date(data.endDate as string).toISOString().split("T")[0]
        : "",
      type: data.type as string || "academico",
      location: data.location as string || "",
      href: data.href as string || "",
      important: data.important as boolean || false,
      published: data.published as boolean ?? true,
    }),
    mapFormToApi: (form) => ({
      ...form,
      endDate: form.endDate || null,
      description: form.description || null,
      location: form.location || null,
      href: form.href || null,
    }),
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Evento no encontrado"
        description="El evento que buscas no existe o fue eliminado."
        backHref="/admin/calendar"
        backLabel="Volver al calendario"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/calendar"
        title="Editar Evento"
        description="Modifica la información del evento"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar evento?"
        deleteDescription="Esta acción no se puede deshacer. El evento será eliminado permanentemente."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <CalendarContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <CalendarPublishCard formData={formData} updateField={updateField} />
            <CalendarDatesCard formData={formData} updateField={updateField} />
            <CalendarTypeCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/calendar"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
