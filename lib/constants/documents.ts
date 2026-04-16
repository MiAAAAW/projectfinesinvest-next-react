import { FileText, FileSpreadsheet, File, type LucideIcon } from "lucide-react";

export const DOCUMENT_CATEGORIES = [
  { value: "reglamentos", label: "Reglamentos" },
  { value: "formatos", label: "Formatos" },
  { value: "manuales", label: "Manuales" },
  { value: "investigacion", label: "Investigación" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  reglamentos: "Reglamentos",
  formatos: "Formatos",
  manuales: "Manuales",
  investigacion: "Investigación",
};

export const FILE_TYPE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  xls: FileSpreadsheet,
  default: File,
};
