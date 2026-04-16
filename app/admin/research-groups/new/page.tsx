"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW RESEARCH GROUP PAGE
// Formulario para crear nuevo grupo de investigación
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  CreatePageHeader, FormActionsCard,
} from "@/components/admin";
import { GroupContentCard, GroupSettingsCard, GROUP_DEFAULTS } from "../_components";
import type { GroupFormData } from "../_components";

export default function NewResearchGroupPage() {
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [researchLines, setResearchLines] = useState<Array<{ id: string; title: string }>>([]);

  // Fetch teachers and research lines for selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, linesRes] = await Promise.all([
          fetch("/api/teachers?status=published&limit=100"),
          fetch("/api/research?status=published&limit=100"),
        ]);

        if (teachersRes.ok) {
          const json = await teachersRes.json();
          setTeachers((json.data || []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name })));
        }
        if (linesRes.ok) {
          const json = await linesRes.json();
          setResearchLines((json.data || []).map((l: { id: string; title: string }) => ({ id: l.id, title: l.title })));
        }
      } catch (error) {
        console.error("Error fetching select data:", error);
      }
    };
    fetchData();
  }, []);

  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<GroupFormData>({
    endpoint: "/api/research-groups",
    entityName: "grupo de investigación",
    redirectPath: "/admin/research-groups",
    defaultValues: GROUP_DEFAULTS,
    mapFormToApi: (form) => ({
      name: form.name,
      description: form.description || null,
      code: form.code || null,
      websiteUrl: form.websiteUrl || null,
      leaderId: form.leaderId || null,
      researchLineId: form.researchLineId || null,
      status: form.status,
      published: form.published,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/research-groups"
        title="Nuevo Grupo de Investigación"
        description="Crea un nuevo grupo de investigación"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <GroupContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <GroupSettingsCard
              formData={formData}
              updateField={updateField}
              teachers={teachers}
              researchLines={researchLines}
            />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/research-groups"
              saveLabel="Guardar grupo"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
