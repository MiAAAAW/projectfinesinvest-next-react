"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/site-nav";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION SIDEBAR
// Barra lateral minimalista para secciones con muchas hermanas (variant="sidebar").
// Usado por variant B (p.ej. Acreditación).
// Los items vienen de siteNav — cero hardcode.
// ═══════════════════════════════════════════════════════════════════════════════

interface SectionSidebarProps {
  heading?: string;
  items: NavItem[];
  className?: string;
}

export function SectionSidebar({ heading, items, className }: SectionSidebarProps) {
  const pathname = usePathname();

  if (items.length === 0) return null;

  return (
    <aside
      className={cn(
        "hidden lg:block w-56 shrink-0",
        className
      )}
    >
      <nav className="sticky top-24">
        {heading && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {heading}
          </p>
        )}
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "block px-3 py-1.5 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
