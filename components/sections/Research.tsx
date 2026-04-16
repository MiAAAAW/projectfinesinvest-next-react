"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH SECTION COMPONENT
// Líneas de Investigación de la facultad
// CONECTADO A BASE DE DATOS via /api/research
// Muestra coordinadores desde relación con Teachers
// Carousel powered by shadcn/ui + embla-carousel
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { DynamicIcon, ArrowRight } from "@/lib/icons";
import { Users, Sprout, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import type { ResearchConfig } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { useEffect, useState, useCallback } from "react";

// Tipo para docente en la lista
interface TeacherInfo {
  id: string;
  name: string;
  degree: string | null;
  avatarUrl: string | null;
  specialty: string | null;
  category: string | null;
  employmentType: string | null;
  role: string;
}

// Tipo para líneas de investigación de la BD
interface DBResearchLine {
  id: string;
  title: string;
  description: string;
  icon: string;
  coordinator: string | null;
  members: number | null;
  href: string | null;
  published: boolean;
  order: number;
  coordinatorTeacher?: TeacherInfo;
  teacherCount?: number;
  teachersList?: TeacherInfo[];
}

interface ResearchItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  coordinator?: string;
  coordinatorTeacher?: TeacherInfo;
  members?: number;
  href?: string;
  teachersList?: TeacherInfo[];
}

interface ResearchProps {
  config: ResearchConfig;
  className?: string;
}

// Sub-secciones de Investigación
const researchSubSections = [
  { label: "Grupos", href: "/investigacion/grupos", icon: Users },
  { label: "Semilleros", href: "/investigacion/semilleros", icon: Sprout },
  { label: "Publicaciones", href: "/investigacion/publicaciones", icon: BookOpen },
  { label: "Docentes", href: "/investigacion/docentes", icon: GraduationCap },
  { label: "Ética", href: "/investigacion/etica", icon: ShieldCheck },
];

