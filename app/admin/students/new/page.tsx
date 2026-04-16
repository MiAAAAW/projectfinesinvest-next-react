"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NEW STUDENT PAGE
// Crear User + Student + UserRole(estudiante) en un solo flujo.
// Mapea StudentFormData (strings) → payload API (tipos correctos).
// ═══════════════════════════════════════════════════════════════════════════════

import { useEntityForm } from "@/hooks/use-entity-form";
import { CreatePageHeader, PublishSettingsCard, FormActionsCard } from "@/components/admin";
import {
  StudentIdentityCard,
  StudentAcademicCard,
  StudentProfileCard,
  STUDENT_DEFAULTS,
} from "../_components/StudentFormFields";
import type { StudentFormData } from "../_components/StudentFormFields";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Helper: convierte string → int | null (sin hardcode de parseos por todos lados)
const toIntOrNull = (v: string) => {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

const toStringOrNull = (v: string) => (v.trim() === "" ? null : v.trim());

export default function NewStudentPage() {
  const { formData, updateField, isLoading, handleSubmit } = useEntityForm<StudentFormData>({
    endpoint: "/api/students",
    entityName: "estudiante",
    redirectPath: "/admin/students",
    defaultValues: STUDENT_DEFAULTS,
    mapFormToApi: (form) => ({
      // Identidad
      firstName: form.firstName.trim(),
      lastNamePaternal: form.lastNamePaternal.trim(),
      lastNameMaternal: toStringOrNull(form.lastNameMaternal),
      email: toStringOrNull(form.email),
      phone: toStringOrNull(form.phone),
      documentType: form.documentType || "DNI",
      documentNumber: toStringOrNull(form.documentNumber),
      avatarUrl: toStringOrNull(form.avatarUrl),

      // Académico
      universityCode: form.universityCode.trim(),
      program: toStringOrNull(form.program),
      admissionYear: toIntOrNull(form.admissionYear),
      admissionSemester: toStringOrNull(form.admissionSemester),
      admissionType: toStringOrNull(form.admissionType),
      currentSemester: toIntOrNull(form.currentSemester),
      graduationYear: toIntOrNull(form.graduationYear),
      graduationSemester: toStringOrNull(form.graduationSemester),
      status: form.status,

      // Perfil
      bio: toStringOrNull(form.bio),
      orcid: toStringOrNull(form.orcid),
      googleScholar: toStringOrNull(form.googleScholar),
      scopusId: toStringOrNull(form.scopusId),
      linkedin: toStringOrNull(form.linkedin),
      researchInterests: toStringOrNull(form.researchInterests),

      // Meta
      published: form.published,
      featured: form.featured,
      order: parseInt(form.order, 10) || 0,
      notes: toStringOrNull(form.notes),
    }),
  });

  return (
    <div className="space-y-6">
      <CreatePageHeader
        backHref="/admin/students"
        title="Nuevo Estudiante"
        description="Crea el perfil de un nuevo estudiante (se generan automáticamente usuario y rol)"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <StudentIdentityCard formData={formData} updateField={updateField} />
            <StudentAcademicCard formData={formData} updateField={updateField} />
            <StudentProfileCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <PublishSettingsCard
              published={formData.published}
              onPublishedChange={(v) => updateField("published", v)}
            >
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured">Destacar</Label>
                  <p className="text-xs text-muted-foreground">
                    Aparece como estudiante destacado
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(v) => updateField("featured", v)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => updateField("order", e.target.value)}
                />
              </div>
            </PublishSettingsCard>

            <Card>
              <CardHeader><CardTitle className="text-base">Notas internas</CardTitle></CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Solo visibles para admin"
                  rows={3}
                />
              </CardContent>
            </Card>

            <FormActionsCard
              saveLabel="Crear estudiante"
              isLoading={isLoading}
              cancelHref="/admin/students"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
