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
  { value: "instalaciones", label: "Instalaciones" },
  { value: "academico", label: "Académico" },
  { value: "investigacion", label: "Investigación" },
] as const;

export const IMAGE_CATEGORY_LABELS: Record<string, string> = {
  eventos: "Eventos",
  instalaciones: "Instalaciones",
  academico: "Académico",
  investigacion: "Investigación",
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
    title: "Sedes",
    url: "/admin/content/offices",
    icon: MapPin,
    type: "content" as const,
  },
  {
    title: "Autoridades",
    url: "/admin/content/authorities",
    icon: Users,
    type: "content" as const,
  },
  {
    title: "Galería",
    url: "/admin/gallery",
    icon: Image,
    type: "crud" as const,
  },
  {
    title: "Calendario",
    url: "/admin/content/calendar",
    icon: CalendarDays,
    type: "content" as const,
  },
  {
    title: "FAQ",
    url: "/admin/content/faq",
    icon: HelpCircle,
    type: "content" as const,
  },
  {
    title: "Footer",
    url: "/admin/content/footer",
    icon: FileText,
    type: "content" as const,
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
  offices: "Sedes",
  authorities: "Autoridades",
  calendar: "Calendario",
  faq: "FAQ",
  footer: "Footer",
  new: "Nuevo",
} as const;
