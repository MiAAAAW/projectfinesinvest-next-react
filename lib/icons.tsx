// ═══════════════════════════════════════════════════════════════════════════════
// ICON UTILITY
// Mapeo dinámico de nombres de iconos a componentes Lucide
// ═══════════════════════════════════════════════════════════════════════════════

import {
  Search,
  Shield,
  Users,
  BarChart3,
  Zap,
  Globe,
  Clock,
  TrendingUp,
  DollarSign,
  Award,
  Check,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  Star,
  StarHalf,
  Quote,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Laptop,
  Smartphone,
  TabletSmartphone,
  BadgeCheck,
  Fingerprint,
  Goal,
  PictureInPicture,
  MousePointerClick,
  Newspaper,
  Heart,
  Plus,
  Minus,
  MessageCircle,
  // Institutional icons
  GraduationCap,
  FileText,
  Calendar,
  BookOpen,
  Download,
  Brain,
  User,
  Database,
  Code,
  Cpu,
  FileEdit,
  FileSpreadsheet,
  Building2,
  FolderOpen,
  Monitor,
  ZoomIn,
  AlertCircle,
  FlaskConical,
  Bell,
  FileArchive,
  Presentation,
  File,
  type LucideIcon,
} from "lucide-react";

// Mapeo de nombres de string a componentes de icono
const iconMap: Record<string, LucideIcon> = {
  Search,
  Shield,
  Users,
  BarChart3,
  Zap,
  Globe,
  Clock,
  TrendingUp,
  DollarSign,
  Award,
  Check,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  Star,
  StarHalf,
  Quote,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Laptop,
  Smartphone,
  TabletSmartphone,
  BadgeCheck,
  Fingerprint,
  Goal,
  PictureInPicture,
  MousePointerClick,
  Newspaper,
  Heart,
  Plus,
  Minus,
  MessageCircle,
  // Institutional icons
  GraduationCap,
  FileText,
  Calendar,
  BookOpen,
  Download,
  Brain,
  User,
  Database,
  Code,
  Cpu,
  FileEdit,
  FileSpreadsheet,
  Building2,
  FolderOpen,
  Monitor,
  ZoomIn,
  AlertCircle,
  FlaskConical,
  Bell,
  FileArchive,
  Presentation,
  File,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Componente de icono dinámico
 * Permite usar iconos por nombre de string desde la configuración
 */
export function DynamicIcon({ name, className, size = 24 }: DynamicIconProps) {
  const Icon = iconMap[name];

  if (!Icon) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <Icon className={className} size={size} />;
}

/**
 * Obtener componente de icono por nombre
 * Útil cuando necesitas el componente directamente
 */
export function getIcon(name: string): LucideIcon | null {
  return iconMap[name] || null;
}

/**
 * Verificar si un icono existe
 */
export function iconExists(name: string): boolean {
  return name in iconMap;
}

// Re-exportar iconos individuales para uso directo
export {
  Search,
  Shield,
  Users,
  BarChart3,
  Zap,
  Globe,
  Clock,
  TrendingUp,
  DollarSign,
  Award,
  Check,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  Star,
  StarHalf,
  Quote,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Laptop,
  Smartphone,
  Heart,
  Plus,
  Minus,
  MessageCircle,
  // Institutional icons
  GraduationCap,
  FileText,
  Calendar,
  BookOpen,
  Download,
  Brain,
  User,
  Database,
  Code,
  Cpu,
  FileEdit,
  FileSpreadsheet,
  Building2,
  FolderOpen,
  Monitor,
  ZoomIn,
  AlertCircle,
  FlaskConical,
  Bell,
  FileArchive,
  Presentation,
  File,
  type LucideIcon,
};
