"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StandardFormData } from "./types";

interface StandardContentCardProps {
  formData: StandardFormData;
  updateField: (field: keyof StandardFormData, value: StandardFormData[keyof StandardFormData]) => void;
}

export function StandardContentCard({ formData, updateField }: StandardContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Estándar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            placeholder="Ej: E-1"
            value={formData.code}
            onChange={(e) => updateField("code", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="Nombre del estándar"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción del estándar (opcional)"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
