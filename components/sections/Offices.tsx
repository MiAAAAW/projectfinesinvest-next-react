"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICES SECTION COMPONENT
// Sección de oficinas y contacto institucional
// CONECTADO A BASE DE DATOS via /api/offices
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/lib/icons";
import type { OfficesConfig } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useState, useEffect, useMemo } from "react";

// Tipo para oficinas de la BD
interface DBOffice {
  id: string;
  name: string;
  description: string | null;
  location: string;
  building: string | null;
  floor: string | null;
  phone: string | null;
  email: string | null;
  schedule: string | null; // JSON string
  responsible: string | null;
  icon: string;
  mapUrl: string | null;
  published: boolean;
  order: number;
}

interface ScheduleDay {
  day: string;
  hours: string;
}

interface OfficesProps {
  config: OfficesConfig;
  className?: string;
}

export default function Offices({ config, className }: OfficesProps) {
  const { badge, title, subtitle } = config;

  // Estado para oficinas de la BD
  const [dbOffices, setDbOffices] = useState<DBOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch oficinas de la API al montar
  useEffect(() => {
    async function fetchOffices() {
      try {
        const res = await fetch("/api/offices?status=published&limit=20");
        if (res.ok) {
          const json = await res.json();
          setDbOffices(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching offices:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffices();
  }, []);

  // Mapear datos de BD al formato del componente
  const offices = useMemo(() =>
    dbOffices.map(office => {
      // Parsear schedule JSON
      let scheduleData: { days: string; hours: string } | undefined;
      if (office.schedule) {
        try {
          const parsed: ScheduleDay[] = JSON.parse(office.schedule);
          if (parsed.length > 0) {
            // Combinar todos los horarios
            const days = parsed.map(s => s.day).join(", ");
            const hours = parsed.map(s => s.hours).join(" / ");
            scheduleData = { days, hours };
          }
        } catch {
          // Si falla el parse, ignorar
        }
      }

      return {
        id: office.id,
        name: office.name,
        description: office.description || undefined,
        location: office.floor ? `${office.floor}, ${office.location}` : office.location,
        phone: office.phone || undefined,
        email: office.email || undefined,
        schedule: scheduleData,
        responsible: office.responsible || undefined,
        icon: office.icon || "Building2",
        mapUrl: office.mapUrl || undefined,
      };
    })
  , [dbOffices]);

  // Grid dinámico basado en cantidad de oficinas
  const getGridClasses = (count: number) => {
    if (count === 1) {
      return "md:grid-cols-1 max-w-md";
    }
    if (count === 2) {
      return "md:grid-cols-2 max-w-2xl";
    }
    return "md:grid-cols-2 lg:grid-cols-3";
  };

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <section id="offices" className={cn("relative py-24 md:py-32 overflow-hidden", className)}>
        <div className="absolute inset-0 bg-background/10" />
        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            <div className="h-12 w-64 bg-muted animate-pulse rounded" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-6 max-w-5xl mx-auto md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay oficinas, no mostrar sección
  if (offices.length === 0) {
    return null;
  }

  return (
    <section
      id="offices"
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

        {/* Offices Grid - Layout dinámico */}
        <StaggerContainer
          className={cn(
            "grid gap-6 max-w-5xl mx-auto",
            getGridClasses(offices.length)
          )}
          staggerDelay={0.1}
        >
          {offices.map((office) => (
            <StaggerItem key={office.id}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card className="group h-full overflow-hidden border border-border/50 bg-card shadow-professional-card hover:border-primary/30 hover:shadow-professional-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    {/* Icon */}
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <DynamicIcon name={office.icon || "Building2"} size={24} />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {office.name}
                        </CardTitle>
                        {office.responsible && (
                          <p className="text-sm text-muted-foreground">
                            {office.responsible}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {office.description && (
                      <p className="text-sm text-muted-foreground">
                        {office.description}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-3 text-sm">
                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <DynamicIcon name="MapPin" size={18} className="shrink-0 mt-0.5 text-muted-foreground" />
                        <span>{office.location}</span>
                      </div>

                      {/* Schedule */}
                      {office.schedule && (
                        <div className="flex items-start gap-3">
                          <DynamicIcon name="Clock" size={18} className="shrink-0 mt-0.5 text-muted-foreground" />
                          <div>
                            <div>{office.schedule.days}</div>
                            <div className="text-muted-foreground">{office.schedule.hours}</div>
                          </div>
                        </div>
                      )}

                      {/* Phone */}
                      {office.phone && (
                        <div className="flex items-center gap-3">
                          <DynamicIcon name="Phone" size={18} className="shrink-0 text-muted-foreground" />
                          <Link
                            href={`tel:${office.phone.replace(/[^0-9+]/g, "")}`}
                            className="hover:text-primary transition-colors"
                          >
                            {office.phone}
                          </Link>
                        </div>
                      )}

                      {/* Email */}
                      {office.email && (
                        <div className="flex items-center gap-3">
                          <DynamicIcon name="Mail" size={18} className="shrink-0 text-muted-foreground" />
                          <Link
                            href={`mailto:${office.email}`}
                            className="hover:text-primary transition-colors break-all"
                          >
                            {office.email}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Map Button */}
                    {office.mapUrl && (
                      <Button asChild variant="outline" size="sm" className="w-full mt-4">
                        <Link href={office.mapUrl} target="_blank" rel="noopener noreferrer">
                          <DynamicIcon name="MapPin" size={16} className="mr-2" />
                          Ver en mapa
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
