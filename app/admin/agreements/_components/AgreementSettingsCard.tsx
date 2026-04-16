"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishSettingsCard, FileUploadR2 } from "@/components/admin";
import { AGREEMENT_TYPES, AGREEMENT_STATUSES } from "@/lib/constants/agreements";
import type { AgreementFormData } from "./types";

interface AgreementSettingsCardProps {
  formData: AgreementFormData;
  updateField: (field: keyof AgreementFormData, value: string | boolean) => void;
}

export function AgreementSettingsCard({ formData, updateField }: AgreementSettingsCardProps) {
  return (
    <PublishSettingsCard
      published={formData.published}
      onPublishedChange={(checked) => updateField("published", checked)}
    >
      <Separator />

      <div className="space-y-2">
        <Label>Tipo de convenio</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => updateField("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            {AGREEMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Estado del convenio</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => updateField("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            {AGREEMENT_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Documento del convenio</Label>
        {formData.fileUrl ? (
          <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate flex-1">
              {formData.fileUrl.split("/").pop()}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => updateField("fileUrl", "")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <FileUploadR2
            folder="convenios"
            accept=".pdf,.doc,.docx"
            label="Subir documento"
            onUploaded={(result) => {
              updateField("fileUrl", result.url);
            }}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Logo de la institución</Label>
        {formData.logoUrl ? (
          <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
            <img
              src={formData.logoUrl}
              alt="Logo"
              className="h-8 w-8 object-contain shrink-0"
            />
            <span className="truncate flex-1">
              {formData.logoUrl.split("/").pop()}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => updateField("logoUrl", "")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <FileUploadR2
            folder="convenios/logos"
            accept=".jpg,.png,.webp"
            label="Subir logo"
            onUploaded={(result) => {
              updateField("logoUrl", result.url);
            }}
          />
        )}
      </div>
    </PublishSettingsCard>
  );
}
