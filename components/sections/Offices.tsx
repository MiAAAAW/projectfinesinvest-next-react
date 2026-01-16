"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICES SECTION COMPONENT
// Sección de oficinas y contacto institucional
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

interface OfficesProps {
  config: OfficesConfig;
  className?: string;
}

export default function Offices({ config, className }: OfficesProps) {
  const { badge, title, subtitle, items } = config;

  return (
    <section
      id="offices"
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

        {/* Offices Grid */}
        <StaggerContainer className="grid gap-6 max-w-5xl mx-auto md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
          {items.map((office) => (
            <StaggerItem key={office.id}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card className="group h-full overflow-hidden border bg-background/80 backdrop-blur-sm hover:border-primary/20 hover:shadow-xl transition-all duration-300">
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
