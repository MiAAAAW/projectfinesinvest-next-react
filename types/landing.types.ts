// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE TYPE SYSTEM
// Arquitectura de tipos para landing pages sin hardcoding
// ═══════════════════════════════════════════════════════════════════════════════

import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────────
// COMMON TYPES
// ─────────────────────────────────────────────────────────────────────────────────

export type IconName = string; // Nombre del icono de Lucide (ej: "Search", "Shield")

export interface LinkItem {
  text: string;
  href: string;
  external?: boolean;
}

export interface ImageItem {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ThemeImage {
  light: string;
  dark: string;
  alt: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// SITE CONFIG
// ─────────────────────────────────────────────────────────────────────────────────

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  creator: string;
  keywords: string[];
  links: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
}

export interface NavigationConfig {
  logo: {
    text: string;
    icon?: IconName;
    href: string;
  };
  items: NavItem[];
  cta?: LinkItem;
}

// ─────────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface HeroBadge {
  text: string;
  href?: string;
  variant?: "default" | "secondary" | "outline";
}

export interface HeroTitle {
  main: string;
  highlight?: string; // Texto con gradiente/color especial
  suffix?: string;
}

export interface HeroCTA {
  primary: LinkItem;
  secondary?: LinkItem;
}

export interface HeroConfig {
  badge?: HeroBadge;
  title: HeroTitle;
  description: string;
  cta: HeroCTA;
  image?: ThemeImage;
  video?: {
    src: string;
    poster?: string;
  };
  enable3D?: boolean;
  scene3D?: "floating" | "particles" | "geometric" | "custom";
}

// ─────────────────────────────────────────────────────────────────────────────────
// SPONSORS / LOGOS SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface SponsorItem {
  name: string;
  logo: string; // URL o path al logo
  href?: string;
}

export interface SponsorsConfig {
  title?: string;
  items: SponsorItem[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// FEATURES SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface FeatureItem {
  icon: IconName;
  title: string;
  description: string;
  href?: string;
}

export interface FeaturesConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
}

// ─────────────────────────────────────────────────────────────────────────────────
// BENEFITS SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface BenefitItem {
  icon: IconName;
  title: string;
  description: string;
}

export interface BenefitsConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  image?: ThemeImage;
  items: BenefitItem[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// SERVICES SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface ServiceItem {
  icon: IconName;
  title: string;
  description: string;
  features?: string[];
}

export interface ServicesConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: ServiceItem[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// PRICING SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface PriceValue {
  monthly: number;
  yearly: number;
}

export interface PlanItem {
  id: string;
  name: string;
  description: string;
  price: PriceValue;
  currency?: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
  badge?: string;
}

export interface PricingConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  plans: PlanItem[];
  showToggle?: boolean;
  defaultPeriod?: "monthly" | "yearly";
}

// ─────────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating?: number; // 1-5
}

export interface TestimonialsConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: TestimonialItem[];
  showRating?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// TEAM SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface TeamConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  members: TeamMember[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// FAQ SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: FAQItem[];
  contactLink?: LinkItem;
}

// ─────────────────────────────────────────────────────────────────────────────────
// CONTACT SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface ContactField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "phone";
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Para select
}

export interface ContactConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  fields: ContactField[];
  submitText: string;
  successMessage: string;
  errorMessage: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// CTA SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface CTAConfig {
  title: string;
  description?: string;
  primary: LinkItem;
  secondary?: LinkItem;
  background?: "default" | "gradient" | "pattern";
}

// ─────────────────────────────────────────────────────────────────────────────────
// FOOTER SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface FooterColumn {
  title: string;
  links: LinkItem[];
}

