"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHORITIES SECTION COMPONENT
// Autoridades y equipo de la Dirección de Investigación
// CONECTADO A BASE DE DATOS via /api/authorities
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DynamicIcon } from "@/lib/icons";
import type { AuthoritiesConfig } from "@/types/landing.types";
import Link from "next/link";
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

  // Mapear datos de BD al formato del componente
  const members = useMemo(() =>
    dbAuthorities.map(authority => ({
      id: authority.id,
      name: authority.name,
      role: authority.role,
      department: authority.department || undefined,
      avatar: authority.avatarUrl ? `/api/authorities/image/${authority.id}` : undefined,
      bio: authority.bio || undefined,
      email: authority.email || undefined,
      phone: authority.phone || undefined,
      officeHours: authority.officeHours || undefined,
      social: {
        linkedin: authority.linkedin || undefined,
        orcid: authority.orcid || undefined,
        googleScholar: authority.googleScholar || undefined,
      },
    }))
  , [dbAuthorities]);

  // Grid dinámico basado en cantidad de miembros
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
      <section id="authorities" className={cn("relative py-24 md:py-32 overflow-hidden", className)}>
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
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card className="group h-full overflow-hidden border border-border/50 bg-card shadow-professional-card hover:border-primary/30 hover:shadow-professional-lg transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Avatar - shadcn */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                          <AvatarImage
                            src={member.avatar}
                            alt={member.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-primary/10 text-primary">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Status indicator */}
                        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-primary font-medium">
                        {member.role}
                      </p>
                      {member.department && (
                        <p className="text-sm text-muted-foreground">
                          {member.department}
                        </p>
                      )}
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="mt-4 text-sm text-muted-foreground text-center leading-relaxed">
                        {member.bio}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="mt-6 space-y-2">
                      {member.email && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <DynamicIcon name="Mail" size={16} className="text-muted-foreground" />
                          <Link
                            href={`mailto:${member.email}`}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {member.email}
                          </Link>
                        </div>
                      )}
                      {member.officeHours && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <DynamicIcon name="Clock" size={16} />
                          <span>{member.officeHours}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Links with Tooltips */}
                    {member.social && (member.social.linkedin || member.social.orcid || member.social.googleScholar) && (
                      <TooltipProvider>
                        <div className="flex justify-center gap-2 mt-6">
                          {member.social.orcid && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                                  <Link href={member.social.orcid} target="_blank" rel="noopener noreferrer">
                                    <DynamicIcon name="ExternalLink" size={18} />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>ORCID</TooltipContent>
                            </Tooltip>
                          )}
                          {member.social.googleScholar && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                                  <Link href={member.social.googleScholar} target="_blank" rel="noopener noreferrer">
                                    <DynamicIcon name="GraduationCap" size={18} />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Google Scholar</TooltipContent>
                            </Tooltip>
                          )}
                          {member.social.linkedin && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                                  <Link href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                                    <DynamicIcon name="Linkedin" size={18} />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>LinkedIn</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
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
