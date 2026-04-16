"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENT FORM FIELDS
// Campos de formulario compartidos entre crear y editar anuncio
// ═══════════════════════════════════════════════════════════════════════════════

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const ANNOUNCEMENT_TYPES = [
  { value: "convocatoria", label: "Convocatoria" },
  { value: "comunicado", label: "Comunicado" },
  { value: "evento", label: "Evento" },
  { value: "noticia", label: "Noticia" },
];

const ICON_OPTIONS = [
  { value: "FileText", label: "Documento" },
  { value: "Calendar", label: "Calendario" },
  { value: "Bell", label: "Campana" },
  { value: "Megaphone", label: "Megáfono" },
  { value: "AlertCircle", label: "Alerta" },
  { value: "Award", label: "Premio" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnnouncementFormData {
  title: string;
  excerpt: string;
  content: string;
  type: string;
  icon: string;
  date: string;
  href: string;
  important: boolean;
  published: boolean;
}

export const ANNOUNCEMENT_DEFAULTS: AnnouncementFormData = {
  title: "",
  excerpt: "",
  content: "",
  type: "noticia",
  icon: "FileText",
  date: new Date().toISOString().split("T")[0],
  href: "",
  important: false,
  published: true,
};

interface AnnouncementFormFieldsProps {
  formData: AnnouncementFormData;
  updateField: (field: keyof AnnouncementFormData, value: string | boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CONTENIDO PRINCIPAL (columna izquierda)
// ═══════════════════════════════════════════════════════════════════════════════

export function AnnouncementContentCard({ formData, updateField }: AnnouncementFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido</CardTitle>
        <CardDescription>
          Información principal del anuncio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Título del anuncio"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Resumen</Label>
          <Textarea
            id="excerpt"
            placeholder="Breve descripción del anuncio (se muestra en la lista)"
            rows={2}
            value={formData.excerpt}
            onChange={(e) => updateField("excerpt", e.target.value)}
          />
          <p className={`text-xs ${formData.excerpt.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
            {formData.excerpt.length}/160 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Contenido completo *</Label>
          <Textarea
            id="content"
            placeholder="Contenido detallado del anuncio..."
            rows={10}
            value={formData.content}
            onChange={(e) => updateField("content", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Puedes usar formato Markdown
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="href">Enlace externo (opcional)</Label>
          <Input
            id="href"
            type="text"
            placeholder="ejemplo.com/doc.pdf, #seccion, o URL completa"
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
// COMPONENTE: SIDEBAR - PUBLICACIÓN (extras: important + date)
// ═══════════════════════════════════════════════════════════════════════════════

export function AnnouncementPublishCard({ formData, updateField }: AnnouncementFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="published">Publicar</Label>
            <p className="text-xs text-muted-foreground">
              Visible en el landing
            </p>
          </div>
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => updateField("published", checked)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="important">Destacado</Label>
            <p className="text-xs text-muted-foreground">
              Mostrar con badge &quot;Importante&quot;
            </p>
          </div>
          <Switch
            id="important"
            checked={formData.important}
            onCheckedChange={(checked) => updateField("important", checked)}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SIDEBAR - CLASIFICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

export function AnnouncementClassificationCard({ formData, updateField }: AnnouncementFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clasificación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo de anuncio</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => updateField("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {ANNOUNCEMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {ICON_OPTIONS.map((icon) => (
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
