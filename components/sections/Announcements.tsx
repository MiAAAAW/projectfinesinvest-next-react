"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS SECTION COMPONENT
// Sección de anuncios y convocatorias institucionales
// CONECTADO A BASE DE DATOS via /api/announcements
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon, ArrowRight } from "@/lib/icons";
import type { AnnouncementsConfig, AnnouncementType } from "@/types/landing.types";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useEffect, useState } from "react";

// Componente de Card expandible en hover
function ExpandableAnnouncementCard({
  announcement,
  typeStyle
}: {
  announcement: {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    type: string;
    icon: string;
    important: boolean;
    date: string;
    href?: string;
  };
  typeStyle: { color: string; bg: string; label: string };
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Resumen para vista normal, contenido completo para hover
  const previewText = announcement.excerpt || announcement.content;
  const fullContent = announcement.content;

  // Mostrar indicador si hay contenido largo O si content es diferente del excerpt
  const hasMoreContent = fullContent.length > 100 ||
    (announcement.excerpt && fullContent !== announcement.excerpt);

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, layout: { duration: 0.3 } }}
      className={cn("h-full", !isHovered && "min-h-[200px]")}
    >
      <Card
        className={cn(
          "group relative h-full overflow-hidden flex flex-col",
          "border bg-background/80 backdrop-blur-sm",
          "transition-colors duration-300",
          "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
        )}
      >
        {/* Important indicator */}
        {announcement.important && (
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10">
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

              {/* Title - altura fija cuando colapsado, expandible en hover */}
              <motion.h3
                layout="position"
                className={cn(
                  "font-semibold text-lg leading-tight group-hover:text-primary transition-colors break-all",
                  !isHovered && "line-clamp-2 min-h-[3rem]"
                )}
              >
                {announcement.title}
              </motion.h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Content - muestra excerpt normal, content completo en hover */}
          <motion.div
            layout
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn("flex-1", !isHovered && "min-h-[2.5rem]")}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={isHovered ? "full" : "preview"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "text-muted-foreground text-sm leading-relaxed break-all",
                  !isHovered && "line-clamp-2"
                )}
              >
                {isHovered ? fullContent : previewText}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Footer con link y indicador de expansión */}
          <motion.div layout="position" className="mt-4 flex items-center justify-between">
            {announcement.href ? (
              <Link
                href={announcement.href}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Leer más
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            ) : (
              <span />
            )}

            {/* Indicador visual de que hay más contenido */}
            <AnimatePresence>
              {!isHovered && hasMoreContent && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground/60 flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Tipo para anuncios de la BD
interface DBAnnouncementItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  type: string;
  icon: string;
  important: boolean;
  published: boolean;
  date: string;
  href?: string | null;
}

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
  const { badge, title, subtitle, showViewAll, viewAllHref } = config;

  // Estado para anuncios de la BD
  const [dbItems, setDbItems] = useState<DBAnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch anuncios de la API al montar
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements?status=published&limit=8");
        if (res.ok) {
          const json = await res.json();
          setDbItems(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  // SOLO usar datos de la BD - NO fallback a hardcoded
  const items = dbItems.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    excerpt: item.excerpt || undefined,
    type: item.type as AnnouncementType,
    icon: item.icon,
    important: item.important,
    date: item.date,
    href: item.href || undefined,
  }));

  // Si está cargando, mostrar skeleton o nada
  if (isLoading) {
    return (
      <section id="announcements" className={cn("relative py-24 md:py-32", className)}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-12 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-6 max-w-5xl mx-auto md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay anuncios, no mostrar la sección
  if (items.length === 0) {
    return null;
  }

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
                <ExpandableAnnouncementCard
                  announcement={announcement}
                  typeStyle={typeStyle}
                />
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
