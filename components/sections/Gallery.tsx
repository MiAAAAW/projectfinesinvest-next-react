"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY SECTION COMPONENT
// Galería de fotos con filtros por categoría y lightbox
// CONECTADO A BASE DE DATOS via /api/gallery
// Categorías desde constantes centralizadas
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GalleryConfig } from "@/types/landing.types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useState, useEffect, useMemo, useCallback } from "react";
import { DynamicIcon } from "@/lib/icons";
import { IMAGE_CATEGORIES, IMAGE_CATEGORY_STYLES } from "@/lib/admin-constants";

// Tipo para imágenes de la BD
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

interface GalleryProps {
  config: GalleryConfig;
  className?: string;
}

// Número inicial de imágenes a mostrar
const INITIAL_ITEMS_COUNT = 9;

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Gallery({ config, className }: GalleryProps) {
  const { badge, title, subtitle, columns = 3 } = config;
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  // Estado para imágenes de la BD
  const [dbItems, setDbItems] = useState<DBGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch imágenes de la API al montar
  useEffect(() => {
    async function fetchGallery() {
      try {
        // Traer más imágenes para permitir filtrado
        const res = await fetch("/api/gallery?status=published&limit=50");
        if (res.ok) {
          const json = await res.json();
          setDbItems(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Mapear datos de BD al formato del componente
  // Usar API endpoint para servir imágenes desde storage privado
  const allItems = useMemo(() =>
    dbItems.map(item => ({
      id: item.id,
      src: `/api/gallery/image/${item.id}`,
      alt: item.alt,
      caption: item.caption || undefined,
      event: item.event || undefined,
      category: item.category || undefined,
      date: item.date || undefined,
    }))
  , [dbItems]);

  // Obtener categorías únicas de las imágenes (dinámico desde BD)
  const availableCategories = useMemo(() => {
    const cats = new Set(allItems.map(item => item.category).filter(Boolean));
    return IMAGE_CATEGORIES.filter(cat => cats.has(cat.value));
  }, [allItems]);

  // Filtrar por categoría activa
  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return allItems;
    return allItems.filter(item => item.category === activeCategory);
  }, [allItems, activeCategory]);

  // Limitar items mostrados si no se ha clickeado "Ver más"
  const displayItems = useMemo(() => {
    if (showAll) return filteredItems;
    return filteredItems.slice(0, INITIAL_ITEMS_COUNT);
  }, [filteredItems, showAll]);

  const hasMoreItems = filteredItems.length > INITIAL_ITEMS_COUNT;

  // Grid responsive: 1 col móvil, 2 col tablet, 3-4 col desktop
  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  // Navegación en lightbox - usa filteredItems para mantener contexto del filtro
  const navigateImage = useCallback((direction: "prev" | "next") => {
    if (selectedImage === null) return;

    if (direction === "prev" && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    } else if (direction === "next" && selectedImage < filteredItems.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  }, [selectedImage, filteredItems.length]);

  // Keyboard navigation en lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;

      if (e.key === "ArrowLeft") {
        navigateImage("prev");
      } else if (e.key === "ArrowRight") {
        navigateImage("next");
      } else if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, navigateImage]);

  const currentItem = selectedImage !== null ? filteredItems[selectedImage] : null;

  // Al cambiar categoría, resetear showAll
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setShowAll(false);
  };

  // Si está cargando, mostrar skeleton responsive
  if (isLoading) {
    return (
      <section id="gallery" className={cn("relative py-16 sm:py-24 md:py-32", className)}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16">
            <div className="h-7 sm:h-8 w-24 sm:w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 sm:h-12 w-48 sm:w-64 bg-muted animate-pulse rounded" />
          </div>
          {/* Filter skeleton */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8 px-2 sm:px-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 sm:h-9 w-20 sm:w-24 bg-muted animate-pulse rounded-full" />
            ))}
          </div>
          <div className={cn("grid gap-3 sm:gap-4 max-w-6xl mx-auto px-2 sm:px-0", gridCols[columns])}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay imágenes, no mostrar sección
  if (allItems.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      className={cn(
        "relative py-16 sm:py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background removed - unified with global animated-bg */}

      <div className="container relative px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 mb-10 sm:mb-12">
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

        {/* Category Filters - Solo mostrar si hay más de 1 categoría */}
        {availableCategories.length > 1 && (
          <MotionWrapper delay={0.3} className="mb-8 sm:mb-10">
            <div className="flex flex-wrap justify-center gap-2 px-2 sm:px-0">
              {/* Botón "Todos" */}
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange("all")}
                className="rounded-full"
              >
                <DynamicIcon name="LayoutGrid" size={16} className="mr-2" />
                Todos
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                  {allItems.length}
                </Badge>
              </Button>

              {/* Botones de categorías dinámicas */}
              {availableCategories.map((cat) => {
                const style = IMAGE_CATEGORY_STYLES[cat.value];
                const count = allItems.filter(item => item.category === cat.value).length;

                return (
                  <Button
                    key={cat.value}
                    variant={activeCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={cn(
                      "rounded-full",
                      activeCategory !== cat.value && style && `hover:${style.bg}`
                    )}
                  >
                    {style && (
                      <DynamicIcon
                        name={style.icon}
                        size={16}
                        className={cn("mr-2", activeCategory !== cat.value && style.color)}
                      />
                    )}
                    {cat.label}
                    <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </MotionWrapper>
        )}

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StaggerContainer
              className={cn("grid gap-3 sm:gap-4 lg:gap-5 max-w-6xl mx-auto px-2 sm:px-0", gridCols[columns])}
              staggerDelay={0.06}
            >
              {displayItems.map((item, index) => (
                <StaggerItem key={item.id}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="group relative aspect-[4/3] w-full rounded-xl overflow-hidden cursor-pointer bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Ver imagen: ${item.caption || item.alt}`}
                  >
                    {/* Image */}
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Category Badge */}
                    {item.category && IMAGE_CATEGORY_STYLES[item.category] && (
                      <div className="absolute top-3 left-3 z-10">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs backdrop-blur-sm",
                            IMAGE_CATEGORY_STYLES[item.category].bg,
                            IMAGE_CATEGORY_STYLES[item.category].color
                          )}
                        >
                          {IMAGE_CATEGORIES.find(c => c.value === item.category)?.label}
                        </Badge>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {item.caption && (
                        <p className="text-white font-medium text-sm">
                          {item.caption}
                        </p>
                      )}
                      {(item.date || item.event) && (
                        <p className="text-white/70 text-xs mt-1">
                          {item.event && <span>{item.event}</span>}
                          {item.event && item.date && <span> • </span>}
                          {item.date && <span>{formatDate(item.date)}</span>}
                        </p>
                      )}
                    </div>

                    {/* Zoom icon */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <DynamicIcon name="ZoomIn" size={20} className="text-white" />
                      </div>
                    </div>
                  </motion.button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>
        </AnimatePresence>

        {/* Ver más button */}
        {hasMoreItems && !showAll && (
          <MotionWrapper delay={0.4} className="mt-8 sm:mt-10 text-center px-4 sm:px-0">
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowAll(true)}
              className="group sm:text-base"
            >
              Ver más
              <DynamicIcon
                name="ChevronDown"
                size={18}
                className="ml-1.5 sm:ml-2 transition-transform group-hover:translate-y-1"
              />
              <Badge variant="secondary" className="ml-2 text-xs">
                +{filteredItems.length - INITIAL_ITEMS_COUNT}
              </Badge>
            </Button>
          </MotionWrapper>
        )}

        {/* Lightbox - Overlay fullscreen profesional */}
        <AnimatePresence>
          {selectedImage !== null && currentItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
              role="dialog"
              aria-modal="true"
              aria-label={currentItem.caption || "Imagen de galería"}
            >
              {/* Backdrop oscuro */}
              <div className="absolute inset-0 bg-black/95" />

              {/* Close Button - Fixed top right */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
                aria-label="Cerrar (Esc)"
              >
                <DynamicIcon name="X" size={24} />
              </button>

              {/* Navigation - Previous */}
              {selectedImage > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("prev");
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
                  aria-label="Imagen anterior (←)"
                >
                  <DynamicIcon name="ChevronLeft" size={28} />
                </button>
              )}

              {/* Navigation - Next */}
              {selectedImage < filteredItems.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("next");
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
                  aria-label="Imagen siguiente (→)"
                >
                  <DynamicIcon name="ChevronRight" size={28} />
                </button>
              )}

              {/* Image Container - Centered, natural size with limits */}
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex flex-col items-center max-w-[92vw] max-h-[92vh] sm:max-w-[88vw] sm:max-h-[88vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image - Natural size, limited by viewport */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentItem.src}
                  alt={currentItem.alt}
                  className="max-w-full max-h-[calc(92vh-80px)] sm:max-h-[calc(88vh-100px)] w-auto h-auto object-contain rounded-lg shadow-2xl"
                />

                {/* Caption overlay - Below image */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-4 text-center text-white px-4 max-w-2xl"
                >
                  {/* Category badge */}
                  {currentItem.category && IMAGE_CATEGORY_STYLES[currentItem.category] && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "mb-2",
                        IMAGE_CATEGORY_STYLES[currentItem.category].bg,
                        IMAGE_CATEGORY_STYLES[currentItem.category].color
                      )}
                    >
                      {IMAGE_CATEGORIES.find(c => c.value === currentItem.category)?.label}
                    </Badge>
                  )}

                  {currentItem.caption && (
                    <p className="font-semibold text-lg sm:text-xl">{currentItem.caption}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1 text-sm text-white/70">
                    {currentItem.event && <span>{currentItem.event}</span>}
                    {currentItem.event && currentItem.date && <span>•</span>}
                    {currentItem.date && <span>{formatDate(currentItem.date)}</span>}
                  </div>

                  {/* Counter */}
                  <div className="mt-3 text-xs text-white/50">
                    {(selectedImage ?? 0) + 1} / {filteredItems.length}
                    <span className="hidden sm:inline"> • ← → navegar • Esc cerrar</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
