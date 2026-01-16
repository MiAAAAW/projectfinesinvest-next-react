"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS SECTION COMPONENT
// Sección de anuncios y convocatorias institucionales
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon, ArrowRight } from "@/lib/icons";
import type { AnnouncementsConfig, AnnouncementType } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

interface AnnouncementsProps {
  config: AnnouncementsConfig;
  className?: string;
}

// Colores y estilos por tipo de anuncio
const typeStyles: Record<AnnouncementType, { color: string; bg: string; label: string }> = {
  noticia: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Noticia" },
  evento: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", label: "Evento" },
  convocatoria: { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", label: "Convocatoria" },
  comunicado: { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", label: "Comunicado" },
  aviso: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", label: "Aviso" },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Announcements({ config, className }: AnnouncementsProps) {
  const { badge, title, subtitle, items, showViewAll, viewAllHref } = config;

  return (
    <section
      id="announcements"
      className={cn(
        "relative py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background - transparente para mostrar animated-bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-transparent" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <div className="container relative px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          {badge && (
            <MotionWrapper direction="down">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                {badge}
              </Badge>
            </MotionWrapper>
          )}

          <MotionWrapper delay={0.1}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {title}
            </h2>
          </MotionWrapper>

          {subtitle && (
            <MotionWrapper delay={0.2} className="max-w-2xl">
              <p className="text-lg text-muted-foreground">
                {subtitle}
              </p>
            </MotionWrapper>
          )}
        </div>

        {/* Announcements Grid */}
        <StaggerContainer className="grid gap-6 max-w-5xl mx-auto md:grid-cols-2" staggerDelay={0.1}>
          {items.map((announcement) => {
            const typeStyle = typeStyles[announcement.type];

            return (
              <StaggerItem key={announcement.id}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      "group relative h-full overflow-hidden",
                      "border bg-background/80 backdrop-blur-sm",
                      "transition-all duration-300",
                      "hover:border-primary/20 hover:shadow-lg",
                      announcement.important && "ring-2 ring-primary/20"
                    )}
                  >
                    {/* Important indicator */}
                    {announcement.important && (
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute top-2 right-[-20px] w-20 bg-primary text-primary-foreground text-xs font-medium py-1 text-center rotate-45">
                          Nuevo
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                          typeStyle.bg,
                          typeStyle.color
                        )}>
                          <DynamicIcon name={announcement.icon || "Bell"} size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Type badge and date */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={cn("text-xs", typeStyle.color)}>
                              {typeStyle.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(announcement.date)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                            {announcement.title}
                          </h3>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {announcement.excerpt || announcement.content}
                      </p>

                      {announcement.href && (
                        <Link
                          href={announcement.href}
                          className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                          Leer más
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* View All Button */}
        {showViewAll && viewAllHref && (
          <MotionWrapper delay={0.4} className="flex justify-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href={viewAllHref}>
                Ver todos los anuncios
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </MotionWrapper>
        )}
      </div>
    </section>
  );
}
