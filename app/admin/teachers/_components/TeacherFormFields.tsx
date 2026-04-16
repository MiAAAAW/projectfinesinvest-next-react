"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER FORM FIELDS
// Campos de formulario compartidos entre crear y editar docente
// ═══════════════════════════════════════════════════════════════════════════════

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TEACHER_DEGREES, TEACHER_CATEGORIES, TEACHER_EMPLOYMENT_TYPES } from "@/lib/admin-constants";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface TeacherFormData {
  name: string;
  code: string;
  email: string;
  phone: string;
  avatarUrl: string;
  specialty: string;
  degree: string;
  academicTitle: string;
  category: string;
  employmentType: string;
  orcid: string;
  googleScholar: string;
  linkedin: string;
  researchGate: string;
  personalWebsite: string;
  ctiVitaeUrl: string;
  bio: string;
  hindex: string;
  order: string;
  published: boolean;
}

export const TEACHER_DEFAULTS: TeacherFormData = {
  name: "",
  code: "",
  email: "",
  phone: "",
  avatarUrl: "",
  specialty: "",
  degree: "none",
  academicTitle: "",
  category: "none",
  employmentType: "none",
  orcid: "",
  googleScholar: "",
  linkedin: "",
  researchGate: "",
  personalWebsite: "",
  ctiVitaeUrl: "",
  bio: "",
  hindex: "",
  order: "0",
  published: true,
};

interface TeacherFormFieldsProps {
  formData: TeacherFormData;
  updateField: (field: keyof TeacherFormData, value: string | boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: INFORMACIÓN PERSONAL
// ═══════════════════════════════════════════════════════════════════════════════

export function TeacherPersonalCard({ formData, updateField }: TeacherFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>Datos básicos del docente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              placeholder="000376"
              value={formData.code}
              onChange={(e) => updateField("code", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              placeholder="Juan Carlos Pérez García"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Grado Académico</Label>
            <Select
              value={formData.degree}
              onValueChange={(value) => updateField("degree", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un grado" />
              </SelectTrigger>
              <SelectContent>
                {TEACHER_DEGREES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateField("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría</SelectItem>
                {TEACHER_CATEGORIES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(value) => updateField("employmentType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin tipo</SelectItem>
                {TEACHER_EMPLOYMENT_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="academicTitle">Título académico (detallado)</Label>
            <Input
              id="academicTitle"
              placeholder="DOCTOR EN ESTADÍSTICA E INFORMÁTICA"
              value={formData.academicTitle}
              onChange={(e) => updateField("academicTitle", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Mayúsculas sostenidas, estilo CONCYTEC/CTI Vitae
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Input
              id="specialty"
              placeholder="Ej: Inteligencia Artificial"
              value={formData.specialty}
              onChange={(e) => updateField("specialty", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            placeholder="Breve descripción del perfil académico y profesional..."
            rows={4}
            value={formData.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatarUrl">URL de Foto</Label>
          <Input
            id="avatarUrl"
            type="text"
            placeholder="ejemplo.com/foto.jpg o URL completa"
            value={formData.avatarUrl}
            onChange={(e) => updateField("avatarUrl", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Acepta: dominio.com/ruta, o URL completa con https://
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: INFORMACIÓN DE CONTACTO
// ═══════════════════════════════════════════════════════════════════════════════

export function TeacherContactCard({ formData, updateField }: TeacherFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Contacto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="docente@universidad.edu"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="+51 999 999 999"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ENLACES ACADÉMICOS
// ═══════════════════════════════════════════════════════════════════════════════

export function TeacherAcademicLinksCard({ formData, updateField }: TeacherFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enlaces Académicos y Perfiles</CardTitle>
        <CardDescription>IDs o URLs completos. Se normalizan al guardar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orcid">ORCID</Label>
            <Input
              id="orcid"
              placeholder="0000-0002-1234-5678"
              value={formData.orcid}
              onChange={(e) => updateField("orcid", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hindex">h-index</Label>
            <Input
              id="hindex"
              type="number"
              min="0"
              placeholder="5"
              value={formData.hindex}
              onChange={(e) => updateField("hindex", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ctiVitaeUrl">CTI Vitae (CONCYTEC)</Label>
          <Input
            id="ctiVitaeUrl"
            type="text"
            placeholder="https://ctivitae.concytec.gob.pe/appDirectorioCTI/VerDatosInvestigador.do?id_investigador=12345"
            value={formData.ctiVitaeUrl}
            onChange={(e) => updateField("ctiVitaeUrl", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="googleScholar">Google Scholar</Label>
          <Input
            id="googleScholar"
            type="text"
            placeholder="ABC123xyz o URL completa"
            value={formData.googleScholar}
            onChange={(e) => updateField("googleScholar", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Acepta: ID de usuario, o URL completa
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="researchGate">ResearchGate</Label>
            <Input
              id="researchGate"
              type="text"
              placeholder="https://www.researchgate.net/profile/..."
              value={formData.researchGate}
              onChange={(e) => updateField("researchGate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="text"
              placeholder="in/usuario o URL completa"
              value={formData.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="personalWebsite">Web personal</Label>
          <Input
            id="personalWebsite"
            type="text"
            placeholder="https://midominio.com"
            value={formData.personalWebsite}
            onChange={(e) => updateField("personalWebsite", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