export interface FooterConfig {
  logo?: {
    text: string;
    icon?: IconName;
  };
  description?: string;
  columns: FooterColumn[];
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
  };
  copyright: string;
  bottomLinks?: LinkItem[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// STATS SECTION
// ─────────────────────────────────────────────────────────────────────────────────

export interface StatItem {
  value: string | number;
  label: string;
  suffix?: string; // ej: "+", "%", "K"
  prefix?: string; // ej: "$", ">"
}

export interface StatsConfig {
  items: StatItem[];
  background?: "default" | "muted" | "primary";
}

// ─────────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENTS SECTION (Anuncios/Noticias institucionales)
// ─────────────────────────────────────────────────────────────────────────────────

export type AnnouncementType = "noticia" | "evento" | "convocatoria" | "comunicado" | "aviso";

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string; // ISO date string
  content: string;
  excerpt?: string; // Resumen corto
  type: AnnouncementType;
  icon?: IconName;
  href?: string; // Link a detalle completo
  image?: string;
  important?: boolean; // Para destacar
}

export interface AnnouncementsConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: AnnouncementItem[];
  showViewAll?: boolean;
  viewAllHref?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// DOCUMENTS SECTION (Documentos/Formatos descargables)
// ─────────────────────────────────────────────────────────────────────────────────

export type DocumentType = "pdf" | "doc" | "xls" | "ppt" | "zip" | "other";
export type DocumentCategory = "reglamentos" | "formatos" | "manuales" | "investigacion" | "tramites" | "otros";

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: DocumentType;
  fileSize?: string; // ej: "2.5 MB"
  category: DocumentCategory;
  icon?: IconName;
  updatedAt?: string; // ISO date
}

export interface DocumentsConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  categories?: DocumentCategory[];
  items: DocumentItem[];
  showSearch?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// OFFICES SECTION (Oficinas/Contacto institucional)
// ─────────────────────────────────────────────────────────────────────────────────

export interface OfficeSchedule {
  days: string; // ej: "Lunes a Viernes"
  hours: string; // ej: "8:00 AM - 4:00 PM"
}

export interface OfficeItem {
  id: string;
  name: string;
  description?: string;
  location: string;
  building?: string;
  floor?: string;
  schedule?: OfficeSchedule;
  phone?: string;
  email?: string;
  mapUrl?: string; // Google Maps link
  icon?: IconName;
  responsible?: string; // Nombre del encargado
}

export interface OfficesConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: OfficeItem[];
  showMap?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// RESEARCH LINES SECTION (Líneas de Investigación)
// ─────────────────────────────────────────────────────────────────────────────────

export interface ResearchProject {
  title: string;
  status: "activo" | "completado" | "en_pausa";
  year?: string;
}

export interface ResearchLineItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  coordinator?: string;
  projects?: ResearchProject[];
  members?: number;
  href?: string;
}

export interface ResearchConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: ResearchLineItem[];
  columns?: 2 | 3 | 4;
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllText?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// CALENDAR SECTION (Calendario académico/eventos)
// ─────────────────────────────────────────────────────────────────────────────────

export type CalendarEventType = "academico" | "investigacion" | "administrativo" | "social" | "deadline";

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // ISO date
  endDate?: string; // Para eventos de varios días
  type: CalendarEventType;
  description?: string;
  location?: string;
  href?: string;
  important?: boolean;
}

export interface CalendarConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: CalendarEventItem[];
  showPastEvents?: boolean;
  groupByMonth?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// GALLERY SECTION (Galería de fotos/eventos)
// ─────────────────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  date?: string;
  event?: string; // Nombre del evento
  category?: string;
}

export interface GalleryConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  showLightbox?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────
// AUTHORITIES/TEAM SECTION (Autoridades institucionales)
// ─────────────────────────────────────────────────────────────────────────────────

export interface AuthorityMember {
  id: string;
  name: string;
  role: string; // ej: "Director de Investigación"
  department?: string;
  avatar?: string;
  bio?: string;
  email?: string;
  phone?: string;
  officeHours?: string;
  social?: {
    linkedin?: string;
    orcid?: string; // Para investigadores
    googleScholar?: string;
  };
}

