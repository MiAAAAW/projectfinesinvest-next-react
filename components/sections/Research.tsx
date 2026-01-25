"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH SECTION COMPONENT
// Líneas de Investigación de la facultad
// CONECTADO A BASE DE DATOS via /api/research
// Muestra coordinadores desde relación con Teachers
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DynamicIcon, ArrowRight } from "@/lib/icons";
import type { ResearchConfig } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useEffect, useState } from "react";

// Tipo para coordinador
interface CoordinatorTeacher {
  id: string;
  name: string;
  degree: string | null;
  avatarUrl: string | null;
  specialty: string | null;
}

// Tipo para líneas de investigación de la BD
interface DBResearchLine {
  id: string;
  title: string;
  description: string;
  icon: string;
  coordinator: string | null; // legacy field
  members: number | null; // legacy field
  href: string | null;
  published: boolean;
  order: number;
  coordinatorTeacher?: CoordinatorTeacher;
  teacherCount?: number;
}

interface ResearchProps {
  config: ResearchConfig;
  className?: string;
}

export default function Research({ config, className }: ResearchProps) {
  const { badge, title, subtitle, columns = 3, showViewAll, viewAllHref, viewAllText } = config;

  // Estado para líneas de investigación de la BD
  const [dbItems, setDbItems] = useState<DBResearchLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch líneas de investigación de la API al montar (con teachers)
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

  // Usar datos de la BD - priorizar relación de teachers sobre campos legacy
  const items = dbItems.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon,
    // Usar coordinador desde teacher si existe, sino el legacy
    coordinator: item.coordinatorTeacher
      ? `${item.coordinatorTeacher.degree || ""} ${item.coordinatorTeacher.name}`.trim()
      : (item.coordinator || undefined),
    coordinatorTeacher: item.coordinatorTeacher,
    // Usar conteo de teachers si existe, sino el legacy
    members: item.teacherCount || item.members || undefined,
    href: item.href || undefined,
  }));

  // Helper para obtener iniciales
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <section id="research" className={cn("relative py-24 md:py-32", className)}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-12 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-6 max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay líneas, no mostrar la sección
  if (items.length === 0) {
    return null;
  }

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section
      id="research"
      className={cn(
        "relative py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background removed - unified with global animated-bg */}

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

        {/* Research Lines Grid */}
        <StaggerContainer className={cn("grid gap-6 max-w-6xl mx-auto", gridCols[columns])} staggerDelay={0.08}>
          {items.map((line) => (
            <StaggerItem key={line.id}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                <Card
                  className={cn(
                    "group relative h-full overflow-hidden",
                    "border border-border/50 bg-card shadow-professional-card",
                    "transition-all duration-300",
                    "hover:border-primary/30 hover:shadow-professional-lg"
                  )}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardHeader className="relative pb-2">
                    {/* Icon Container with animation */}
                    <motion.div
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <DynamicIcon name={line.icon} size={28} />
                    </motion.div>

                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                      {line.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {line.description}
                    </p>

                    {/* Coordinator & Members */}
                    <div className="space-y-2 text-sm">
                      {line.coordinatorTeacher ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Avatar className="h-6 w-6">
                            {line.coordinatorTeacher.avatarUrl ? (
                              <AvatarImage src={line.coordinatorTeacher.avatarUrl} alt={line.coordinatorTeacher.name} />
                            ) : null}
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {getInitials(line.coordinatorTeacher.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {line.coordinatorTeacher.degree && `${line.coordinatorTeacher.degree} `}
                            {line.coordinatorTeacher.name}
                          </span>
                        </div>
                      ) : line.coordinator && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DynamicIcon name="User" size={16} />
                          <span>Coordinador: {line.coordinator}</span>
                        </div>
                      )}
                      {line.members && line.members > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DynamicIcon name="Users" size={16} />
                          <span>{line.members} investigadores</span>
                        </div>
                      )}
                    </div>

                    {line.href && (
                      <Link
                        href={line.href}
                        className="mt-4 inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:underline"
                      >
                        Ver proyectos
                        <motion.span
                          className="ml-1"
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>
                    )}
                  </CardContent>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* View All Button */}
        {showViewAll && viewAllHref && (
          <MotionWrapper delay={0.4} className="flex justify-center mt-12">
            <Button asChild size="lg" variant="outline" className="group">
              <Link href={viewAllHref}>
                {viewAllText || "Ver todas las líneas de investigación"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </MotionWrapper>
        )}
      </div>
    </section>
  );
}
