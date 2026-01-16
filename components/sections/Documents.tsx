"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS SECTION COMPONENT
// Sección de documentos y formatos descargables
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DynamicIcon } from "@/lib/icons";
import type { DocumentsConfig, DocumentType, DocumentCategory } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useState, useMemo } from "react";

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
  const { badge, title, subtitle, items, categories, showSearch } = config;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");

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
        <StaggerContainer className="grid gap-4 max-w-4xl mx-auto" staggerDelay={0.05}>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron documentos
            </div>
          ) : (
            filteredItems.map((doc) => {
              const fileStyle = fileTypeIcons[doc.fileType];

              return (
                <StaggerItem key={doc.id}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="group hover:border-primary/20 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* File Icon */}
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted",
                            "group-hover:bg-primary/10 transition-colors"
                          )}>
                            <DynamicIcon
                              name={fileStyle.icon}
                              size={24}
                              className={fileStyle.color}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                  {doc.title}
                                </h3>
                                {doc.description && (
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {doc.description}
                                  </p>
                                )}
                              </div>

                              {/* Download Button with Tooltip */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                      className="shrink-0"
                                    >
                                      <Link href={doc.fileUrl} target="_blank" download>
                                        <DynamicIcon name="Download" size={18} />
                                        <span className="ml-2 hidden sm:inline">Descargar</span>
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Descargar {doc.fileType.toUpperCase()} {doc.fileSize && `(${doc.fileSize})`}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            {/* Meta info */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[doc.category]}
                              </Badge>
                              {doc.fileSize && (
                                <span>{doc.fileSize}</span>
                              )}
                              {doc.updatedAt && (
                                <span>Actualizado: {formatDate(doc.updatedAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })
          )}
        </StaggerContainer>
      </div>
    </section>
  );
}
