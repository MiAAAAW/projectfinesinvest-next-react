"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY SECTION COMPONENT
// Galería de fotos con Dialog de shadcn para lightbox
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryConfig } from "@/types/landing.types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useState } from "react";
import { DynamicIcon } from "@/lib/icons";

interface GalleryProps {
  config: GalleryConfig;
  className?: string;
}

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
  const { badge, title, subtitle, items, columns = 3 } = config;
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImage === null) return;

    if (direction === "prev" && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    } else if (direction === "next" && selectedImage < items.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const currentItem = selectedImage !== null ? items[selectedImage] : null;

  return (
    <section
      id="gallery"
      className={cn(
        "relative py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background - transparente */}
      <div className="absolute inset-0 bg-background/10" />

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

        {/* Gallery Grid */}
        <StaggerContainer className={cn("grid gap-4 max-w-6xl mx-auto", gridCols[columns])} staggerDelay={0.08}>
          {items.map((item, index) => (
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

        {/* Lightbox Dialog - shadcn */}
        <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
            <DialogTitle className="sr-only">
              {currentItem?.caption || "Imagen de galería"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {currentItem?.event || "Vista ampliada de la imagen"}
            </DialogDescription>

            {currentItem && (
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-video w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={currentItem.src}
                        alt={currentItem.alt}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                {selectedImage !== null && selectedImage > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage("prev");
                    }}
                  >
                    <DynamicIcon name="ChevronLeft" size={24} />
                  </Button>
                )}

                {selectedImage !== null && selectedImage < items.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage("next");
                    }}
                  >
                    <DynamicIcon name="ChevronRight" size={24} />
                  </Button>
                )}

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center text-white"
                  >
                    {currentItem.caption && (
                      <p className="font-medium text-lg">{currentItem.caption}</p>
                    )}
                    <div className="flex items-center justify-center gap-3 mt-2 text-sm text-white/70">
                      {currentItem.event && <span>{currentItem.event}</span>}
                      {currentItem.event && currentItem.date && <span>•</span>}
                      {currentItem.date && <span>{formatDate(currentItem.date)}</span>}
                    </div>
                    {/* Image counter */}
                    <p className="mt-3 text-xs text-white/50">
                      {(selectedImage ?? 0) + 1} / {items.length}
                    </p>
                  </motion.div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
