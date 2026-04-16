"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHORITIES SECTION COMPONENT
// Autoridades y equipo de la Dirección de Investigación
// CONECTADO A BASE DE DATOS via /api/authorities
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuthoritiesConfig } from "@/types/landing.types";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useState, useEffect, useMemo } from "react";

// Tipo para autoridades de la BD
interface DBAuthority {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  officeHours: string | null;
  avatarUrl: string | null;
  linkedin: string | null;
  orcid: string | null;
  googleScholar: string | null;
  published: boolean;
  order: number;
}

// Obtener iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface AuthoritiesProps {
  config: AuthoritiesConfig;
  className?: string;
}

export default function Authorities({ config, className }: AuthoritiesProps) {
  const { badge, title, subtitle } = config;

  // Estado para autoridades de la BD
  const [dbAuthorities, setDbAuthorities] = useState<DBAuthority[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch autoridades de la API al montar
  useEffect(() => {
    async function fetchAuthorities() {
      try {
        const res = await fetch("/api/authorities?status=published&limit=20");
        if (res.ok) {
          const json = await res.json();
          setDbAuthorities(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching authorities:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAuthorities();
  }, []);

  // Mapear datos de BD al formato del componente (solo info pública no sensible)
  const members = useMemo(() =>
    dbAuthorities.map(authority => ({
      id: authority.id,
      name: authority.name,
      role: authority.role,
      department: authority.department || undefined,
      avatar: authority.avatarUrl ? `/api/authorities/image/${authority.id}` : undefined,
    }))
  , [dbAuthorities]);

  // Grid dinámico basado en cantidad de miembros
  const getGridClasses = (count: number) => {
    if (count === 1) {
      return "md:grid-cols-1 max-w-xs";
    }
    if (count === 2) {
      return "md:grid-cols-2 max-w-xl";
    }
    return "md:grid-cols-2 lg:grid-cols-3 max-w-4xl";
  };

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <section id="authorities" className={cn("relative py-16 md:py-20 overflow-hidden scroll-mt-[68px]", className)}>
        <div className="absolute inset-0 bg-background/10" />
        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            <div className="h-12 w-64 bg-muted animate-pulse rounded" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-8 max-w-5xl mx-auto md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay autoridades, no mostrar sección
  if (members.length === 0) {
    return null;
  }

  return (
    <section
      id="authorities"
      className={cn(
        "relative py-16 md:py-20 overflow-hidden scroll-mt-[68px]",
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

        {/* Authorities Grid - Layout dinámico */}
        <StaggerContainer
          className={cn(
            "grid gap-8 max-w-5xl mx-auto",
            getGridClasses(members.length)
          )}
          staggerDelay={0.15}
        >
          {members.map((member) => (
            <StaggerItem key={member.id}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <Card className="group relative h-full overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm shadow-professional-card hover:border-primary/40 hover:shadow-professional-lg transition-all duration-300">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-70 group-hover:opacity-100 transition-opacity" />

                  <CardContent className="p-5 flex flex-col items-center text-center">
                    {/* Avatar compacto */}
                    <div className="relative mb-4 mt-2">
                      <Avatar className="w-20 h-20 border-2 border-primary/15 group-hover:border-primary/40 transition-colors ring-2 ring-background">
                        <AvatarImage
                          src={member.avatar}
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Nombre */}
                    <h3 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>

                    {/* Cargo */}
                    <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-primary/90">
                      {member.role}
                    </p>

                    {/* Departamento */}
                    {member.department && (
                      <>
                        <div className="my-3 h-px w-10 bg-border/60" />
                        <p className="text-xs text-muted-foreground leading-snug">
                          {member.department}
                        </p>
                      </>
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
