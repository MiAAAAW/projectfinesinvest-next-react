"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR SECTION COMPONENT
// Sección de calendario de eventos académicos
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/lib/icons";
import type { CalendarConfig, CalendarEventType } from "@/types/landing.types";
import { motion } from "framer-motion";
import { MotionWrapper, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";
import { useMemo } from "react";

interface CalendarProps {
  config: CalendarConfig;
  className?: string;
}

// Estilos por tipo de evento
const eventTypeStyles: Record<CalendarEventType, { color: string; bg: string; icon: string; label: string }> = {
  academico: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: "GraduationCap", label: "Académico" },
  investigacion: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", icon: "FlaskConical", label: "Investigación" },
  administrativo: { color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30", icon: "Building2", label: "Administrativo" },
  social: { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: "Users", label: "Social" },
  deadline: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", icon: "AlertCircle", label: "Fecha límite" },
};

function formatDate(dateStr: string): { day: string; month: string; year: string } {
  const date = new Date(dateStr);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleDateString("es-PE", { month: "short" }).toUpperCase(),
    year: date.getFullYear().toString(),
  };
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateRange(startDate: string, endDate?: string): string {
  if (!endDate) return formatFullDate(startDate);

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} de ${start.toLocaleDateString("es-PE", { month: "long", year: "numeric" })}`;
  }

  return `${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
}

export default function Calendar({ config, className }: CalendarProps) {
  const { badge, title, subtitle, items, groupByMonth } = config;

  // Agrupar eventos por mes si es necesario
  const groupedEvents = useMemo(() => {
    if (!groupByMonth) return null;

    const groups: Record<string, typeof items> = {};

    items.forEach((event) => {
      const date = new Date(event.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = date.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });

    return Object.entries(groups).map(([key, events]) => ({
      key,
      label: new Date(events[0].date).toLocaleDateString("es-PE", { month: "long", year: "numeric" }),
      events,
    }));
  }, [items, groupByMonth]);

  const renderEvent = (event: typeof items[0], index: number) => {
    const dateInfo = formatDate(event.date);
    const typeStyle = eventTypeStyles[event.type];

    return (
      <StaggerItem key={event.id}>
        <motion.div
          whileHover={{ x: 8 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={cn(
            "group overflow-hidden border-l-4 hover:shadow-lg transition-all",
            event.important ? "border-l-primary" : "border-l-transparent hover:border-l-primary/50"
          )}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Date box */}
                <div className="shrink-0 w-16 text-center">
                  <div className={cn(
                    "rounded-lg p-2",
                    event.important ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <div className="text-2xl font-bold">{dateInfo.day}</div>
                    <div className="text-xs uppercase">{dateInfo.month}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-2">
                    <Badge variant="outline" className={cn("text-xs", typeStyle.color)}>
                      <DynamicIcon name={typeStyle.icon} size={12} className="mr-1" />
                      {typeStyle.label}
                    </Badge>
                    {event.important && (
                      <Badge variant="default" className="text-xs">
                        Importante
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {/* Date range */}
                    <div className="flex items-center gap-1">
                      <DynamicIcon name="Calendar" size={14} />
                      <span>{formatDateRange(event.date, event.endDate)}</span>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <DynamicIcon name="MapPin" size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </StaggerItem>
    );
  };

  return (
    <section
      id="calendar"
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

        {/* Events */}
        <div className="max-w-3xl mx-auto">
          {groupByMonth && groupedEvents ? (
            // Grouped by month
            groupedEvents.map((group) => (
              <div key={group.key} className="mb-8">
                <MotionWrapper>
                  <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                    <DynamicIcon name="Calendar" size={20} className="text-primary" />
                    {group.label}
                  </h3>
                </MotionWrapper>
                <StaggerContainer className="space-y-4" staggerDelay={0.08}>
                  {group.events.map((event, index) => renderEvent(event, index))}
                </StaggerContainer>
              </div>
            ))
          ) : (
            // Flat list
            <StaggerContainer className="space-y-4" staggerDelay={0.08}>
              {items.map((event, index) => renderEvent(event, index))}
            </StaggerContainer>
          )}
        </div>
      </div>
    </section>
  );
}
