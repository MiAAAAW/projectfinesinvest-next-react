"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT SEMILLERO PAGE
// Formulario para editar semillero de investigación
// ═══════════════════════════════════════════════════════════════════════════════

import { use, useState, useEffect } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import {
  SemilleroContentCard, SemilleroSettingsCard,
  SEMILLERO_DEFAULTS,
} from "../_components";
import type { SemilleroFormData, Teacher } from "../_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSemilleroPage({ params }: PageProps) {
  const { id } = use(params);
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
    isDeleting,
    isFetching,
    notFound,
    handleSubmit,
    handleDelete,
  } = useEntityForm<SemilleroFormData>({
    endpoint: "/api/semilleros",
    entityId: id,
    entityName: "semillero",
    redirectPath: "/admin/semilleros",
    defaultValues: SEMILLERO_DEFAULTS,
    mapApiToForm: (data) => ({
      name: (data.name as string) || "",
      description: (data.description as string) || "",
      researchLinesText: (data.researchLinesText as string) || "",
      advisorId: (data.advisorId as string) || "",
      status: (data.status as string) || "activo",
      published: (data.published as boolean) ?? true,
    }),
    mapFormToApi: (form) => ({
      name: form.name,
      description: form.description || null,
      researchLinesText: form.researchLinesText || null,
      advisorId: form.advisorId || null,
      status: form.status,
      published: form.published,
    }),
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Semillero no encontrado"
        description="El semillero que buscas no existe o fue eliminado."
        backHref="/admin/semilleros"
        backLabel="Volver a semilleros"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/semilleros"
        title="Editar Semillero"
        description="Modifica la información del semillero"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar semillero?"
        deleteDescription="Esta acción no se puede deshacer. El semillero será eliminado permanentemente junto con todos sus miembros."
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
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
