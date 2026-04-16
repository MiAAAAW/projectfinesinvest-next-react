"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW OFFICE PAGE
// Formulario para crear nueva oficina
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  CreatePageHeader, PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import {
  OfficeGeneralCard, OfficeLocationCard, OfficeContactCard,
  OfficeScheduleCard, OfficeIconCard, OFFICE_DEFAULTS,
} from "../_components/OfficeFormFields";
import type { OfficeFormData, ScheduleDay } from "../_components/OfficeFormFields";

export default function NewOfficePage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([
    { day: "Lunes - Viernes", hours: "8:00 AM - 4:00 PM" },
  ]);

  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<OfficeFormData>({
    endpoint: "/api/offices",
    entityName: "oficina",
    redirectPath: "/admin/offices",
    defaultValues: OFFICE_DEFAULTS,
    mapFormToApi: (form) => ({
      name: form.name,
      description: form.description || null,
      location: form.location,
      building: form.building || null,
      floor: form.floor || null,
      phone: form.phone || null,
      email: form.email || null,
      schedule: schedule.length > 0 ? JSON.stringify(schedule) : null,
      responsible: form.responsible || null,
      icon: form.icon,
      mapUrl: form.mapUrl || null,
      order: parseInt(form.order) || 0,
      published: form.published,
    }),
  });

  // Schedule handlers
  const addScheduleDay = () => setSchedule([...schedule, { day: "", hours: "" }]);
  const removeScheduleDay = (index: number) => setSchedule(schedule.filter((_, i) => i !== index));
  const updateScheduleDay = (index: number, field: "day" | "hours", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/offices"
        title="Nueva Oficina"
        description="Agrega una nueva oficina o sede"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <OfficeGeneralCard formData={formData} updateField={updateField} />
            <OfficeLocationCard formData={formData} updateField={updateField} />
            <OfficeContactCard formData={formData} updateField={updateField} />
            <OfficeScheduleCard
              schedule={schedule}
              onAdd={addScheduleDay}
              onRemove={removeScheduleDay}
              onUpdate={updateScheduleDay}
            />
          </div>

          <div className="space-y-6">
            <OfficeIconCard formData={formData} updateField={updateField} />
            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(checked) => updateField("published", checked)}
              order={formData.order}
              onOrderChange={(value) => updateField("order", value)}
            />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/offices"
              saveLabel="Guardar oficina"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
