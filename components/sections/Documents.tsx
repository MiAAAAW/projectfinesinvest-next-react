"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS SECTION COMPONENT
// Sección de documentos y formatos descargables
// CONECTADO A BASE DE DATOS via /api/documents
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicIcon } from "@/lib/icons";
import type { DocumentsConfig, DocumentType, DocumentCategory } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useState, useMemo, useEffect } from "react";

// Tipo para documentos de la BD
interface DBDocumentItem {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  category: string;
  downloads: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsProps {
  config: DocumentsConfig;
  className?: string;
}

// Iconos por tipo de archivo
const fileTypeIcons: Record<DocumentType, { icon: string; color: string }> = {
  pdf: { icon: "FileText", color: "text-red-500" },
  doc: { icon: "FileEdit", color: "text-blue-500" },
  xls: { icon: "FileSpreadsheet", color: "text-green-500" },
  ppt: { icon: "Presentation", color: "text-orange-500" },
  zip: { icon: "FileArchive", color: "text-purple-500" },
  other: { icon: "File", color: "text-gray-500" },
};

// Labels para categorías
const categoryLabels: Record<DocumentCategory, string> = {
  reglamentos: "Reglamentos",
  formatos: "Formatos",
  manuales: "Manuales",
  investigacion: "Investigación",
  tramites: "Trámites",
  otros: "Otros",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Documents({ config, className }: DocumentsProps) {
  const { badge, title, subtitle, categories, showSearch } = config;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");

  // Estado para documentos de la BD
  const [dbItems, setDbItems] = useState<DBDocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para preview modal
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    title: string;
    fileType: string;
  } | null>(null);

  // Tipos de archivo que se pueden previsualizar en iframe
  const canPreviewFile = (fileType: string) => {
    const type = fileType?.toLowerCase();
    return type === "pdf" || type === "application/pdf";
  };

  // Fetch documentos de la API al montar
  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch("/api/documents?status=published&limit=50");
        if (res.ok) {
          const json = await res.json();
          setDbItems(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  // SOLO usar datos de la BD - NO fallback a hardcoded
  const items = dbItems.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || undefined,
    fileUrl: item.fileUrl,
    fileType: item.fileType as DocumentType,
    fileSize: item.fileSize || undefined,
    category: item.category as DocumentCategory,
    updatedAt: item.updatedAt,
  }));

  // Filtrar documentos
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === "all" || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, activeCategory]);

  // Categorías disponibles
  const availableCategories = categories || Array.from(new Set(items.map(item => item.category)));

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <section id="documents" className={cn("relative py-24 md:py-32", className)}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-12 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay documentos, no mostrar sección
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="documents"
      className={cn(
        "relative py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background - transparente */}
      <div className="absolute inset-0 bg-background/20" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="container relative px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
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

        {/* Search */}
        {showSearch && (
          <MotionWrapper delay={0.3} className="max-w-4xl mx-auto mb-6">
            <div className="relative">
              <DynamicIcon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </MotionWrapper>
        )}

        {/* Category Tabs */}
        <MotionWrapper delay={0.4} className="max-w-4xl mx-auto mb-8">
          <Tabs defaultValue="all" onValueChange={(value) => setActiveCategory(value as DocumentCategory | "all")}>
            <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
              >
                Todos
              </TabsTrigger>
              {availableCategories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
                >
                  {categoryLabels[category]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </MotionWrapper>

        {/* Documents Grid */}
        {/* Key cambia con filtro para re-animar items */}
        <StaggerContainer
          key={`docs-${activeCategory}-${searchQuery}`}
          className="grid gap-4 max-w-4xl mx-auto"
          staggerDelay={0.05}
        >
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron documentos
            </div>
          ) : (
            filteredItems.map((doc) => {
              const fileStyle = fileTypeIcons[doc.fileType] || fileTypeIcons.other;
              const canPreview = canPreviewFile(doc.fileType);

              return (
                <StaggerItem key={doc.id}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Diseño minimalista - una sola línea */}
                    <div className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all">
                      {/* Icono pequeño */}
                      <DynamicIcon
                        name={fileStyle.icon}
                        size={18}
                        className={cn(fileStyle.color, "shrink-0")}
                      />

                      {/* Título + metadata inline */}
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <span className="font-medium truncate group-hover:text-primary transition-colors">
                          {doc.title}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {doc.fileSize}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 hidden md:inline-flex">
                          {categoryLabels[doc.category]}
                        </Badge>
                      </div>

                      {/* Botones */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Preview - Solo para PDFs */}
                        {canPreview && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setPreviewDoc({
                              id: doc.id,
                              title: doc.title,
                              fileType: doc.fileType,
                            })}
                          >
                            <DynamicIcon name="Eye" size={16} />
                          </Button>
                        )}

                        {/* Download */}
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Link href={`/api/download/${doc.id}?download=true`}>
                            <DynamicIcon name="Download" size={16} />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })
          )}
        </StaggerContainer>
      </div>

      {/* Preview Modal - Tamaño grande para ver PDF */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="!max-w-6xl !w-[95vw] !h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <DynamicIcon name="Eye" size={18} className="text-primary" />
              {previewDoc?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {previewDoc && (
              <iframe
                src={`/api/download/${previewDoc.id}`}
                className="w-full h-full border-0"
                title={`Preview: ${previewDoc.title}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
