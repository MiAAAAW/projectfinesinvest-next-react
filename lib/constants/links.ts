export const LINK_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "investigacion", label: "Investigación" },
  { value: "bases_datos", label: "Bases de Datos" },
  { value: "repositorios", label: "Repositorios" },
  { value: "herramientas", label: "Herramientas" },
] as const;

export const LINK_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: "General", color: "bg-gray-500/10 text-gray-500" },
  investigacion: { label: "Investigación", color: "bg-blue-500/10 text-blue-500" },
  bases_datos: { label: "Bases de Datos", color: "bg-purple-500/10 text-purple-500" },
  repositorios: { label: "Repositorios", color: "bg-green-500/10 text-green-500" },
  herramientas: { label: "Herramientas", color: "bg-orange-500/10 text-orange-500" },
};
