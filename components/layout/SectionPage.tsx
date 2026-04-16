import { cn } from "@/lib/utils";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import { PageHeader } from "./PageHeader";
import { SectionSidebar } from "./SectionSidebar";
import { SectionTabs } from "./SectionTabs";
import {
  siteNav,
  getSectionChildren,
  type SectionId,
} from "@/config/site-nav";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION PAGE — Template universal para páginas internas
//
// Encapsula las 3 variantes de navegación:
//   • "clean"  (default) → solo breadcrumb + contenido
//   • "sidebar"          → sidebar lateral con hermanas
//   • "tabs"             → tabs superiores con hermanas
//
// Fuente de verdad: config/site-nav.ts (cero hardcode de labels/paths).
// ═══════════════════════════════════════════════════════════════════════════════

type Variant = "clean" | "sidebar" | "tabs";

interface SectionPageProps {
  /** ID de la sección padre en siteNav (para breadcrumb + sidebar/tabs). Si no se pasa, no se usa contexto. */
  parent?: SectionId;
  /** Título principal de la página */
  title: string;
  /** Descripción opcional debajo del título */
  description?: string | null;
  /** Variante de navegación. Default: "clean" */
  variant?: Variant;
  /** Breadcrumb manual. Si no se pasa, se auto-genera desde `parent` + `title`. */
  breadcrumb?: BreadcrumbItem[];
  /** Contenido de la página */
  children: React.ReactNode;
  className?: string;
}

export function SectionPage({
  parent,
  title,
  description,
  variant = "clean",
  breadcrumb,
  children,
  className,
}: SectionPageProps) {
  // ─────────────────────────────────────────────────────────────────────────────
  // Auto-breadcrumb: Inicio > Parent (si hay) > Title
  // Se puede sobrescribir pasando `breadcrumb` explícito.
  // ─────────────────────────────────────────────────────────────────────────────
  const trail: BreadcrumbItem[] =
    breadcrumb ??
    [
      { label: siteNav.home.label, href: siteNav.home.path },
      ...(parent
        ? [{ label: siteNav.sections[parent].label, href: siteNav.sections[parent].path }]
        : []),
      { label: title },
    ];

  // ─────────────────────────────────────────────────────────────────────────────
  // Items de navegación secundaria (sidebar o tabs)
  // ─────────────────────────────────────────────────────────────────────────────
  const siblings = parent ? getSectionChildren(parent) : [];

  const sectionLabel = parent ? siteNav.sections[parent].label : undefined;

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={cn("container mx-auto px-4 py-10 md:py-16", className)}>
      <div className={cn(variant === "sidebar" && "lg:flex lg:gap-10")}>
        {/* Sidebar variant */}
        {variant === "sidebar" && siblings.length > 0 && (
          <SectionSidebar heading={sectionLabel} items={siblings} />
        )}

        {/* Main column */}
        <div className={cn(variant === "sidebar" ? "flex-1 min-w-0 max-w-3xl" : "max-w-4xl mx-auto")}>
          <Breadcrumb trail={trail} className="mb-6" />

          {/* Tabs variant */}
          {variant === "tabs" && siblings.length > 0 && (
            <SectionTabs items={siblings} />
          )}

          <PageHeader title={title} description={description} />

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
