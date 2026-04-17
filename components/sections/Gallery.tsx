"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY SECTION · landing (v2 · editorial masonry)
//
// Principios:
//   - Masonry vía CSS columns → aspect ratios naturales, sin cropping forzado,
//     layout robusto con 1 imagen o con 100 (cero hardcode de posiciones).
//   - Filtro minimalista tipo segmented control (sin pills pesados).
//   - Lightbox tracking por `id` (no por índice) → inmune a reordenamientos,
//     filtros y borrados posteriores.
//   - Motion con propósito: reveal al scroll, crossfade en filter, hover lift.
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { GalleryConfig } from "@/types/landing.types";
import { motion, AnimatePresence } from "framer-motion";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DynamicIcon } from "@/lib/icons";
import { IMAGE_CATEGORIES, IMAGE_CATEGORY_STYLES } from "@/lib/admin-constants";

// ──────────────────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────────────────

interface DBGalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string | null;
  event?: string | null;
  category?: string | null;
  date?: string | null;
  published: boolean;
  order: number;
}

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  event?: string;
  category?: string;
  date?: string;
}

interface GalleryProps {
  config: GalleryConfig;
  className?: string;
}

const ALL_FILTER = "all";
// Threshold: a partir de este número de fotos, render como carrusel
const CAROUSEL_THRESHOLD = 6;

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────

