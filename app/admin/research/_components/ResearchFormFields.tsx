"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH LINE FORM FIELDS
// Campos de formulario compartidos entre crear y editar
// ═══════════════════════════════════════════════════════════════════════════════

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES & TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export const RESEARCH_ICON_OPTIONS = [
  { value: "FlaskConical", label: "Matraz (Ciencia)" },
  { value: "Microscope", label: "Microscopio" },
  { value: "Dna", label: "ADN" },
  { value: "Brain", label: "Cerebro" },
  { value: "Cpu", label: "Procesador (Tech)" },
  { value: "Database", label: "Base de datos" },
  { value: "Globe", label: "Globo (Global)" },
  { value: "Leaf", label: "Hoja (Ambiente)" },
  { value: "Building", label: "Edificio" },
  { value: "GraduationCap", label: "Graduación" },
  { value: "BookOpen", label: "Libro abierto" },
  { value: "Users", label: "Usuarios" },
  { value: "BarChart3", label: "Gráfico (Estadística)" },
  { value: "Code", label: "Código" },
  { value: "Shield", label: "Seguridad" },
] as const;

export interface ResearchFormData {
  title: string;
  description: string;
  icon: string;
  coordinator: string;
  members: string;
  href: string;
  order: string;
  published: boolean;
}

export const RESEARCH_DEFAULTS: ResearchFormData = {
  title: "",
  description: "",
  icon: "FlaskConical",
  coordinator: "",
  members: "",
  href: "",
  order: "0",
  published: true,
};

interface ResearchFormFieldsProps {
  formData: ResearchFormData;
  updateField: (field: keyof ResearchFormData, value: string | boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: INFORMACIÓN BÁSICA
// ═══════════════════════════════════════════════════════════════════════════════

export function ResearchContentCard({ formData, updateField }: ResearchFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información</CardTitle>
        <CardDescription>Datos principales de la línea de investigación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Nombre de la línea *</Label>
          <Input
            id="title"
            placeholder="Ej: Inteligencia Artificial y Machine Learning"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            placeholder="Describe el enfoque y objetivos..."
            rows={5}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="href">Enlace a más información</Label>
          <Input
            id="href"
            type="text"
            placeholder="ejemplo.com/ruta, #seccion, o URL completa"
            value={formData.href}
            onChange={(e) => updateField("href", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Acepta: dominio.com/ruta, #ancla, /ruta-relativa, o URL completa
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SIDEBAR - ÍCONO
// ═══════════════════════════════════════════════════════════════════════════════

export function ResearchIconCard({ formData, updateField }: ResearchFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Icono</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => updateField("icon", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un icono" />
            </SelectTrigger>
            <SelectContent>
              {RESEARCH_ICON_OPTIONS.map((icon) => (
                <SelectItem key={icon.value} value={icon.value}>
                  {icon.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
