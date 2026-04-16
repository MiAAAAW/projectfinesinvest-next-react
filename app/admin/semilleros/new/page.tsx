"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW SEMILLERO PAGE
// Formulario para crear nuevo semillero de investigación
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  CreatePageHeader, FormActionsCard,
} from "@/components/admin";
import {
  SemilleroContentCard, SemilleroSettingsCard, SEMILLERO_DEFAULTS,
} from "../_components";
import type { SemilleroFormData, Teacher } from "../_components";

export default function NewSemilleroPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetch("/api/teachers?status=published&limit=100")
      .then((res) => res.json())
      .then((json) => setTeachers(json.data || []))
      .catch(console.error);
  }, []);

  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<SemilleroFormData>({
    endpoint: "/api/semilleros",
    entityName: "semillero",
    redirectPath: "/admin/semilleros",
    defaultValues: SEMILLERO_DEFAULTS,
    mapFormToApi: (form) => ({
      name: form.name,
      description: form.description || null,
      researchLinesText: form.researchLinesText || null,
      advisorId: form.advisorId || null,
      status: form.status,
      published: form.published,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/semilleros"
        title="Nuevo Semillero"
        description="Crea un nuevo semillero de investigación"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SemilleroContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <SemilleroSettingsCard
              formData={formData}
              updateField={updateField}
              teachers={teachers}
            />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/semilleros"
              saveLabel="Guardar semillero"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
