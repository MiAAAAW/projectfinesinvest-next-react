"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW TEACHER PAGE
// Formulario para crear un nuevo docente/investigador
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { Card, CardContent } from "@/components/ui/card";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  CreatePageHeader, PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
import {
  TeacherPersonalCard, TeacherContactCard, TeacherAcademicLinksCard,
  TEACHER_DEFAULTS,
} from "../_components/TeacherFormFields";
import type { TeacherFormData } from "../_components/TeacherFormFields";

export default function NewTeacherPage() {
  const {
    formData,
    updateField,
    isLoading,
    handleSubmit,
  } = useEntityForm<TeacherFormData>({
    endpoint: "/api/teachers",
    entityName: "docente",
    redirectPath: "/admin/teachers",
    defaultValues: TEACHER_DEFAULTS,
    mapFormToApi: (form) => ({
      ...form,
      code: form.code || null,
      email: form.email || null,
      phone: form.phone || null,
      avatarUrl: form.avatarUrl || null,
      specialty: form.specialty || null,
      degree: form.degree === "none" ? null : form.degree || null,
      academicTitle: form.academicTitle || null,
      category: form.category === "none" ? null : form.category || null,
      employmentType: form.employmentType === "none" ? null : form.employmentType || null,
      orcid: form.orcid || null,
      googleScholar: form.googleScholar || null,
      linkedin: form.linkedin || null,
      researchGate: form.researchGate || null,
      personalWebsite: form.personalWebsite || null,
      ctiVitaeUrl: form.ctiVitaeUrl || null,
      bio: form.bio || null,
      hindex: form.hindex ? parseInt(form.hindex) : null,
      order: parseInt(form.order) || 0,
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/teachers"
        title="Nuevo Docente"
        description="Crea un nuevo perfil de docente/investigador"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TeacherPersonalCard formData={formData} updateField={updateField} />
            <TeacherContactCard formData={formData} updateField={updateField} />
            <TeacherAcademicLinksCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(checked) => updateField("published", checked)}
              order={formData.order}
              onOrderChange={(value) => updateField("order", value)}
            />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/teachers"
              saveLabel="Crear Docente"
            />

            <Card className="border-dashed">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Después de crear el docente, podrás
                  asignarle líneas de investigación desde la página de edición.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
