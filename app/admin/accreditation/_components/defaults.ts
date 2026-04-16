import type { StandardFormData, EvidenceFormData } from "./types";

export const STANDARD_DEFAULTS: StandardFormData = {
  code: "",
  name: "",
  description: "",
  order: "0",
  published: true,
};

export const EVIDENCE_DEFAULTS: EvidenceFormData = {
  code: "",
  name: "",
  category: "Planificación",
  order: "0",
  published: true,
};
