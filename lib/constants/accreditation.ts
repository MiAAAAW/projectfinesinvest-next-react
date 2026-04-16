// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORÍAS DE SUB-EVIDENCIAS · acreditación
// value = label (coincide con lo guardado en BD, sin transformación)
// Flexible: admin puede elegir de esta lista o ingresar custom.
// ═══════════════════════════════════════════════════════════════════════════════

export const EVIDENCE_CATEGORIES = [
  { value: "Planificación", label: "Planificación" },
  { value: "Resultados", label: "Resultados" },
  { value: "Mejoras", label: "Mejoras" },
  { value: "General", label: "General" },
] as const;

export const EVIDENCE_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  "Planificación": { label: "Planificación", color: "bg-blue-500/10 text-blue-500" },
  "Resultados": { label: "Resultados", color: "bg-green-500/10 text-green-500" },
  "Mejoras": { label: "Mejoras", color: "bg-orange-500/10 text-orange-500" },
  "General": { label: "General", color: "bg-gray-500/10 text-gray-400" },
};