export interface AuthoritiesConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  members: AuthorityMember[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// 3D CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────────

export interface Scene3DConfig {
  type: "floating" | "particles" | "geometric" | "background" | "custom";
  enabled: boolean;
  options?: {
    color?: string;
    intensity?: number;
    speed?: number;
    count?: number;
    interactive?: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────────
// UI STRINGS (Textos de interfaz - sin hardcoding)
// ─────────────────────────────────────────────────────────────────────────────────

export interface UIStrings {
  // Common
  readMore: string;
  viewAll: string;
  download: string;
  close: string;
  previous: string;
  next: string;
  search: string;
  noResults: string;
  loading: string;

  // Theme
  lightMode: string;
  darkMode: string;

  // Announcements
  newLabel: string;

  // Documents
  searchDocuments: string;
  noDocumentsFound: string;
  allCategories: string;

  // FAQ
  faqContactTitle: string;
  faqContactDescription: string;
  faqContactButton: string;

  // Gallery
  imageOf: string;

  // Newsletter
  newsletterTitle: string;
  newsletterPlaceholder: string;
  newsletterButton: string;

  // Accessibility
  toggleMenu: string;
  toggleTheme: string;
  scrollDown: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// BACKGROUND EFFECTS CONFIG
// ─────────────────────────────────────────────────────────────────────────────────

export interface CodeRainConfig {
  enabled: boolean;
  opacity: number;      // Opacidad (0.3-0.8)
  zIndex: number;       // Capa z-index
}

export interface AnimatedBackgroundConfig {
  enabled: boolean;
  className?: string;   // Clase CSS personalizada (default: "animated-bg")
}

export interface FloatingParticlesConfig {
  enabled: boolean;
  count?: number;
  color?: string; // HSL sin hsl() - ej: "195, 100%, 70%"
  opacity?: number;
  zIndex?: number;
}

export interface BackgroundEffectsConfig {
  animatedBackground?: AnimatedBackgroundConfig;
  codeRain?: CodeRainConfig;
  floatingParticles?: FloatingParticlesConfig;
}

// ─────────────────────────────────────────────────────────────────────────────────
// COMPLETE LANDING CONFIG
// ─────────────────────────────────────────────────────────────────────────────────

export interface LandingConfig {
  // Metadata
  site: SiteConfig;

  // UI Strings (textos de interfaz)
  ui: UIStrings;

  // Navigation
  navigation: NavigationConfig;

  // Sections (en orden de aparición)
  hero: HeroConfig;
  sponsors?: SponsorsConfig;
  stats?: StatsConfig;
  features?: FeaturesConfig;
  benefits?: BenefitsConfig;
  services?: ServicesConfig;
  pricing?: PricingConfig;
  testimonials?: TestimonialsConfig;
  team?: TeamConfig;
  faq?: FAQConfig;
  cta?: CTAConfig;
  contact?: ContactConfig;
  footer: FooterConfig;

  // Secciones institucionales (FINESI)
  announcements?: AnnouncementsConfig;
  documents?: DocumentsConfig;
  offices?: OfficesConfig;
  research?: ResearchConfig;
  calendar?: CalendarConfig;
  gallery?: GalleryConfig;
  authorities?: AuthoritiesConfig;

  // 3D Global Config
  scene3D?: Scene3DConfig;

  // Background Effects
  backgroundEffects?: BackgroundEffectsConfig;
}

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION ORDER CONFIG (para renderizado dinámico)
// ─────────────────────────────────────────────────────────────────────────────────

export type SectionName =
  | "hero"
  | "sponsors"
  | "stats"
  | "features"
  | "benefits"
  | "services"
  | "pricing"
  | "testimonials"
  | "team"
  | "faq"
  | "cta"
  | "contact"
  // Secciones institucionales
  | "announcements"
  | "documents"
  | "offices"
  | "research"
  | "calendar"
  | "gallery"
  | "authorities";

export interface SectionOrder {
  sections: SectionName[];
}
