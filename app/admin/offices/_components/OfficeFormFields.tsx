"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICE FORM FIELDS
// Campos de formulario compartidos entre crear y editar oficina
// ═══════════════════════════════════════════════════════════════════════════════

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicIcon } from "@/lib/icons";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES & TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export const OFFICE_ICON_OPTIONS = [
  { value: "Building2", label: "Edificio" },
  { value: "MapPin", label: "Ubicación" },
  { value: "Briefcase", label: "Maletín" },
  { value: "FlaskConical", label: "Laboratorio" },
  { value: "GraduationCap", label: "Académico" },
  { value: "Users", label: "Personas" },
  { value: "FileText", label: "Documentos" },
  { value: "Settings", label: "Configuración" },
];

export interface ScheduleDay {
  day: string;
  hours: string;
}

export interface OfficeFormData {
  name: string;
  description: string;
  location: string;
  building: string;
  floor: string;
  phone: string;
  email: string;
  responsible: string;
  icon: string;
  mapUrl: string;
  order: string;
  published: boolean;
}

export const OFFICE_DEFAULTS: OfficeFormData = {
  name: "",
  description: "",
  location: "",
  building: "",
  floor: "",
  phone: "",
  email: "",
  responsible: "",
  icon: "Building2",
  mapUrl: "",
  order: "0",
  published: true,
};

interface OfficeFormFieldsProps {
  formData: OfficeFormData;
  updateField: (field: keyof OfficeFormData, value: string | boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: INFORMACIÓN GENERAL
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeGeneralCard({ formData, updateField }: OfficeFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
        <CardDescription>Datos principales de la oficina</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la oficina *</Label>
          <Input
            id="name"
            placeholder="Ej: Dirección de Investigación"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Breve descripción de la oficina y sus funciones..."
            rows={3}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsible">Responsable</Label>
          <Input
            id="responsible"
            placeholder="Ej: Dr. Juan Pérez García"
            value={formData.responsible}
            onChange={(e) => updateField("responsible", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: UBICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeLocationCard({ formData, updateField }: OfficeFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación</CardTitle>
        <CardDescription>Dirección física de la oficina</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Dirección *</Label>
          <Input
            id="location"
            placeholder="Ej: Av. Floral 1153, Puno"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="building">Edificio</Label>
            <Input
              id="building"
              placeholder="Ej: Edificio Administrativo"
              value={formData.building}
              onChange={(e) => updateField("building", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Piso / Oficina</Label>
            <Input
              id="floor"
              placeholder="Ej: Oficina 201, 2do Piso"
              value={formData.floor}
              onChange={(e) => updateField("floor", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mapUrl">Enlace a Google Maps</Label>
          <Input
            id="mapUrl"
            type="text"
            placeholder="maps.google.com/... o URL completa"
            value={formData.mapUrl}
            onChange={(e) => updateField("mapUrl", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Acepta URL de Google Maps con o sin https://
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CONTACTO
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeContactCard({ formData, updateField }: OfficeFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Contacto</CardTitle>
        <CardDescription>Teléfono y correo de la oficina</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="(051) 123-4567"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="oficina@unap.edu.pe"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: HORARIO
// ═══════════════════════════════════════════════════════════════════════════════

interface ScheduleCardProps {
  schedule: ScheduleDay[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: "day" | "hours", value: string) => void;
}

export function OfficeScheduleCard({ schedule, onAdd, onRemove, onUpdate }: ScheduleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horario de Atención</CardTitle>
        <CardDescription>Días y horas de atención al público</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label>Días</Label>
              <Input
                placeholder="Ej: Lunes - Viernes"
                value={item.day}
                onChange={(e) => onUpdate(index, "day", e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Horario</Label>
              <Input
                placeholder="Ej: 8:00 AM - 4:00 PM"
                value={item.hours}
                onChange={(e) => onUpdate(index, "hours", e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              disabled={schedule.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar horario
        </Button>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SIDEBAR - ÍCONO CON PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════

export function OfficeIconCard({ formData, updateField }: OfficeFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Icono</CardTitle>
        <CardDescription>Icono representativo de la oficina</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={formData.icon}
          onValueChange={(value) => updateField("icon", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OFFICE_ICON_OPTIONS.map((icon) => (
              <SelectItem key={icon.value} value={icon.value}>
                <div className="flex items-center gap-2">
                  <DynamicIcon name={icon.value} size={16} />
                  <span>{icon.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <DynamicIcon name={formData.icon} size={32} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
