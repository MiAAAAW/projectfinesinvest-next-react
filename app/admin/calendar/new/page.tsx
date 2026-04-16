"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW CALENDAR EVENT PAGE
// Formulario para crear nuevo evento
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useEntityForm } from "@/hooks/use-entity-form";
import { CreatePageHeader, FormActionsCard } from "@/components/admin";
import {
  CalendarContentCard, CalendarPublishCard,
  CalendarDatesCard, CalendarTypeCard, CALENDAR_DEFAULTS,
} from "../_components/CalendarFormFields";
import type { CalendarFormData } from "../_components/CalendarFormFields";

export default function NewCalendarEventPage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<CalendarFormData>({
    endpoint: "/api/calendar",
    entityName: "evento",
    redirectPath: "/admin/calendar",
    defaultValues: CALENDAR_DEFAULTS,
    mapFormToApi: (form) => ({
      ...form,
      endDate: form.endDate || null,
      description: form.description || null,
      location: form.location || null,
      href: form.href || null,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/calendar"
        title="Nuevo Evento"
        description="Crea un nuevo evento para el calendario"
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
              saveLabel="Guardar evento"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
