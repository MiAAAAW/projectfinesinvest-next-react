export const AGREEMENT_TYPES = [
  { value: "marco", label: "Convenio Marco" },
  { value: "especifico", label: "Convenio Específico" },
  { value: "colaboracion", label: "Convenio de Colaboración" },
] as const;

export const AGREEMENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  marco: { label: "Marco", color: "bg-blue-500/10 text-blue-500" },
  especifico: { label: "Específico", color: "bg-green-500/10 text-green-500" },
  colaboracion: { label: "Colaboración", color: "bg-purple-500/10 text-purple-500" },
};

export const AGREEMENT_STATUSES = [
  { value: "vigente", label: "Vigente" },
  { value: "vencido", label: "Vencido" },
  { value: "en_tramite", label: "En trámite" },
] as const;

export const AGREEMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  vigente: { label: "Vigente", color: "bg-green-500/10 text-green-500" },
  vencido: { label: "Vencido", color: "bg-red-500/10 text-red-500" },
  en_tramite: { label: "En trámite", color: "bg-yellow-500/10 text-yellow-600" },
};
