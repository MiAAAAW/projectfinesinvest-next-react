"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVIDENCE_CATEGORIES } from "@/lib/constants/accreditation";
import type { EvidenceFormData } from "./types";

interface EvidenceContentCardProps {
  formData: EvidenceFormData;
  updateField: (field: keyof EvidenceFormData, value: EvidenceFormData[keyof EvidenceFormData]) => void;
}

export function EvidenceContentCard({ formData, updateField }: EvidenceContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Sub-evidencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            placeholder="Ej: SE-1.1"
            value={formData.code}
            onChange={(e) => updateField("code", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="Nombre de la sub-evidencia"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => updateField("category", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {EVIDENCE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
