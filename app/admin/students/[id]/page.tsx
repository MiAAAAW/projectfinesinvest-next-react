"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT STUDENT PAGE
// Edita estudiante existente (User + Student unificado).
// El API PUT se encarga de la transacción atómica.
// ═══════════════════════════════════════════════════════════════════════════════

import { use } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState,
  PublishSettingsCard, FormActionsCard,
} from "@/components/admin";
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

interface PageProps {
  params: Promise<{ id: string }>;
}

const toIntOrNull = (v: string) => {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};
const toStringOrNull = (v: string) => (v.trim() === "" ? null : v.trim());

// Hidrata los 3 campos de nombre desde el `name` legacy unificado.
// Solo devuelve un split "confiable" cuando hay exactamente 3 tokens.
// Casos ambiguos (2 o 4+ tokens, nombres compuestos, etc.) dejan los campos
// VACÍOS y el `name` original queda en firstName como marcador visible.
// El admin debe completar manualmente.
function splitLegacyName(fullName: string): {
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 3) {
    return { firstName: parts[0], lastNamePaternal: parts[1], lastNameMaternal: parts[2] };
  }
  // Ambigüedad: no intentamos adivinar. Ponemos todo en firstName para que el admin lo corrija.
  return { firstName: fullName.trim(), lastNamePaternal: "", lastNameMaternal: "" };
}

export default function EditStudentPage({ params }: PageProps) {
  const { id } = use(params);

  const {
    formData, updateField, isLoading, isDeleting, isFetching, notFound,
    handleSubmit, handleDelete,
  } = useEntityForm<StudentFormData>({
    endpoint: "/api/students",
    entityId: id,
    entityName: "estudiante",
    redirectPath: "/admin/students",
    defaultValues: STUDENT_DEFAULTS,
    mapApiToForm: (data) => {
      const user = (data.user ?? {}) as Record<string, unknown>;
      const legacyName = (user.name as string) ?? "";
      const { firstName, lastNamePaternal, lastNameMaternal } = splitLegacyName(legacyName);
      return {
        firstName,
        lastNamePaternal,
        lastNameMaternal,
        email: (user.email as string) ?? "",
        phone: (user.phone as string) ?? "",
        documentType: "DNI",
        documentNumber: (user.dni as string) ?? "",
        avatarUrl: (user.avatarUrl as string) ?? "",
        universityCode: (data.universityCode as string) ?? "",
        program: (data.program as string) ?? "",
        admissionYear: data.admissionYear != null ? String(data.admissionYear) : "",
        admissionSemester: (data.admissionSemester as string) ?? "",
        admissionType: (data.admissionType as string) ?? "",
        currentSemester: data.currentSemester != null ? String(data.currentSemester) : "",
        graduationYear: data.graduationYear != null ? String(data.graduationYear) : "",
        graduationSemester: (data.graduationSemester as string) ?? "",
        status: (data.status as string) ?? "activo",
        bio: (data.bio as string) ?? "",
        orcid: (data.orcid as string) ?? "",
        googleScholar: (data.googleScholar as string) ?? "",
        scopusId: (data.scopusId as string) ?? "",
        linkedin: (data.linkedin as string) ?? "",
        researchInterests: (data.researchInterests as string) ?? "",
        published: (data.published as boolean) ?? true,
        featured: (data.featured as boolean) ?? false,
        order: data.order != null ? String(data.order) : "0",
        notes: (data.notes as string) ?? "",
      };
    },
    mapFormToApi: (form) => ({
      firstName: form.firstName.trim(),
      lastNamePaternal: form.lastNamePaternal.trim(),
      lastNameMaternal: toStringOrNull(form.lastNameMaternal),
      email: toStringOrNull(form.email),
      phone: toStringOrNull(form.phone),
      documentType: form.documentType || "DNI",
      documentNumber: toStringOrNull(form.documentNumber),
      avatarUrl: toStringOrNull(form.avatarUrl),
      universityCode: form.universityCode.trim(),
      program: toStringOrNull(form.program),
      admissionYear: toIntOrNull(form.admissionYear),
      admissionSemester: toStringOrNull(form.admissionSemester),
      admissionType: toStringOrNull(form.admissionType),
      currentSemester: toIntOrNull(form.currentSemester),
      graduationYear: toIntOrNull(form.graduationYear),
      graduationSemester: toStringOrNull(form.graduationSemester),
      status: form.status,
      bio: toStringOrNull(form.bio),
      orcid: toStringOrNull(form.orcid),
      googleScholar: toStringOrNull(form.googleScholar),
      scopusId: toStringOrNull(form.scopusId),
      linkedin: toStringOrNull(form.linkedin),
      researchInterests: toStringOrNull(form.researchInterests),
      published: form.published,
      featured: form.featured,
      order: parseInt(form.order, 10) || 0,
      notes: toStringOrNull(form.notes),
    }),
  });

  if (isFetching) return <EditPageSkeleton />;
  if (notFound) {
    return (
      <NotFoundState
        title="Estudiante no encontrado"
        description="El estudiante que buscas no existe o fue eliminado."
        backHref="/admin/students"
        backLabel="Volver a estudiantes"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/students"
        title="Editar Estudiante"
        description="Modifica la información académica y personal del estudiante"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar estudiante?"
        deleteDescription="Se marcará como eliminado y se desactivará su rol y cuenta. Se preserva el historial."
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
              saveLabel="Guardar cambios"
              isLoading={isLoading}
              cancelHref="/admin/students"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
