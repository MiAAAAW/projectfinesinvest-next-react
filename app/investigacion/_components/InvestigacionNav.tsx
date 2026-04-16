"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Sprout, BookOpen, GraduationCap, ShieldCheck, Home } from "lucide-react";

const sections = [
  { label: "Inicio", href: "/investigacion", icon: Home },
  { label: "Grupos", href: "/investigacion/grupos", icon: Users },
  { label: "Semilleros", href: "/investigacion/semilleros", icon: Sprout },
  { label: "Publicaciones", href: "/investigacion/publicaciones", icon: BookOpen },
  { label: "Docentes", href: "/investigacion/docentes", icon: GraduationCap },
  { label: "Ética", href: "/investigacion/etica", icon: ShieldCheck },
];

export function InvestigacionNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-[64px] z-40">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-2.5">
          <Link
            href="/"
            className="shrink-0 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
          >
            ← Inicio
          </Link>
          <div className="w-px h-5 bg-border/50 mx-1 shrink-0" />
          {sections.map((section) => {
            const isActive = pathname === section.href;
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {section.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