export default function Gallery({ config, className }: GalleryProps) {
  const { badge, title, subtitle } = config;

  const [dbItems, setDbItems] = useState<DBGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_FILTER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Embla carousel API (solo se usa cuando filteredItems.length > CAROUSEL_THRESHOLD)
  const [api, setApi] = useState<CarouselApi>();
  const [carouselCurrent, setCarouselCurrent] = useState(0);
  const [carouselCount, setCarouselCount] = useState(0);

  // Fetch inicial
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gallery?status=published&limit=100", {
          cache: "no-store",
        });
        if (!cancelled && res.ok) {
          const json = await res.json();
          setDbItems(json.data ?? []);
        }
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mapeo a shape del componente. El src usa el endpoint privado.
  const allItems: GalleryItem[] = useMemo(
    () =>
      dbItems.map((item) => ({
        id: item.id,
        src: `/api/gallery/image/${item.id}`,
        alt: item.alt,
        caption: item.caption ?? undefined,
        event: item.event ?? undefined,
        category: item.category ?? undefined,
        date: item.date ?? undefined,
      })),
    [dbItems],
  );

  // Categorías disponibles derivadas de la data (no hardcode)
  const availableCategories = useMemo(() => {
    const present = new Set(
      allItems.map((i) => i.category).filter(Boolean) as string[],
    );
    return IMAGE_CATEGORIES.filter((c) => present.has(c.value));
  }, [allItems]);

  // Conteos por categoría (para el segmented control)
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of allItems) {
      if (!i.category) continue;
      map[i.category] = (map[i.category] ?? 0) + 1;
    }
    return map;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === ALL_FILTER) return allItems;
    return allItems.filter((i) => i.category === activeCategory);
  }, [allItems, activeCategory]);

  // Render adaptativo según cantidad de fotos:
  //   ≤ 3      → grid 1 fila × 3 col
  //   = 4      → grid 2×2 (evita fila huérfana)
  //   5 - 6    → grid 2 filas × 3 col
  //   > 6      → carrusel (altura fija, no expande landing)
  const useCarousel = filteredItems.length > CAROUSEL_THRESHOLD;
  const desktopColsClass =
    filteredItems.length === 4 ? "lg:grid-cols-2" : "lg:grid-cols-3";

  // Si el filtro deja un id seleccionado fuera del listado, cierra lightbox
  useEffect(() => {
    if (selectedId && !filteredItems.find((i) => i.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredItems, selectedId]);

  // Sincroniza dots del carrusel con embla
  const onCarouselSelect = useCallback(() => {
    if (!api) return;
    setCarouselCurrent(api.selectedScrollSnap());
    setCarouselCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onCarouselSelect();
    api.on("select", onCarouselSelect);
    api.on("reInit", onCarouselSelect);
    return () => {
      api.off("select", onCarouselSelect);
      api.off("reInit", onCarouselSelect);
    };
  }, [api, onCarouselSelect]);

  // Lightbox · tracking por id (inmune a reordenamientos/filtros)
  const selectedIndex = selectedId
    ? filteredItems.findIndex((i) => i.id === selectedId)
    : -1;
  const currentItem = selectedIndex >= 0 ? filteredItems[selectedIndex] : null;

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (selectedIndex < 0) return;
      const newIdx = direction === "next" ? selectedIndex + 1 : selectedIndex - 1;
      if (newIdx < 0 || newIdx >= filteredItems.length) return;
      setSelectedId(filteredItems[newIdx].id);
    },
    [selectedIndex, filteredItems],
  );

  // Keyboard: ← → navegar, Esc cerrar
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigateImage("prev");
      else if (e.key === "ArrowRight") navigateImage("next");
      else if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, navigateImage]);

  // ─────────────────────────────────────────────────────────────────────
  // Estados de render temprano
  // ─────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <GallerySectionShell badge={badge} title={title} subtitle={subtitle} className={className}>
        <GallerySkeleton />
      </GallerySectionShell>
    );
  }

  if (allItems.length === 0) return null;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <GallerySectionShell badge={badge} title={title} subtitle={subtitle} className={className}>
      {/* Filter · segmented control minimalista (solo si hay >1 categoría) */}
      {availableCategories.length > 1 && (
        <MotionWrapper delay={0.3} className="mb-10">
          <CategoryFilter
            active={activeCategory}
            onChange={setActiveCategory}
            total={allItems.length}
            availableCategories={availableCategories}
            categoryCounts={categoryCounts}
          />
        </MotionWrapper>
      )}

      {/* Render adaptativo: grid (≤6) o carrusel (>6) */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Sin imágenes en esta categoría.
        </div>
      ) : (
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-6xl px-2 sm:px-0"
        >
          {useCarousel ? (
            // ── Carrusel embla (≥7 fotos) ──────────────────────────────────
            <>
              <Carousel
                setApi={setApi}
                opts={{ align: "start", loop: false, slidesToScroll: 1 }}
                plugins={[
                  Autoplay({
                    delay: 5000,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {filteredItems.map((item, index) => (
                    <CarouselItem
                      key={item.id}
                      className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
                    >
                      <MasonryCard
                        item={item}
                        index={index}
                        onOpen={() => setSelectedId(item.id)}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4 h-10 w-10 bg-background/90 backdrop-blur-sm border-border/50 shadow-md hover:border-primary/30" />
                <CarouselNext className="hidden md:flex -right-4 h-10 w-10 bg-background/90 backdrop-blur-sm border-border/50 shadow-md hover:border-primary/30" />
              </Carousel>

              {carouselCount > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {Array.from({ length: carouselCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => api?.scrollTo(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === carouselCurrent
                          ? "w-5 bg-primary"
                          : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                      )}
                      aria-label={`Ir a slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            // ── Grid (≤6 fotos, cols adaptativos) ───────────────────────────
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5",
                desktopColsClass,
              )}
            >
              {filteredItems.map((item, index) => (
                <MasonryCard
                  key={item.id}
                  item={item}
                  index={index}
                  onOpen={() => setSelectedId(item.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {currentItem && (
          <Lightbox
            item={currentItem}
            index={selectedIndex}
            total={filteredItems.length}
            canPrev={selectedIndex > 0}
            canNext={selectedIndex < filteredItems.length - 1}
            onPrev={() => navigateImage("prev")}
            onNext={() => navigateImage("next")}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </GallerySectionShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Shell con header (evita duplicación entre estados)
// ──────────────────────────────────────────────────────────────────────────

function GallerySectionShell({
  badge,
  title,
  subtitle,
  className,
  children,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id="gallery"
      className={cn(
        "relative py-16 md:py-20 overflow-hidden scroll-mt-[68px]",
        className,
      )}
    >
      <div className="container relative px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-3 mb-10 sm:mb-12">
          {badge && (
            <MotionWrapper direction="down">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                {badge}
              </Badge>
            </MotionWrapper>
          )}
          <MotionWrapper delay={0.1}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {title}
            </h2>
          </MotionWrapper>
          {subtitle && (
            <MotionWrapper delay={0.2} className="max-w-2xl px-4 sm:px-0">
              <p className="text-base sm:text-lg text-muted-foreground">
                {subtitle}
              </p>
            </MotionWrapper>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Category filter · segmented control (underline en activo)
// ──────────────────────────────────────────────────────────────────────────

function CategoryFilter({
  active,
  onChange,
  total,
  availableCategories,
  categoryCounts,
}: {
  active: string;
  onChange: (v: string) => void;
  total: number;
  availableCategories: readonly { value: string; label: string }[];
  categoryCounts: Record<string, number>;
}) {
  const options = [
    { value: ALL_FILTER, label: "Todos", count: total },
    ...availableCategories.map((c) => ({
      value: c.value,
      label: c.label,
      count: categoryCounts[c.value] ?? 0,
    })),
  ];

  return (
    <div
      role="tablist"
      aria-label="Filtro de categoría"
      className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-b border-border/40 pb-1"
    >
      {options.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative py-2 text-sm font-medium transition-colors",
              "outline-none focus-visible:text-foreground",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            <span className="tracking-tight">{opt.label}</span>
            <span
              className={cn(
                "ml-1.5 text-[11px] font-normal tabular-nums",
                isActive ? "text-primary" : "text-muted-foreground/60",
              )}
            >
              {opt.count}
            </span>
            {isActive && (
              <motion.span
                layoutId="gallery-filter-underline"
                className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MasonryCard · preserva aspect ratio natural (vía <img>) y entra con fade-up
// ──────────────────────────────────────────────────────────────────────────

function MasonryCard({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  onOpen: () => void;
}) {
  const categoryStyle = item.category ? IMAGE_CATEGORY_STYLES[item.category] : null;
  const categoryLabel = item.category
    ? IMAGE_CATEGORIES.find((c) => c.value === item.category)?.label
    : null;

  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.03, 0.24), ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Ver imagen: ${item.caption || item.alt}`}
        className={cn(
          "group relative block w-full aspect-[4/3] overflow-hidden rounded-xl bg-muted",
          "ring-1 ring-border/50 transition-all duration-300",
          "hover:ring-primary/40 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
      >
        {/* Capa fondo: misma imagen blureada (rellena el frame sin franjas) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
        />

        {/* Capa principal: imagen completa, sin recortar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Category tag · esquina discreta */}
        {categoryStyle && categoryLabel && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-medium",
              "backdrop-blur-md border border-white/10",
              categoryStyle.bg,
              categoryStyle.color,
            )}
          >
            {categoryLabel}
          </span>
        )}

        {/* Overlay · gradient suave solo al hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Zoom cue sutil */}
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DynamicIcon name="Maximize2" size={14} />
        </span>
      </button>

      {/* Caption tipográfico fuera de la imagen (editorial) */}
      {(item.caption || item.event || item.date) && (
        <figcaption className="mt-2 px-1 space-y-0.5">
          {item.caption && (
            <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
              {item.caption}
            </p>
          )}
          {(item.event || item.date) && (
            <p className="text-xs text-muted-foreground">
              {item.event && <span>{item.event}</span>}
              {item.event && item.date && <span className="mx-1">·</span>}
              {item.date && <span>{formatDate(item.date)}</span>}
            </p>
          )}
        </figcaption>
      )}
    </motion.figure>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Lightbox · backdrop-blur, tracking por id, keyboard nav, focus-trap light
// ──────────────────────────────────────────────────────────────────────────

function Lightbox({
  item,
  index,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onClose,
}: {
  item: GalleryItem;
  index: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const categoryStyle = item.category ? IMAGE_CATEGORY_STYLES[item.category] : null;
  const categoryLabel = item.category
    ? IMAGE_CATEGORIES.find((c) => c.value === item.category)?.label
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || "Imagen de galería"}
    >
      {/* Backdrop con blur en vez de negro sólido */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 h-11 w-11 rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground backdrop-blur-sm flex items-center justify-center transition-colors"
        aria-label="Cerrar (Esc)"
      >
        <DynamicIcon name="X" size={22} />
      </button>

      {/* Prev */}
      {canPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground backdrop-blur-sm flex items-center justify-center transition-colors"
          aria-label="Imagen anterior (←)"
        >
          <DynamicIcon name="ChevronLeft" size={22} />
        </button>
      )}

      {/* Next */}
      {canNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground backdrop-blur-sm flex items-center justify-center transition-colors"
          aria-label="Imagen siguiente (→)"
        >
          <DynamicIcon name="ChevronRight" size={22} />
        </button>
      )}

      {/* Image + caption */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center w-[min(92vw,1200px)] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Frame uniforme con blur-fill (mismo patrón que la grid) */}
        <div className="relative w-full aspect-[4/3] max-h-[calc(92vh-160px)] overflow-hidden rounded-lg shadow-2xl bg-muted">
          {/* Capa fondo blureada */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50"
          />
          {/* Capa principal completa */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.alt}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        <div className="mt-4 text-center px-4 max-w-2xl space-y-1.5">
          {categoryStyle && categoryLabel && (
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded-md text-[10px] font-medium",
                categoryStyle.bg,
                categoryStyle.color,
              )}
            >
              {categoryLabel}
            </span>
          )}
          {item.caption && (
            <h3 className="font-semibold text-lg sm:text-xl tracking-tight">
              {item.caption}
            </h3>
          )}
          {(item.event || item.date) && (
            <p className="text-sm text-muted-foreground">
              {item.event && <span>{item.event}</span>}
              {item.event && item.date && <span className="mx-1">·</span>}
              {item.date && <span>{formatDate(item.date)}</span>}
            </p>
          )}
          <p className="text-xs text-muted-foreground/70 pt-1 tabular-nums">
            {index + 1} / {total}
            <span className="hidden sm:inline"> · ← → navegar · Esc cerrar</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────────────────────

function GallerySkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-2 sm:px-0">
      <div className="flex justify-center gap-4 pb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] w-full bg-muted animate-pulse rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
