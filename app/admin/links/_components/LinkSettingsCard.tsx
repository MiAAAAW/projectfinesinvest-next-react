"use client";

import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicIcon } from "@/lib/icons";
import { LINK_CATEGORIES } from "@/lib/constants/links";
import type { LinkFormData } from "./types";

const LINK_ICON_OPTIONS = [
  { value: "ExternalLink", label: "Enlace externo" },
  { value: "Globe", label: "Globo" },
  { value: "Database", label: "Base de datos" },
  { value: "BookOpen", label: "Libro" },
  { value: "FileText", label: "Documento" },
  { value: "Code", label: "Código" },
  { value: "FlaskConical", label: "Investigación" },
  { value: "GraduationCap", label: "Académico" },
  { value: "FolderOpen", label: "Carpeta" },
  { value: "Monitor", label: "Monitor" },
];

interface LinkSettingsCardProps {
  formData: LinkFormData;
  updateField: (field: keyof LinkFormData, value: string | boolean) => void;
}

export function LinkSettingsCard({ formData, updateField }: LinkSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración</CardTitle>
        <CardDescription>Categoría e icono del enlace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => updateField("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {LINK_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="icon">Icono</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => updateField("icon", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LINK_ICON_OPTIONS.map((icon) => (
                <SelectItem key={icon.value} value={icon.value}>
                  <div className="flex items-center gap-2">
                    <DynamicIcon name={icon.value} size={16} />
                    <span>{icon.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Icon Preview */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <DynamicIcon name={formData.icon} size={32} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
