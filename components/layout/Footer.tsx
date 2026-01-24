"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER COMPONENT - COMPACT PROFESSIONAL
// Pie de página compacto - 100% config-driven (sin hardcoding)
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { DynamicIcon, Heart, ExternalLink } from "@/lib/icons";
import type { FooterConfig } from "@/types/landing.types";
import Link from "next/link";

interface FooterProps {
  config: FooterConfig;
  className?: string;
}

export default function Footer({ config, className }: FooterProps) {
  const { logo, description, columns, copyright, bottomLinks } = config;

  return (
    <footer className={cn("bg-transparent", className)}>
      <div className="container px-4 md:px-6">
        {/* Main Row */}
        <div className="py-8 flex flex-col lg:flex-row gap-8">
          {/* Brand */}
          <div className="lg:w-1/4 space-y-3">
            {logo && (
              <Link href="/" className="inline-flex items-center gap-2">
                {logo.icon && (
                  <DynamicIcon name={logo.icon} className="h-6 w-6 text-primary" />
                )}
                <span className="font-bold text-lg">{logo.text}</span>
              </Link>
            )}
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* All Columns from Config */}
          <div className="lg:flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            {columns.map((column) => (
              <div key={column.title} className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  {column.title}
                </h4>
                <ul className="space-y-1.5">
                  {column.links.map((link) => (
                    <li key={link.text}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        <span className="truncate">{link.text}</span>
                        {link.external && <ExternalLink className="w-3 h-3 shrink-0" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap justify-center">
            {copyright}
            <span className="inline-flex items-center ml-1">
              Made with
              <Heart className="w-3 h-3 mx-1 text-red-500 fill-red-500" />
              by
              <span className="font-semibold text-foreground/80 ml-1">ODINLAB</span>
            </span>
          </p>

          {bottomLinks && bottomLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {bottomLinks.map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {link.text}
                  {link.external && <ExternalLink className="w-3 h-3" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
