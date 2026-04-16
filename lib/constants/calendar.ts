export const CALENDAR_EVENT_TYPES = [
  { value: "academico", label: "Académico" },
  { value: "investigacion", label: "Investigación" },
  { value: "administrativo", label: "Administrativo" },
  { value: "social", label: "Social" },
  { value: "deadline", label: "Fecha límite" },
] as const;

export const CALENDAR_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  academico: { label: "Académico", color: "bg-blue-500/10 text-blue-500" },
  investigacion: { label: "Investigación", color: "bg-purple-500/10 text-purple-500" },
  administrativo: { label: "Administrativo", color: "bg-gray-500/10 text-gray-500" },
  social: { label: "Social", color: "bg-green-500/10 text-green-500" },
  deadline: { label: "Fecha límite", color: "bg-red-500/10 text-red-500" },
};
