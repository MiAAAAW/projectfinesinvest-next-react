"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PublishSettingsCard } from "@/components/admin";
import { PUBLICATION_TYPES, INDEXED_IN_OPTIONS } from "@/lib/constants/publications";
import type { PublicationFormData } from "./types";

interface PublicationSettingsCardProps {
  formData: PublicationFormData;
  updateField: (field: keyof PublicationFormData, value: PublicationFormData[keyof PublicationFormData]) => void;
}

export function PublicationSettingsCard({ formData, updateField }: PublicationSettingsCardProps) {
  return (
    <PublishSettingsCard
      published={formData.published}
      onPublishedChange={(checked) => updateField("published", checked)}
    >
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de publicación</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => updateField("type", value)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {PUBLICATION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="indexedIn">Indexación</Label>
        <Select
          value={formData.indexedIn || "ninguno"}
          onValueChange={(value) => updateField("indexedIn", value === "ninguno" ? "" : value)}
        >
          <SelectTrigger id="indexedIn">
            <SelectValue placeholder="Seleccionar indexación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ninguno">Ninguno</SelectItem>
            {INDEXED_IN_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </PublishSettingsCard>
  );
}
