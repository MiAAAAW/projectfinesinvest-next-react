"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishSettingsCard, FileUploadR2 } from "@/components/admin";
import type { ResolutionFormData } from "./types";

interface ResolutionSettingsCardProps {
  formData: ResolutionFormData;
  updateField: (field: keyof ResolutionFormData, value: ResolutionFormData[keyof ResolutionFormData]) => void;
}

export function ResolutionSettingsCard({ formData, updateField }: ResolutionSettingsCardProps) {
  return (
    <PublishSettingsCard
      published={formData.published}
      onPublishedChange={(checked) => updateField("published", checked)}
    >
      <Separator />

      <div className="space-y-2">
        <Label>Archivo PDF</Label>
        {formData.fileUrl ? (
          <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate flex-1">
              {formData.fileUrl.split("/").pop()}
            </span>
            {formData.fileSize && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formData.fileSize}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => {
                updateField("fileUrl", "");
                updateField("fileSize", "");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <FileUploadR2
            folder={`resoluciones/${formData.type === "rectoral" ? "rectorales" : "decanales"}`}
            accept=".pdf"
            label="Subir PDF"
            onUploaded={(result) => {
              updateField("fileUrl", result.url);
              updateField("fileSize", result.fileSize);
            }}
          />
        )}
      </div>
    </PublishSettingsCard>
  );
}
