"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT FORM FIELDS
// Campos reutilizables para formularios de estudiantes (new + edit).
// Todos los selects vienen de lib/constants/students (cero hardcode).
// ═══════════════════════════════════════════════════════════════════════════════

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  STUDENT_PROGRAMS,
  STUDENT_STATUSES,
  ADMISSION_TYPES,
  SEMESTER_PERIODS,
  DOCUMENT_TYPES,
} from "@/lib/constants/students";

export interface StudentFormData {
  // Identidad (User)
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  avatarUrl: string;

  // Académico (Student)
  universityCode: string;
  program: string;
  admissionYear: string;
  admissionSemester: string;
  admissionType: string;
  currentSemester: string;
  graduationYear: string;
  graduationSemester: string;
  status: string;

  // Perfil/investigación
  bio: string;
  orcid: string;
  googleScholar: string;
  scopusId: string;
  linkedin: string;
  researchInterests: string;

  // Meta
  published: boolean;
  featured: boolean;
  order: string;
  notes: string;
}

export const STUDENT_DEFAULTS: StudentFormData = {
  firstName: "",
  lastNamePaternal: "",
  lastNameMaternal: "",
  email: "",
  phone: "",
  documentType: "DNI",
  documentNumber: "",
  avatarUrl: "",
  universityCode: "",
  program: "",
  admissionYear: "",
  admissionSemester: "",
  admissionType: "",
  currentSemester: "",
  graduationYear: "",
  graduationSemester: "",
  status: "activo",
  bio: "",
  orcid: "",
  googleScholar: "",
  scopusId: "",
  linkedin: "",
  researchInterests: "",
  published: true,
  featured: false,
  order: "0",
  notes: "",
};

interface FieldsProps {
  formData: StudentFormData;
  updateField: <K extends keyof StudentFormData>(field: K, value: StudentFormData[K]) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD · IDENTIDAD (datos personales → User)
// ═══════════════════════════════════════════════════════════════════════════════

export function StudentIdentityCard({ formData, updateField }: FieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identidad</CardTitle>
        <CardDescription>Datos personales del estudiante</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Juan Carlos"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastNamePaternal">Apellido paterno *</Label>
            <Input
              id="lastNamePaternal"
              value={formData.lastNamePaternal}
              onChange={(e) => updateField("lastNamePaternal", e.target.value)}
              placeholder="Pérez"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastNameMaternal">Apellido materno</Label>
            <Input
              id="lastNameMaternal"
              value={formData.lastNameMaternal}
              onChange={(e) => updateField("lastNameMaternal", e.target.value)}
              placeholder="Díaz"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Tipo de documento</Label>
            <Select
              value={formData.documentType}
              onValueChange={(v) => updateField("documentType", v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="documentNumber">Número de documento</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => updateField("documentNumber", e.target.value)}
              placeholder="12345678"
              maxLength={12}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email institucional</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="estudiante@unap.edu.pe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+51 987 654 321"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD · ACADÉMICO
// ═══════════════════════════════════════════════════════════════════════════════

export function StudentAcademicCard({ formData, updateField }: FieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos académicos</CardTitle>
        <CardDescription>Información de matrícula y estado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="universityCode">Código universitario *</Label>
            <Input
              id="universityCode"
              value={formData.universityCode}
              onChange={(e) => updateField("universityCode", e.target.value)}
              placeholder="210800"
              required
              maxLength={12}
            />
          </div>
          <div className="space-y-2">
            <Label>Programa / Carrera</Label>
            <Select
              value={formData.program || "__none__"}
              onValueChange={(v) => updateField("program", v === "__none__" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="Selecciona un programa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">(Sin asignar)</SelectItem>
                {STUDENT_PROGRAMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="admissionYear">Año ingreso</Label>
            <Input
              id="admissionYear"
              type="number"
              min={2000}
              max={2100}
              value={formData.admissionYear}
              onChange={(e) => updateField("admissionYear", e.target.value)}
              placeholder="2020"
            />
          </div>
          <div className="space-y-2">
            <Label>Semestre ingreso</Label>
            <Select
              value={formData.admissionSemester || "__none__"}
              onValueChange={(v) => updateField("admissionSemester", v === "__none__" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">(Sin asignar)</SelectItem>
                {SEMESTER_PERIODS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de ingreso</Label>
            <Select
              value={formData.admissionType || "__none__"}
              onValueChange={(v) => updateField("admissionType", v === "__none__" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">(Sin asignar)</SelectItem>
                {ADMISSION_TYPES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentSemester">Semestre actual</Label>
            <Input
              id="currentSemester"
              type="number"
              min={1}
              max={20}
              value={formData.currentSemester}
              onChange={(e) => updateField("currentSemester", e.target.value)}
              placeholder="1-10"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="graduationYear">Año egreso</Label>
            <Input
              id="graduationYear"
              type="number"
              min={2000}
              max={2100}
              value={formData.graduationYear}
              onChange={(e) => updateField("graduationYear", e.target.value)}
              placeholder="(opcional)"
            />
          </div>
          <div className="space-y-2">
            <Label>Semestre egreso</Label>
            <Select
              value={formData.graduationSemester || "__none__"}
              onValueChange={(v) => updateField("graduationSemester", v === "__none__" ? "" : v)}
            >
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">(Sin asignar)</SelectItem>
                {SEMESTER_PERIODS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => updateField("status", v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STUDENT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD · PERFIL (bio + redes académicas)
// ═══════════════════════════════════════════════════════════════════════════════

export function StudentProfileCard({ formData, updateField }: FieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil académico</CardTitle>
        <CardDescription>Biografía e identificadores de investigación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Breve descripción del estudiante..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="researchInterests">Intereses de investigación</Label>
          <Textarea
            id="researchInterests"
            value={formData.researchInterests}
            onChange={(e) => updateField("researchInterests", e.target.value)}
            placeholder="Machine learning, análisis de datos, bioestadística..."
            rows={2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orcid">ORCID</Label>
            <Input
              id="orcid"
              value={formData.orcid}
              onChange={(e) => updateField("orcid", e.target.value)}
              placeholder="0000-0000-0000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scopusId">Scopus ID</Label>
            <Input
              id="scopusId"
              value={formData.scopusId}
              onChange={(e) => updateField("scopusId", e.target.value)}
              placeholder="57123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleScholar">Google Scholar</Label>
            <Input
              id="googleScholar"
              value={formData.googleScholar}
              onChange={(e) => updateField("googleScholar", e.target.value)}
              placeholder="scholar.google.com/citations?user=..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
              placeholder="linkedin.com/in/..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
