import { Megaphone, FileText, Image, Eye } from "lucide-react";

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
