"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicationFormData } from "./types";

interface PublicationContentCardProps {
  formData: PublicationFormData;
  updateField: (field: keyof PublicationFormData, value: PublicationFormData[keyof PublicationFormData]) => void;
}

export function PublicationContentCard({ formData, updateField }: PublicationContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Título de la publicación"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="abstract">Resumen</Label>
          <Textarea
            id="abstract"
            placeholder="Resumen de la publicación..."
            value={formData.abstract}
            onChange={(e) => updateField("abstract", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="journal">Revista / Editorial</Label>
          <Input
            id="journal"
            placeholder="Nombre de la revista o editorial"
            value={formData.journal}
            onChange={(e) => updateField("journal", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="year">Año *</Label>
            <Input
              id="year"
              type="number"
              placeholder="2026"
              value={formData.year}
              onChange={(e) => updateField("year", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="volume">Volumen</Label>
            <Input
              id="volume"
              placeholder="Vol."
              value={formData.volume}
              onChange={(e) => updateField("volume", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue">Número</Label>
            <Input
              id="issue"
              placeholder="No."
              value={formData.issue}
              onChange={(e) => updateField("issue", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pages">Páginas</Label>
            <Input
              id="pages"
              placeholder="pp. 1-20"
              value={formData.pages}
              onChange={(e) => updateField("pages", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doi">DOI</Label>
          <Input
            id="doi"
            placeholder="10.1000/ejemplo"
            value={formData.doi}
            onChange={(e) => updateField("doi", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            placeholder="https://..."
            value={formData.url}
            onChange={(e) => updateField("url", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
