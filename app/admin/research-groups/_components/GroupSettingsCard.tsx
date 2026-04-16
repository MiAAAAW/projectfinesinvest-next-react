"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PublishSettingsCard } from "@/components/admin";
import type { GroupFormData } from "./types";

interface GroupSettingsCardProps {
  formData: GroupFormData;
  updateField: (field: keyof GroupFormData, value: GroupFormData[keyof GroupFormData]) => void;
  teachers: Array<{ id: string; name: string }>;
  researchLines: Array<{ id: string; title: string }>;
}

export function GroupSettingsCard({
  formData,
  updateField,
  teachers,
  researchLines,
}: GroupSettingsCardProps) {
  return (
    <PublishSettingsCard
      published={formData.published}
      onPublishedChange={(checked) => updateField("published", checked)}
    >
      <Separator />

      {/* Leader Select */}
      <div className="space-y-2">
        <Label htmlFor="leaderId">Líder del grupo</Label>
        <Select
          value={formData.leaderId || "none"}
          onValueChange={(value) => updateField("leaderId", value === "none" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un líder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin líder asignado</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Research Line Select */}
      <div className="space-y-2">
        <Label htmlFor="researchLineId">Línea de investigación</Label>
        <Select
          value={formData.researchLineId || "none"}
          onValueChange={(value) => updateField("researchLineId", value === "none" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una línea" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin línea asignada</SelectItem>
            {researchLines.map((line) => (
              <SelectItem key={line.id} value={line.id}>
                {line.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Select */}
      <div className="space-y-2">
        <Label htmlFor="status">Estado del grupo</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => updateField("status", value)}
        >
          <SelectTrigger>
            <SelectValue />
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