function ResearchCard({
  line,
  index,
  onSelect,
  getInitials,
}: {
  line: ResearchItem;
  index: number;
  onSelect: (item: ResearchItem) => void;
  getInitials: (name: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="h-full py-2"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full"
      >
        <Card
          className={cn(
            "group relative h-full min-h-[240px] overflow-hidden cursor-pointer",
            "border border-border/50 bg-card shadow-professional-card",
            "transition-all duration-300",
            "hover:border-primary/30 hover:shadow-professional-lg"
          )}
          onClick={() => onSelect(line)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardHeader className="relative pb-1">
            <motion.div
              className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <DynamicIcon name={line.icon} size={20} />
            </motion.div>
            <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors duration-300 leading-tight">
              {line.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="relative space-y-2">
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {line.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {line.coordinatorTeacher ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Avatar className="h-5 w-5 shrink-0">
                    {line.coordinatorTeacher.avatarUrl ? (
                      <AvatarImage src={line.coordinatorTeacher.avatarUrl} alt={line.coordinatorTeacher.name} />
                    ) : null}
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                      {getInitials(line.coordinatorTeacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {line.coordinatorTeacher.name}
                  </span>
                </div>
              ) : line.coordinator && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <DynamicIcon name="User" size={14} />
                  <span className="truncate">{line.coordinator}</span>
                </div>
              )}
              {line.members && line.members > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <DynamicIcon name="Users" size={14} />
                  <span>{line.members} inv.</span>
                </div>
              )}
            </div>
          </CardContent>

          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function Research({ config, className }: ResearchProps) {
  const { badge, title, subtitle } = config;

  const [dbItems, setDbItems] = useState<DBResearchLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);

  // Carousel API from embla
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchResearchLines() {
      try {
        const res = await fetch("/api/research?status=published&limit=20&includeTeachers=true");
        if (res.ok) {
          const json = await res.json();
          setDbItems(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching research lines:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResearchLines();
  }, []);

  const items: ResearchItem[] = dbItems.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon,
    coordinator: item.coordinatorTeacher
      ? item.coordinatorTeacher.name
      : (item.coordinator || undefined),
    coordinatorTeacher: item.coordinatorTeacher,
    members: item.teacherCount || item.members || undefined,
    href: item.href || undefined,
    teachersList: item.teachersList,
  }));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Sync dots with embla carousel API
  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const useGrid = items.length <= 4;

  // Skeleton loading
  if (isLoading) {
    return (
      <section id="research" className={cn("relative pt-6 pb-10 md:pb-14 scroll-mt-[80px]", className)}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-1 mb-3">
            <div className="h-6 w-28 bg-muted animate-pulse rounded" />
            <div className="h-10 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[240px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section
      id="research"
      className={cn("relative pt-6 pb-10 md:pb-14 scroll-mt-[80px] min-h-[calc(100vh-80px)] flex flex-col justify-center", className)}
    >
      <div className="container relative px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-1 mb-3">
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
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </MotionWrapper>
          )}
        </div>

        {/* ── Cards: Grid (≤4) o Carousel (>4) ── */}
        <div className="max-w-6xl mx-auto">
          {useGrid ? (
            /* ── Grid layout para pocos items ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((line, index) => (
                <ResearchCard
                  key={line.id}
                  line={line}
                  index={index}
                  onSelect={setSelectedItem}
                  getInitials={getInitials}
                />
              ))}
            </div>
          ) : (
            /* ── Carousel para muchos items ── */
            <>
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: false,
                  slidesToScroll: 1,
                }}
                plugins={[
                  Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
                ]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {items.map((line, index) => (
                    <CarouselItem
                      key={line.id}
                      className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
                    >
                      <ResearchCard
                        line={line}
                        index={index}
                        onSelect={setSelectedItem}
                        getInitials={getInitials}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="hidden md:flex -left-4 h-10 w-10 bg-background/90 backdrop-blur-sm border-border/50 shadow-md hover:border-primary/30" />
                <CarouselNext className="hidden md:flex -right-4 h-10 w-10 bg-background/90 backdrop-blur-sm border-border/50 shadow-md hover:border-primary/30" />
              </Carousel>

              {count > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {Array.from({ length: count }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => api?.scrollTo(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === current ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                      aria-label={`Ir a slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Sub-secciones de Investigación ── */}
        <MotionWrapper delay={0.4} className="mt-5">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-muted-foreground mb-2">Explora más sobre investigación</p>
            <div className="inline-flex flex-wrap justify-center gap-2.5">
              {researchSubSections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group/link flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                >
                  <section.icon className="h-4 w-4 text-muted-foreground group-hover/link:text-primary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover/link:text-foreground transition-colors">
                    {section.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </MotionWrapper>
      </div>

      {/* ── Modal de detalle ── */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          {selectedItem && (
            <>
              <DialogHeader className="shrink-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <DynamicIcon name={selectedItem.icon} size={24} />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold leading-tight">
                      {selectedItem.title}
                    </DialogTitle>
                    {selectedItem.members && selectedItem.members > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedItem.members} investigadores
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedItem.description}
                </p>

                {/* Lista de docentes */}
                {selectedItem.teachersList && selectedItem.teachersList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Docentes investigadores</h4>
                    <div className="space-y-1">
                      {selectedItem.teachersList.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="h-8 w-8 shrink-0">
                              {teacher.avatarUrl ? (
                                <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                              ) : null}
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {getInitials(teacher.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {teacher.name}
                              </p>
                              {teacher.category && (
                                <p className="text-xs text-muted-foreground">{teacher.category}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {teacher.employmentType && (
                              <Badge variant={teacher.employmentType === "N" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                                {teacher.employmentType === "N" ? "Nom." : "Cont."}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.href && (
                  <Button asChild className="w-full">
                    <Link href={selectedItem.href}>
                      Ver proyectos de esta línea
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
