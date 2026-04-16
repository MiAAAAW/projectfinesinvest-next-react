"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR EVENT FORM FIELDS
// Campos de formulario compartidos entre crear y editar evento
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
import { CALENDAR_EVENT_TYPES } from "@/lib/admin-constants";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CalendarFormData {
  title: string;
  description: string;
  date: string;
  endDate: string;
  type: string;
  location: string;
  href: string;
  important: boolean;
  published: boolean;
}

export const CALENDAR_DEFAULTS: CalendarFormData = {
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  endDate: "",
  type: "academico",
  location: "",
  href: "",
  important: false,
  published: true,
};

interface CalendarFormFieldsProps {
  formData: CalendarFormData;
  updateField: (field: keyof CalendarFormData, value: string | boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CONTENIDO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function CalendarContentCard({ formData, updateField }: CalendarFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Evento</CardTitle>
        <CardDescription>Datos principales del evento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título del evento *</Label>
          <Input
            id="title"
            placeholder="Ej: Seminario de Investigación"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción detallada del evento..."
            rows={4}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            placeholder="Ej: Auditorio Principal, Sala de Conferencias"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="href">Enlace externo (opcional)</Label>
          <Input
            id="href"
            type="text"
            placeholder="ejemplo.com/evento, #seccion, o URL completa"
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
// COMPONENTE: SIDEBAR - PUBLICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

export function CalendarPublishCard({ formData, updateField }: CalendarFormFieldsProps) {
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
              Visible en el calendario
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
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SIDEBAR - FECHAS
// ═══════════════════════════════════════════════════════════════════════════════

export function CalendarDatesCard({ formData, updateField }: CalendarFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fechas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha de inicio *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => updateField("date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Para eventos de varios días
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SIDEBAR - CLASIFICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

export function CalendarTypeCard({ formData, updateField }: CalendarFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clasificación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo de evento</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => updateField("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {CALENDAR_EVENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
