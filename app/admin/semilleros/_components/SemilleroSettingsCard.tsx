"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PublishSettingsCard } from "@/components/admin";
import type { SemilleroFormData, Teacher } from "./types";

interface SemilleroSettingsCardProps {
  formData: SemilleroFormData;
  updateField: (field: keyof SemilleroFormData, value: string | boolean) => void;
  teachers: Teacher[];
}

export function SemilleroSettingsCard({
  formData,
  updateField,
  teachers,
}: SemilleroSettingsCardProps) {
  return (
    <PublishSettingsCard
      published={formData.published}
      onPublishedChange={(checked) => updateField("published", checked)}
    >
      <Separator />

      <div className="space-y-2">
        <Label htmlFor="advisorId">Responsable</Label>
        <Select
          value={formData.advisorId || "none"}
          onValueChange={(value) => updateField("advisorId", value === "none" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un docente responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin responsable</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => updateField("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado del semillero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PublishSettingsCard>
  );
}
