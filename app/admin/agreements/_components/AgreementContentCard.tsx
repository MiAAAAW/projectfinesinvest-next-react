"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AgreementFormData } from "./types";

interface AgreementContentCardProps {
  formData: AgreementFormData;
  updateField: (field: keyof AgreementFormData, value: string | boolean) => void;
}

export function AgreementContentCard({ formData, updateField }: AgreementContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido</CardTitle>
        <CardDescription>
          Información principal del convenio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Título del convenio"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Institución *</Label>
          <Input
            id="institution"
            placeholder="Nombre de la institución"
            value={formData.institution}
            onChange={(e) => updateField("institution", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            placeholder="País de la institución"
            value={formData.country}
            onChange={(e) => updateField("country", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción del convenio..."
            rows={5}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de inicio</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
