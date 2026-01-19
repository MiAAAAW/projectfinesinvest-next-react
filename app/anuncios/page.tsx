"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA DE TODOS LOS ANUNCIOS
// Muestra todos los anuncios publicados desde la BD
// Cards expandibles al hacer click para ver contenido completo
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon, ArrowLeft } from "@/lib/icons";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Tipo para anuncios de la BD
interface Announcement {
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

type AnnouncementType = "noticia" | "evento" | "convocatoria" | "comunicado" | "aviso";

// Colores por tipo
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
    month: "long",
    year: "numeric",
  });
}

// Componente de Card expandible al hacer click
function ExpandableAnnouncementCard({
  announcement,
  typeStyle,
  index
}: {
  announcement: Announcement;
  typeStyle: { color: string; bg: string; label: string };
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Resumen para vista colapsada, contenido completo para expandida
  const previewText = announcement.excerpt || announcement.content;
  const fullContent = announcement.content;

  // Mostrar "Ver más" si hay contenido largo O si el content es diferente del excerpt
  const hasMoreContent = fullContent.length > 150 ||
    (announcement.excerpt && fullContent !== announcement.excerpt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card
        className={cn(
          "group relative flex flex-col cursor-pointer",
          "hover:border-primary/20 hover:shadow-lg transition-all",
          isExpanded && "ring-2 ring-primary/20"
        )}
        onClick={() => hasMoreContent && setIsExpanded(!isExpanded)}
      >
        {/* Important badge */}
        {announcement.important && (
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10">
            <div className="absolute top-2 right-[-20px] w-20 bg-primary text-primary-foreground text-xs font-medium py-1 text-center rotate-45">
              Nuevo
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
              typeStyle.bg,
              typeStyle.color
            )}>
              <DynamicIcon name={announcement.icon || "Bell"} size={24} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn("text-xs", typeStyle.color)}>
                  {typeStyle.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(announcement.date)}
                </span>
              </div>

              <motion.h2
                layout="position"
                className={cn(
                  "font-semibold text-lg leading-tight group-hover:text-primary transition-colors break-all",
                  !isExpanded && "line-clamp-2"
                )}
              >
                {announcement.title}
              </motion.h2>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <motion.div
            layout
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={isExpanded ? "full" : "preview"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "text-muted-foreground text-sm leading-relaxed break-all",
                  !isExpanded && "line-clamp-3"
                )}
              >
                {isExpanded ? fullContent : previewText}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Footer con acciones */}
          <motion.div layout="position" className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {announcement.href && (
                <Link
                  href={announcement.href}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Ver enlace
                  <ExternalLink size={14} className="ml-1" />
                </Link>
              )}
            </div>

            {/* Indicador expandir/colapsar */}
            {hasMoreContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isExpanded ? (
                    <motion.span
                      key="less"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      Ver menos
                      <ChevronUp size={14} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="more"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      Ver más
                      <ChevronDown size={14} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AnunciosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    async function fetchAnnouncements() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/announcements?status=published&page=${page}&limit=${limit}`);
        if (res.ok) {
          const json = await res.json();
          setAnnouncements(json.data || []);
          setTotalPages(json.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnnouncements();
  }, [page]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-8 md:py-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Anuncios y Convocatorias</h1>
          <p className="text-muted-foreground mt-2">
            Todas las noticias, eventos y comunicados de FINESI
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <DynamicIcon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay anuncios publicados</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              {announcements.map((announcement, index) => {
                const typeStyle = typeStyles[announcement.type as AnnouncementType] || typeStyles.noticia;

                return (
                  <ExpandableAnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    typeStyle={typeStyle}
                    index={index}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
