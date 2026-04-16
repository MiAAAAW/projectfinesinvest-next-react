"use client";

import { PublishSettingsCard } from "@/components/admin";
import type { StandardFormData } from "./types";

interface StandardSettingsCardProps {
  formData: StandardFormData;
  updateField: (field: keyof StandardFormData, value: StandardFormData[keyof StandardFormData]) => void;
}

export function StandardSettingsCard({ formData, updateField }: StandardSettingsCardProps) {
  return (
    <PublishSettingsCard
      published={formData.published}
      onPublishedChange={(checked) => updateField("published", checked)}
      order={formData.order}
      onOrderChange={(value) => updateField("order", value)}
    />
  );
}
