"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LinkFormData } from "./types";

interface LinkContentCardProps {
  formData: LinkFormData;
  updateField: (field: keyof LinkFormData, value: string | boolean) => void;
}

export function LinkContentCard({ formData, updateField }: LinkContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Enlace</CardTitle>
        <CardDescription>Datos principales del enlace externo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Ej: Repositorio Institucional UNAP"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://ejemplo.com"
            value={formData.url}
            onChange={(e) => updateField("url", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Dirección web completa incluyendo https://
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Breve descripción del enlace..."
            rows={3}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
