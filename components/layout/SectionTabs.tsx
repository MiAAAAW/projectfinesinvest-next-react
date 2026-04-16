"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/site-nav";

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION TABS
// Tabs horizontales minimalistas para secciones con 2-4 hermanas muy similares
// (variant="tabs"). Solo texto (sin iconos), estilo underline en active.
// Los items vienen de siteNav — cero hardcode.
// ═══════════════════════════════════════════════════════════════════════════════

interface SectionTabsProps {
  items: NavItem[];
  className?: string;
}

export function SectionTabs({ items, className }: SectionTabsProps) {
  const pathname = usePathname();

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Sub-secciones"
      className={cn("border-b border-border/50 mb-8", className)}
    >
      <ul className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
        {items.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={cn(
                  "inline-flex items-center pb-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors",
                  isActive
                    ? "text-foreground border-primary font-medium"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
