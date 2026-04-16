import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// BREADCRUMB COMPONENT
// Recibe un trail explícito de items (la page conoce su propia jerarquía).
// Último item = current page (sin link).
// ═══════════════════════════════════════════════════════════════════════════════

export interface BreadcrumbItem {
  label: string;
  href?: string; // si no hay href → current page
}

interface BreadcrumbProps {
  trail: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ trail, className }: BreadcrumbProps) {
  if (trail.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs text-muted-foreground", className)}
    >
      <ol className="flex items-center flex-wrap gap-0.5">
        {trail.map((item, idx) => {
          const isLast = idx === trail.length - 1;
          return (
            <li key={idx} className="flex items-center gap-0.5">
              {idx > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" aria-hidden />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && "text-foreground font-medium")}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
