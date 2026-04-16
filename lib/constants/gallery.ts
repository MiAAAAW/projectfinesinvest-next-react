export const IMAGE_CATEGORIES = [
  { value: "eventos", label: "Eventos" },
  { value: "talleres", label: "Talleres" },
  { value: "congresos", label: "Congresos" },
  { value: "instalaciones", label: "Instalaciones" },
  { value: "academico", label: "Académico" },
  { value: "investigacion", label: "Investigación" },
  { value: "equipo", label: "Equipo" },
] as const;

export const IMAGE_CATEGORY_LABELS: Record<string, string> = {
  eventos: "Eventos",
  talleres: "Talleres",
  congresos: "Congresos",
  instalaciones: "Instalaciones",
  academico: "Académico",
  investigacion: "Investigación",
  equipo: "Equipo",
};

export const IMAGE_CATEGORY_STYLES: Record<string, { color: string; bg: string; icon: string }> = {
  eventos: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", icon: "CalendarDays" },
  talleres: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: "GraduationCap" },
  congresos: { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: "Users" },
  instalaciones: { color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30", icon: "Building2" },
  academico: { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", icon: "BookOpen" },
  investigacion: { color: "text-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30", icon: "FlaskConical" },
  equipo: { color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30", icon: "UserCircle" },
};
