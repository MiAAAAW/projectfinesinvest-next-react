"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SemilleroFormData } from "./types";

interface SemilleroContentCardProps {
  formData: SemilleroFormData;
  updateField: (field: keyof SemilleroFormData, value: string | boolean) => void;
}

export function SemilleroContentCard({ formData, updateField }: SemilleroContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información</CardTitle>
        <CardDescription>Datos principales del semillero de investigación</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del semillero *</Label>
          <Input
            id="name"
            placeholder="Ej: Semillero de Inteligencia Artificial"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Objetivo</Label>
          <Textarea
            id="description"
            placeholder="Describe el objetivo principal del semillero..."
            rows={4}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="researchLinesText">Líneas de investigación (UNAP)</Label>
          <Textarea
            id="researchLinesText"
            placeholder="Escribe una línea por renglón&#10;Ej:&#10;Ciencias de la computación&#10;Educación&#10;Bioestadística"
            rows={4}
            value={formData.researchLinesText}
            onChange={(e) => updateField("researchLinesText", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Escribe cada línea en una fila separada. Se mostrarán como etiquetas en la tarjeta pública.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
