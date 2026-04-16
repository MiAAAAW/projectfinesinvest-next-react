"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResolutionFormData } from "./types";

interface ResolutionContentCardProps {
  formData: ResolutionFormData;
  updateField: (field: keyof ResolutionFormData, value: ResolutionFormData[keyof ResolutionFormData]) => void;
}

export function ResolutionContentCard({ formData, updateField }: ResolutionContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="number">Numero</Label>
          <Input
            id="number"
            placeholder="Ej: 001-2026"
            value={formData.number}
            onChange={(e) => updateField("number", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Asunto</Label>
          <Textarea
            id="subject"
            placeholder="Asunto de la resolución..."
            value={formData.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Input
              id="year"
              type="number"
              min="1900"
              max="2100"
              placeholder="2026"
              value={formData.year}
              onChange={(e) => updateField("year", e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
