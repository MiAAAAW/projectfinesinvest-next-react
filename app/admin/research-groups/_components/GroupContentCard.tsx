"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GroupFormData } from "./types";

interface GroupContentCardProps {
  formData: GroupFormData;
  updateField: (field: keyof GroupFormData, value: GroupFormData[keyof GroupFormData]) => void;
}

export function GroupContentCard({ formData, updateField }: GroupContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Grupo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del grupo *</Label>
          <Input
            id="name"
            placeholder="Ej: Grupo de Inteligencia Artificial"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            placeholder="Ej: GIA-001"
            value={formData.code}
            onChange={(e) => updateField("code", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Código único identificador del grupo (opcional)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Describe los objetivos y enfoque del grupo de investigación..."
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Sitio web / URL externa</Label>
          <Input
            id="websiteUrl"
            type="url"
            placeholder="https://..."
            value={formData.websiteUrl}
            onChange={(e) => updateField("websiteUrl", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enlace opcional a la página oficial del grupo (gob.pe, portal propio, etc.)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
