"use client";

import { PublishSettingsCard } from "@/components/admin";
import type { EvidenceFormData } from "./types";

interface EvidenceSettingsCardProps {
  formData: EvidenceFormData;
  updateField: (field: keyof EvidenceFormData, value: EvidenceFormData[keyof EvidenceFormData]) => void;
}

export function EvidenceSettingsCard({ formData, updateField }: EvidenceSettingsCardProps) {
  return (
    <PublishSettingsCard
      published={formData.published}
      onPublishedChange={(checked) => updateField("published", checked)}
      order={formData.order}
      onOrderChange={(value) => updateField("order", value)}
    />
  );
}
