import {
  LayoutDashboard,
  Sparkles,
  Megaphone,
  FlaskConical,
  FileText,
  CalendarDays,
  Image,
  Users,
  MapPin,
  GraduationCap,
  Link2,
  Handshake,
  FileCheck,
  BookOpen,
  Microscope,
  Sprout,
  Shield,
  Award,
  Type,
} from "lucide-react";

// Dashboard - always first
export const DASHBOARD_ITEM = {
  title: "Dashboard",
  url: "/admin",
  icon: LayoutDashboard,
} as const;

// ─── Página Principal ───
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
  {
    title: "Footer",
    url: "/admin/content/footer",
    icon: FileText,
    type: "content" as const,
  },
] as const;

// ─── Investigación ───
export const RESEARCH_SECTIONS = [
  {
    title: "Líneas",
    url: "/admin/research",
    icon: FlaskConical,
    type: "crud" as const,
  },
  {
    title: "Grupos",
    url: "/admin/research-groups",
    icon: Microscope,
    type: "crud" as const,
  },
  {
    title: "Semilleros",
    url: "/admin/semilleros",
    icon: Sprout,
    type: "crud" as const,
  },
  {
    title: "Publicaciones",
    url: "/admin/publications",
    icon: BookOpen,
    type: "crud" as const,
  },
  {
    title: "Docentes RENACYT",
    url: "/admin/teachers-renacyt",
    icon: Award,
    type: "crud" as const,
  },
  {
    title: "Ética",
    url: "/admin/content/etica",
    icon: Shield,
    type: "content" as const,
  },
] as const;

// ─── Documentos ───
export const DOCUMENTS_SECTIONS = [
  {
    title: "Documentos",
    url: "/admin/documents",
    icon: FileText,
    type: "crud" as const,
  },
  {
    title: "Res. Decanales",
    url: "/admin/resolutions/decanales",
    icon: FileCheck,
    type: "crud" as const,
  },
  {
    title: "Res. Rectorales",
    url: "/admin/resolutions/rectorales",
    icon: FileCheck,
    type: "crud" as const,
  },
  {
    title: "Convenios",
    url: "/admin/agreements",
    icon: Handshake,
    type: "crud" as const,
  },
  {
    title: "Enlaces",
    url: "/admin/links",
    icon: Link2,
    type: "crud" as const,
  },
] as const;

// ─── Posgrado ───
export const POSTGRAD_SECTIONS = [
  {
    title: "Maestría y Doctorado",
    url: "/admin/content/posgrado",
    icon: GraduationCap,
    type: "content" as const,
  },
] as const;

// ─── Acreditación ───
export const ACCREDITATION_SECTIONS = [
  {
    title: "Estándares",
    url: "/admin/accreditation",
    icon: Shield,
    type: "crud" as const,
  },
] as const;

// ─── Gestión ───
export const MANAGEMENT_SECTIONS = [
  {
    title: "Docentes",
    url: "/admin/teachers",
    icon: GraduationCap,
    type: "crud" as const,
  },
  {
    title: "Estudiantes",
    url: "/admin/students",
    icon: Users,
    type: "crud" as const,
  },
] as const;
