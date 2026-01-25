// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CONSTANTS
// Constantes para el panel de administración
// Todas las secciones ahora usan datos de la base de datos via APIs
// ═══════════════════════════════════════════════════════════════════════════════

import {
  Megaphone,
  FileText,
  Image,
  Eye,
  FileSpreadsheet,
  File,
  LayoutDashboard,
  Sparkles,
  FlaskConical,
  MapPin,
  Users,
  CalendarDays,
  HelpCircle,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════════

export const DASHBOARD_STATS = [
  {
    title: "Anuncios Activos",
    value: "12",
    description: "+2 esta semana",
    icon: Megaphone,
    trend: "up" as const,
  },
  {
    title: "Documentos",
    value: "48",
    description: "3 nuevos este mes",
    icon: FileText,
    trend: "up" as const,
  },
  {
    title: "Imágenes en Galería",
    value: "156",
    description: "+15 este mes",
    icon: Image,
    trend: "up" as const,
  },
  {
    title: "Visitas este mes",
    value: "2,847",
    description: "+12% vs mes anterior",
    icon: Eye,
    trend: "up" as const,
  },
] as const;

export const RECENT_ANNOUNCEMENTS = [
  {
    id: "1",
    title: "Convocatoria de Investigación 2026",
    type: "convocatoria",
    date: "Hace 2 días",
    status: "published" as const,
  },
  {
    id: "2",
    title: "Nuevo reglamento de líneas de investigación",
    type: "comunicado",
    date: "Hace 5 días",
    status: "published" as const,
  },
  {
    id: "3",
    title: "Ceremonia de premiación a investigadores",
    type: "evento",
    date: "Hace 1 semana",
    status: "draft" as const,
  },
] as const;

export const RECENT_DOCUMENTS = [
  {
    id: "1",
    title: "Formato de Proyecto de Investigación",
    downloads: 234,
    type: "pdf",
  },
  {
    id: "2",
    title: "Reglamento de Investigación 2026",
    downloads: 189,
    type: "pdf",
  },
  {
    id: "3",
    title: "Manual de Ética en Investigación",
    downloads: 156,
    type: "pdf",
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ANNOUNCEMENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  convocatoria: { label: "Convocatoria", color: "bg-green-500/10 text-green-500" },
  comunicado: { label: "Comunicado", color: "bg-blue-500/10 text-blue-500" },
  evento: { label: "Evento", color: "bg-purple-500/10 text-purple-500" },
  noticia: { label: "Noticia", color: "bg-orange-500/10 text-orange-500" },
} as const;

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

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════════

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
} as const;

export const FILE_TYPE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  xls: FileSpreadsheet,
  default: File,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════════════════════

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
} as const;

// Estilos por categoría para filtros en el frontend
export const IMAGE_CATEGORY_STYLES: Record<string, { color: string; bg: string; icon: string }> = {
  eventos: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", icon: "CalendarDays" },
  talleres: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: "GraduationCap" },
  congresos: { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: "Users" },
  instalaciones: { color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30", icon: "Building2" },
  academico: { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", icon: "BookOpen" },
  investigacion: { color: "text-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30", icon: "FlaskConical" },
  equipo: { color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30", icon: "UserCircle" },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHERS / DOCENTES
// ═══════════════════════════════════════════════════════════════════════════════

export const TEACHER_ROLES = [
  { value: "coordinador", label: "Coordinador" },
  { value: "investigador", label: "Investigador" },
  { value: "colaborador", label: "Colaborador" },
] as const;

// Array simple de valores para usar en validación Zod
export const TEACHER_ROLE_VALUES = ["coordinador", "investigador", "colaborador"] as const;

export const TEACHER_ROLE_LABELS: Record<string, { label: string; color: string }> = {
  coordinador: { label: "Coordinador", color: "bg-primary text-primary-foreground" },
  investigador: { label: "Investigador", color: "bg-blue-500/10 text-blue-600" },
  colaborador: { label: "Colaborador", color: "bg-gray-500/10 text-gray-600" },
} as const;

export const TEACHER_DEGREES = [
  { value: "", label: "Sin título" },
  { value: "Ing.", label: "Ingeniero (Ing.)" },
  { value: "Lic.", label: "Licenciado (Lic.)" },
  { value: "Mg.", label: "Magíster (Mg.)" },
  { value: "Dr.", label: "Doctor (Dr.)" },
  { value: "PhD.", label: "PhD" },
] as const;

// Tipo para roles (derivado de TEACHER_ROLE_VALUES para consistencia)
export type TeacherRole = typeof TEACHER_ROLE_VALUES[number];

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════

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
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// Ordenado según el flujo del landing page
// ═══════════════════════════════════════════════════════════════════════════════

// Dashboard - siempre primero
export const DASHBOARD_ITEM = {
  title: "Dashboard",
  url: "/admin",
  icon: LayoutDashboard,
} as const;

// Secciones del landing en orden (siguiendo page.tsx)
// type: "crud" = tiene CRUD completo en /admin/{section}
// type: "content" = edición de contenido en /admin/content/{section}
export const LANDING_SECTIONS = [
  {
    title: "Hero",
    url: "/admin/content/hero",
    icon: Sparkles,
    type: "content" as const,
  },
  {
    title: "Anuncios",
    url: "/admin/announcements",
    icon: Megaphone,
    type: "crud" as const,
  },
  {
    title: "Investigación",
    url: "/admin/research",
    icon: FlaskConical,
    type: "crud" as const,
  },
  {
    title: "Documentos",
    url: "/admin/documents",
    icon: FileText,
    type: "crud" as const,
  },
  {
    title: "Calendario",
    url: "/admin/calendar",
    icon: CalendarDays,
    type: "crud" as const,
  },
  {
    title: "Galería",
    url: "/admin/gallery",
    icon: Image,
    type: "crud" as const,
  },
  {
    title: "Autoridades",
    url: "/admin/authorities",
    icon: Users,
    type: "crud" as const,
  },
  {
    title: "Oficinas",
    url: "/admin/offices",
    icon: MapPin,
    type: "crud" as const,
  },
  // {
  //   title: "FAQ",
  //   url: "/admin/content/faq",
  //   icon: HelpCircle,
  //   type: "content" as const,
  // },
  {
    title: "Footer",
    url: "/admin/content/footer",
    icon: FileText,
    type: "content" as const,
  },
] as const;

// Secciones de Gestión (datos maestros)
export const MANAGEMENT_SECTIONS = [
  {
    title: "Docentes",
    url: "/admin/teachers",
    icon: GraduationCap,
    type: "crud" as const,
  },
] as const;

// Mantener exports antiguos para compatibilidad (deprecados)
export const MAIN_MENU_ITEMS = [
  DASHBOARD_ITEM,
  ...LANDING_SECTIONS.filter(s => s.type === "crud"),
] as const;

export const CONTENT_SECTIONS = LANDING_SECTIONS
  .filter(s => s.type === "content")
  .map(({ title, url }) => ({ title, url }));

export const ROUTE_NAMES: Record<string, string> = {
  admin: "Dashboard",
  announcements: "Anuncios",
  documents: "Documentos",
  gallery: "Galería",
  content: "Contenido",
  hero: "Hero",
  research: "Investigación",
  offices: "Oficinas",
  authorities: "Autoridades",
  calendar: "Calendario",
  faq: "FAQ",
  footer: "Footer",
  teachers: "Docentes",
  new: "Nuevo",
} as const;
