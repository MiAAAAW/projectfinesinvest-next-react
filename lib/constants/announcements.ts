import type { LucideIcon } from "lucide-react";

export const ANNOUNCEMENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  convocatoria: { label: "Convocatoria", color: "bg-green-500/10 text-green-500" },
  comunicado: { label: "Comunicado", color: "bg-blue-500/10 text-blue-500" },
  evento: { label: "Evento", color: "bg-purple-500/10 text-purple-500" },
  noticia: { label: "Noticia", color: "bg-orange-500/10 text-orange-500" },
};

export const ANNOUNCEMENT_TYPES = [
  { value: "convocatoria", label: "Convocatoria" },
  { value: "comunicado", label: "Comunicado" },
  { value: "evento", label: "Evento" },
  { value: "noticia", label: "Noticia" },
] as const;

export const ICON_OPTIONS = [
  { value: "FileText", label: "Documento" },
  { value: "Calendar", label: "Calendario" },
  { value: "Bell", label: "Campana" },
  { value: "Megaphone", label: "Megáfono" },
  { value: "AlertCircle", label: "Alerta" },
  { value: "Award", label: "Premio" },
] as const;
