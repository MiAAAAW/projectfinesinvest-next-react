import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE HEADER
// Title + description estándar para TODAS las páginas internas.
// Tipografía y spacing únicos de verdad para mantener consistencia.
// ═══════════════════════════════════════════════════════════════════════════════

interface PageHeaderProps {
  title: string;
  description?: string | null;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-10 md:mb-12", className)}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </header>
  );
}
