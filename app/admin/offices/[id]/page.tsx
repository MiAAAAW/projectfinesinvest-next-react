"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT OFFICE PAGE
// Formulario para editar oficina
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { useParams } from "next/navigation";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import {
  OfficeGeneralCard, OfficeLocationCard, OfficeContactCard,
  OfficeScheduleCard, OfficeIconCard, OFFICE_DEFAULTS,
} from "../_components/OfficeFormFields";
import type { OfficeFormData, ScheduleDay } from "../_components/OfficeFormFields";

export default function EditOfficePage() {
  const params = useParams();
  const id = params.id as string;

  // Schedule state (manejado aparte por JSON parse/serialize)
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);

  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    handleSubmit: _baseSubmit,
    handleDelete,
  } = useEntityForm<OfficeFormData>({
    endpoint: "/api/offices",
    entityId: id,
    entityName: "oficina",
    redirectPath: "/admin/offices",
    defaultValues: OFFICE_DEFAULTS,
    mapApiToForm: (data) => {
      // Parsear schedule
      if (data.schedule) {
        try {
          setSchedule(JSON.parse(data.schedule as string));
        } catch {
          setSchedule([{ day: "Lunes - Viernes", hours: "8:00 AM - 4:00 PM" }]);
        }
      } else {
        setSchedule([{ day: "Lunes - Viernes", hours: "8:00 AM - 4:00 PM" }]);
      }
      return {
        name: data.name as string || "",
        description: data.description as string || "",
        location: data.location as string || "",
        building: data.building as string || "",
        floor: data.floor as string || "",
        phone: data.phone as string || "",
        email: data.email as string || "",
        responsible: data.responsible as string || "",
        icon: data.icon as string || "Building2",
        mapUrl: data.mapUrl as string || "",
        order: String(data.order ?? 0),
        published: data.published as boolean ?? true,
      };
    },
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

  if (isFetching) return <EditPageSkeleton />;

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/offices"
        title="Editar Oficina"
        description="Modifica la información de la oficina"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar oficina?"
        deleteDescription="Esta acción no se puede deshacer. La oficina será eliminada permanentemente."
      />

      <form onSubmit={_baseSubmit}>
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
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
