"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW RESEARCH LINE PAGE
// Formulario para crear nueva línea de investigación
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  CreatePageHeader, PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import { ResearchContentCard, ResearchIconCard, RESEARCH_DEFAULTS } from "../_components/ResearchFormFields";
import type { ResearchFormData } from "../_components/ResearchFormFields";

export default function NewResearchLinePage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<ResearchFormData>({
    endpoint: "/api/research",
    entityName: "línea de investigación",
    redirectPath: "/admin/research",
    defaultValues: RESEARCH_DEFAULTS,
    mapFormToApi: (form) => ({
      ...form,
      members: form.members ? parseInt(form.members) : null,
      order: parseInt(form.order) || 0,
      coordinator: form.coordinator || null,
      href: form.href || null,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/research"
        title="Nueva Línea de Investigación"
        description="Agrega una nueva línea de investigación a la facultad"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ResearchContentCard formData={formData} updateField={updateField} />

            {/* Equipo (campos legacy para crear) */}
            <Card>
              <CardHeader>
                <CardTitle>Equipo</CardTitle>
                <CardDescription>
                  Información sobre el equipo de investigación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coordinator">Coordinador</Label>
                  <Input
                    id="coordinator"
                    placeholder="Nombre del coordinador de la línea"
                    value={formData.coordinator}
                    onChange={(e) => updateField("coordinator", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="members">Número de investigadores</Label>
                  <Input
                    id="members"
                    type="number"
                    min="0"
                    placeholder="Ej: 12"
                    value={formData.members}
                    onChange={(e) => updateField("members", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(checked) => updateField("published", checked)}
              order={formData.order}
              onOrderChange={(value) => updateField("order", value)}
            />
            <ResearchIconCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/research"
              saveLabel="Guardar línea"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
