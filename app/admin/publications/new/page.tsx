"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW PUBLICATION PAGE
// Formulario para crear nueva publicación
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  CreatePageHeader, FormActionsCard,
} from "@/components/admin";
import {
  PublicationContentCard,
  PublicationSettingsCard,
  PUBLICATION_DEFAULTS,
} from "../_components";
import type { PublicationFormData, Teacher } from "../_components";

export default function NewPublicationPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/teachers?status=published&limit=100");
        if (res.ok) {
          const json = await res.json();
          setTeachers(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<PublicationFormData>({
    endpoint: "/api/publications",
    entityName: "publicación",
    redirectPath: "/admin/publications",
    defaultValues: PUBLICATION_DEFAULTS,
    mapFormToApi: (form) => ({
      title: form.title,
      abstract: form.abstract || null,
      journal: form.journal || null,
      year: parseInt(form.year) || new Date().getFullYear(),
      volume: form.volume || null,
      issue: form.issue || null,
      pages: form.pages || null,
      doi: form.doi || null,
      url: form.url || null,
      type: form.type,
      indexedIn: form.indexedIn || null,
      published: form.published,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/publications"
        title="Nueva Publicación"
        description="Agrega una nueva publicación científica o académica"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PublicationContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <PublicationSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/publications"
              saveLabel="Guardar publicación"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
