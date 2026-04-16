"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS SECTION COMPONENT
// Diseño tipo boletín: lista scrolleable izquierda + detalle derecha
// CONECTADO A BASE DE DATOS via /api/announcements
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon, ArrowRight } from "@/lib/icons";
import { ExternalLink, Newspaper } from "lucide-react";
import type { AnnouncementsConfig, AnnouncementType } from "@/types/landing.types";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { useEffect, useState, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

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

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  type: AnnouncementType;
  icon: string;
  important: boolean;
  date: string;
  href?: string;
}

interface AnnouncementsProps {
  config: AnnouncementsConfig;
  className?: string;
}

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

// ═══════════════════════════════════════════════════════════════════════════════
// ITEM DE LA LISTA (izquierda)
// ═══════════════════════════════════════════════════════════════════════════════

function AnnouncementListItem({
  announcement,
  typeStyle,
  isSelected,
  onClick,
}: {
  announcement: AnnouncementItem;
  typeStyle: { color: string; bg: string; label: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-lg transition-all duration-200",
        "hover:bg-muted/50 cursor-pointer",
        isSelected
          ? "bg-primary/10 border border-primary/30 shadow-sm"
          : "border border-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md mt-0.5",
          typeStyle.bg,
          typeStyle.color
        )}>
          <DynamicIcon name={announcement.icon || "Bell"} size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", typeStyle.color)}>
              {typeStyle.label}
            </Badge>
            {announcement.important && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Nuevo
              </Badge>
            )}
          </div>
          <h4 className={cn(
            "font-medium text-sm leading-tight line-clamp-2",
            isSelected ? "text-primary" : "text-foreground"
          )}>
            {announcement.title}
          </h4>
          <span className="text-xs text-muted-foreground mt-1 block">
            {formatDate(announcement.date)}
          </span>
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL DE DETALLE (derecha)
// ═══════════════════════════════════════════════════════════════════════════════

function AnnouncementDetail({
  announcement,
  typeStyle,
}: {
  announcement: AnnouncementItem;
  typeStyle: { color: string; bg: string; label: string };
}) {
  return (
    <Card className="border border-border/50 bg-card/80 backdrop-blur-sm h-full flex flex-col overflow-hidden">
      {/* Header fijo */}
      <div className="p-6 pb-3 shrink-0">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
            typeStyle.bg,
            typeStyle.color
          )}>
            <DynamicIcon name={announcement.icon || "Bell"} size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", typeStyle.color)}>
                {typeStyle.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(announcement.date)}
              </span>
              {announcement.important && (
                <Badge variant="destructive" className="text-xs">
                  Importante
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-xl leading-tight">
              {announcement.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0 scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {announcement.excerpt && (
              <p className="text-muted-foreground text-sm font-medium mb-3 italic border-l-2 border-primary/30 pl-3">
                {announcement.excerpt}
              </p>
            )}
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {announcement.content}
            </p>
            {announcement.href && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <Link
                  href={announcement.href}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Ver enlace
                  <ExternalLink size={14} className="ml-1" />
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISTA MOBILE - Cards expandibles
// ═══════════════════════════════════════════════════════════════════════════════

function MobileAnnouncementCard({
  announcement,
  typeStyle,
}: {
  announcement: AnnouncementItem;
  typeStyle: { color: string; bg: string; label: string };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={cn(
        "border border-border/50 bg-card/80 cursor-pointer transition-all",
        expanded && "ring-1 ring-primary/20"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            typeStyle.bg,
            typeStyle.color
          )}>
            <DynamicIcon name={announcement.icon || "Bell"} size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", typeStyle.color)}>
                {typeStyle.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {formatDate(announcement.date)}
              </span>
              {announcement.important && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  Nuevo
                </Badge>
              )}
            </div>
            <h4 className={cn(
              "font-semibold text-sm leading-tight",
              !expanded && "line-clamp-2"
            )}>
              {announcement.title}
            </h4>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/50">
                {announcement.excerpt && (
                  <p className="text-muted-foreground text-xs italic border-l-2 border-primary/30 pl-2 mb-2">
                    {announcement.excerpt}
                  </p>
                )}
                <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                  {announcement.content}
                </p>
                {announcement.href && (
                  <Link
                    href={announcement.href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center text-xs font-medium text-primary hover:underline mt-2"
                  >
                    Ver enlace
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function Announcements({ config, className }: AnnouncementsProps) {
  const { badge, title, subtitle, showViewAll, viewAllHref } = config;

  const [dbItems, setDbItems] = useState<DBAnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements?status=published&limit=10");
        if (res.ok) {
          const json = await res.json();
          setDbItems(json.data || []);
          // Seleccionar el primer anuncio por defecto
          if (json.data?.length > 0) {
            setSelectedId(json.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const items: AnnouncementItem[] = dbItems.map(item => ({
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

  const selectedItem = items.find(i => i.id === selectedId) || items[0];

  // Skeleton loading
  if (isLoading) {
    return (
      <section id="announcements" className={cn("relative pt-8 pb-16 md:pb-24 scroll-mt-[80px]", className)}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="h-10 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="max-w-6xl mx-auto grid md:grid-cols-[340px_1fr] gap-4">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
            <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section
      id="announcements"
      className={cn(
        "relative pt-8 pb-16 md:pb-24 overflow-hidden scroll-mt-[80px]",
        className
      )}
    >
      <div className="container relative px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-1.5 mb-4">
          {badge && (
            <MotionWrapper direction="down">
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                {badge}
              </Badge>
            </MotionWrapper>
          )}
          <MotionWrapper delay={0.1}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              {title}
            </h2>
          </MotionWrapper>
          {subtitle && (
            <MotionWrapper delay={0.2} className="max-w-2xl">
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            </MotionWrapper>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* DESKTOP: Lista izquierda + Detalle derecha                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <MotionWrapper delay={0.3}>
          <div className="hidden md:grid max-w-6xl mx-auto grid-cols-[340px_1fr] gap-4 h-[500px] [&>*]:max-h-[500px]">
            {/* Lista scrolleable */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col h-full">
              <div className="p-3 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Newspaper size={16} />
                  <span>{items.length} anuncios</span>
                </div>
              </div>
              <div
                ref={listRef}
                className="overflow-y-auto p-2 space-y-1 flex-1 scrollbar-thin"
              >
                {items.map((announcement) => {
                  const typeStyle = typeStyles[announcement.type];
                  return (
                    <AnnouncementListItem
                      key={announcement.id}
                      announcement={announcement}
                      typeStyle={typeStyle}
                      isSelected={selectedId === announcement.id}
                      onClick={() => setSelectedId(announcement.id)}
                    />
                  );
                })}
              </div>
            </Card>

            {/* Panel de detalle */}
            <div className="h-full overflow-hidden">
              {selectedItem && (
                <AnnouncementDetail
                  announcement={selectedItem}
                  typeStyle={typeStyles[selectedItem.type]}
                />
              )}
            </div>
          </div>
        </MotionWrapper>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MOBILE: Cards expandibles apiladas                       */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="md:hidden space-y-3">
          {items.map((announcement) => (
            <MobileAnnouncementCard
              key={announcement.id}
              announcement={announcement}
              typeStyle={typeStyles[announcement.type]}
            />
          ))}
        </div>

        {/* View All - solo en mobile */}
        {showViewAll && viewAllHref && (
          <div className="md:hidden flex justify-center mt-6">
            <Button asChild variant="outline" size="lg">
              <Link href={viewAllHref}>
                Ver todos los anuncios
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
