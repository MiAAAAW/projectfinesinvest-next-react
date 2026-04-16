"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR SECTION · landing (v2 · Swiss-minimal)
//
// Principios (inspirado en Notion Calendar / Cron):
//   - Tipografía + color por tipo comunican el evento; cero decoración gráfica
//     en las celdas.
//   - Rango multi-día = banda continua de fondo (estilo Gantt), sin repetir
//     indicadores celda-por-celda.
//   - Motion con propósito: direction-aware transitions entre meses, hover lift,
//     halo latente en días importantes. Sin loops decorativos.
//   - Detail panel conserva íconos: ahí aportan información con espacio.
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/lib/icons";
import type { CalendarConfig, CalendarEventItem } from "@/types/landing.types";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CALENDAR_TYPE_LABELS } from "@/lib/constants/calendar";

interface CalendarProps {
  config: CalendarConfig;
  className?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Type styling · 5 tipos canónicos. Admin elige tipo, look se deriva.
// ──────────────────────────────────────────────────────────────────────────
type CanonicalType =
  | "academico"
  | "investigacion"
  | "administrativo"
  | "social"
  | "deadline";

interface TypeStyle {
  text: string;        // color del número del día
  iconText: string;    // color del glifo · SHADE MÁS BRILLANTE que el bg-tint para contraste
  iconGlow: string;    // drop-shadow sutil color-matched para que el ícono "flote"
  bgTint: string;      // background muy sutil para días del tipo
  accent: string;      // color sólido (usos varios)
  haloShadow: string;  // box-shadow color-matched para importantes
  ring: string;        // ring tailwind class para hover sutil
  badge: string;       // badge en el panel detail
  icon: string;        // icono lucide
  label: string;       // label humano
}

const TYPE_STYLES: Record<CanonicalType, TypeStyle> = {
  academico: {
    text: "text-sky-500 dark:text-sky-400",
    iconText: "text-sky-600 dark:text-sky-200",
    iconGlow: "drop-shadow(0 0 3px rgba(14,165,233,0.55))",
    bgTint: "bg-sky-500/[0.09] dark:bg-sky-400/[0.08]",
    accent: "bg-sky-500 dark:bg-sky-400",
    haloShadow: "0 0 0 2px rgba(14,165,233,0.25)",
    ring: "ring-sky-500/40",
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    icon: "GraduationCap",
    label: "Académico",
  },
  investigacion: {
    text: "text-violet-500 dark:text-violet-400",
    iconText: "text-violet-600 dark:text-violet-200",
    iconGlow: "drop-shadow(0 0 3px rgba(139,92,246,0.55))",
    bgTint: "bg-violet-500/[0.09] dark:bg-violet-400/[0.08]",
    accent: "bg-violet-500 dark:bg-violet-400",
    haloShadow: "0 0 0 2px rgba(139,92,246,0.25)",
    ring: "ring-violet-500/40",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    icon: "FlaskConical",
    label: "Investigación",
  },
  administrativo: {
    text: "text-slate-500 dark:text-slate-300",
    iconText: "text-slate-700 dark:text-slate-100",
    iconGlow: "drop-shadow(0 0 3px rgba(148,163,184,0.5))",
    bgTint: "bg-slate-500/[0.08] dark:bg-slate-300/[0.07]",
    accent: "bg-slate-500 dark:bg-slate-300",
    haloShadow: "0 0 0 2px rgba(148,163,184,0.25)",
    ring: "ring-slate-400/40",
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    icon: "Building2",
    label: "Administrativo",
  },
  social: {
    text: "text-emerald-500 dark:text-emerald-400",
    iconText: "text-emerald-600 dark:text-emerald-200",
    iconGlow: "drop-shadow(0 0 3px rgba(16,185,129,0.55))",
    bgTint: "bg-emerald-500/[0.09] dark:bg-emerald-400/[0.08]",
    accent: "bg-emerald-500 dark:bg-emerald-400",
    haloShadow: "0 0 0 2px rgba(16,185,129,0.25)",
    ring: "ring-emerald-500/40",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: "Users",
    label: "Social",
  },
  deadline: {
    text: "text-rose-500 dark:text-rose-400",
    iconText: "text-rose-600 dark:text-rose-200",
    iconGlow: "drop-shadow(0 0 3px rgba(244,63,94,0.6))",
    bgTint: "bg-rose-500/[0.09] dark:bg-rose-400/[0.08]",
    accent: "bg-rose-500 dark:bg-rose-400",
    haloShadow: "0 0 0 2px rgba(244,63,94,0.3)",
    ring: "ring-rose-500/40",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: "Clock",
    label: "Fecha límite",
  },
};

// Motion distinto por tipo para el glifo bajo el número.
// Cada tipo tiene su "carácter" de movimiento — loops suaves, no distraen.
const TYPE_MOTION: Record<
  CanonicalType,
  { animate: Record<string, number[] | number>; duration: number; ease: string }
> = {
  academico:      { animate: { rotate: [0, -18, 0, 18, 0] }, duration: 3.0, ease: "easeInOut" },
  investigacion:  { animate: { rotate: [0, -24, 0, 24, 0] }, duration: 3.4, ease: "easeInOut" },
  administrativo: { animate: { scale:  [1, 1.22, 1]        }, duration: 2.6, ease: "easeInOut" },
  social:         { animate: { y:      [0, -2, 0, 2, 0]    }, duration: 1.8, ease: "easeInOut" },
  deadline:       { animate: { rotate: 360                  }, duration: 8,   ease: "linear" },
};

function styleForType(type: string): TypeStyle {
  if ((TYPE_STYLES as Record<string, TypeStyle>)[type]) {
    return TYPE_STYLES[type as CanonicalType];
  }
  const label =
    CALENDAR_TYPE_LABELS[type]?.label ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    text: "text-primary",
    iconText: "text-primary",
    iconGlow: "drop-shadow(0 0 3px rgba(99,102,241,0.55))",
    bgTint: "bg-primary/[0.08]",
    accent: "bg-primary",
    haloShadow: "0 0 0 2px rgba(99,102,241,0.25)",
    ring: "ring-primary/40",
    badge: "bg-primary/10 text-primary border-primary/20",
    icon: "Calendar",
    label,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Date helpers (locale es-PE, semana inicia lunes)
// ──────────────────────────────────────────────────────────────────────────
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"] as const;
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function parseISODate(iso: string): Date {
  return new Date(`${iso.split("T")[0]}T00:00:00`);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type RangePosition = "single" | "start" | "middle" | "end";

function rangePosition(event: CalendarEventItem, day: Date): RangePosition {
  const start = parseISODate(event.date);
  const end = event.endDate ? parseISODate(event.endDate) : start;
  if (sameDay(start, end)) return "single";
  if (sameDay(day, start)) return "start";
  if (sameDay(day, end)) return "end";
  return "middle";
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRange(event: CalendarEventItem): string {
  const start = parseISODate(event.date);
  if (!event.endDate) return formatFullDate(start);
  const end = parseISODate(event.endDate);
  if (sameDay(start, end)) return formatFullDate(start);
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()} – ${end.getDate()} de ${MONTH_NAMES[start.getMonth()]} de ${start.getFullYear()}`;
  }
  return `${formatFullDate(start)} — ${formatFullDate(end)}`;
}

function buildMonthGrid(viewMonth: Date): Date[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const offset = (firstOfMonth.getDay() + 6) % 7; // Lunes=0 … Domingo=6
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ──────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────

export default function Calendar({ config, className }: CalendarProps) {
  const { badge, title, subtitle } = config;
  const [items, setItems] = useState<CalendarEventItem[]>(config.items ?? []);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const directionRef = useRef<1 | -1>(1); // 1 = siguiente, -1 = anterior
  const reduceMotion = useReducedMotion();

  // Fetch eventos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/calendar?status=published&limit=100", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && res.ok && Array.isArray(json.data)) {
          const apiItems: CalendarEventItem[] = json.data.map(
            (e: {
              id: string;
              title: string;
              date: string;
              endDate: string | null;
              type: string;
              description: string | null;
              location: string | null;
              href: string | null;
              important: boolean;
            }) => ({
              id: e.id,
              title: e.title,
              date: e.date,
              endDate: e.endDate ?? undefined,
              type: e.type as CalendarEventItem["type"],
              description: e.description ?? undefined,
              location: e.location ?? undefined,
              href: e.href ?? undefined,
              important: !!e.important,
            }),
          );
          setItems(apiItems);
        }
      } catch (err) {
        console.error("Error fetching calendar events:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Posiciona el mes inicial en el evento más próximo a hoy
  useEffect(() => {
    if (items.length === 0) return;
    const now = Date.now();
    const upcoming = items
      .map((e) => parseISODate(e.date))
      .filter((d) => d.getTime() >= now - 24 * 3600 * 1000)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    const target = upcoming ?? parseISODate(items[0].date);
    setViewMonth(new Date(target.getFullYear(), target.getMonth(), 1));
  }, [items]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    for (const ev of items) {
      const start = parseISODate(ev.date);
      const end = ev.endDate ? parseISODate(ev.endDate) : start;
      const cursor = new Date(start);
      while (cursor.getTime() <= end.getTime()) {
        const key = cursor.toISOString().slice(0, 10);
        const arr = map.get(key) ?? [];
        arr.push(ev);
        map.set(key, arr);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return map;
  }, [items]);

  const gridDays = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);
  const todayISO = new Date().toISOString().slice(0, 10);
  const viewMonthIndex = viewMonth.getMonth();
  const currentMonthKey = monthKey(viewMonth);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.toISOString().slice(0, 10);
    return eventsByDay.get(key) ?? [];
  }, [selectedDate, eventsByDay]);

  const goPrev = useCallback(() => {
    directionRef.current = -1;
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);
  const goNext = useCallback(() => {
    directionRef.current = 1;
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const handleDayClick = (day: Date) => {
    const key = day.toISOString().slice(0, 10);
    if (!eventsByDay.has(key)) return;
    setSelectedDate(day);
    if (day.getMonth() !== viewMonth.getMonth()) {
      directionRef.current = day.getTime() > viewMonth.getTime() ? 1 : -1;
      setViewMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  const handleBack = () => setSelectedDate(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedDate) {
        setSelectedDate(null);
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (active && /INPUT|TEXTAREA|SELECT/.test(active.tagName)) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedDate, goPrev, goNext]);

  const isDetail = !!selectedDate;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <section
      id="calendar"
      className={cn(
        "relative py-16 md:py-20 overflow-hidden scroll-mt-[68px]",
        className,
      )}
    >
      <div className="container relative px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
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
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            </MotionWrapper>
          )}
        </div>

        {/*
          min-h solo en desktop (md+): evita layout shift al toggle overview↔detail
          cuando el panel se muestra al lado. En mobile el detail apila debajo,
          así que el min-h sería espacio muerto.
        */}
        <div className="mx-auto max-w-4xl md:min-h-[520px]">
          {loading ? (
            <CalendarSkeleton />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <LayoutGroup>
              <motion.div
                layout
                className={cn(
                  "flex gap-6",
                  isDetail
                    ? "flex-col md:flex-row md:items-start"
                    : "flex-col items-center",
                )}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 280, damping: 32 }
                }
              >
                <motion.div
                  layout
                  className={cn(
                    "w-full rounded-2xl border border-border/60 bg-card/60 p-4 md:p-5",
                    "shadow-professional-card backdrop-blur-sm overflow-hidden",
                    isDetail ? "md:w-[360px] md:shrink-0" : "max-w-md",
                  )}
                >
                  <MonthNav
                    label={`${MONTH_NAMES[viewMonthIndex]} ${viewMonth.getFullYear()}`}
                    onPrev={goPrev}
                    onNext={goNext}
                  />
                  <WeekdayHeader />

                  <div className="relative">
                    <AnimatePresence
                      mode="wait"
                      initial={false}
                      custom={directionRef.current}
                    >
                      <motion.div
                        key={currentMonthKey}
                        custom={directionRef.current}
                        variants={gridVariants}
                        initial={reduceMotion ? false : "enter"}
                        animate="center"
                        exit={reduceMotion ? undefined : "exit"}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <DayGrid
                          days={gridDays}
                          viewMonthIndex={viewMonthIndex}
                          todayISO={todayISO}
                          selectedDate={selectedDate}
                          eventsByDay={eventsByDay}
                          onDayClick={handleDayClick}
                          reduceMotion={!!reduceMotion}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {!isDetail && (
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Toca un día marcado para ver el evento.
                    </p>
                  )}
                </motion.div>

                <AnimatePresence mode="wait">
                  {isDetail && selectedDate && (
                    <motion.div
                      key={selectedDate.toISOString()}
                      layout
                      initial={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, x: 24, scale: 0.98 }
                      }
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, x: 24, scale: 0.98 }
                      }
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-1 min-w-0 w-full"
                    >
                      <DetailPanel
                        date={selectedDate}
                        events={selectedEvents}
                        onBack={handleBack}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          )}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Direction-aware variants para la transición entre meses
// ──────────────────────────────────────────────────────────────────────────
const gridVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir * -28, opacity: 0 }),
};

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function MonthNav({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-1 pb-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Mes anterior"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <DynamicIcon name="ChevronLeft" size={16} />
      </button>
      <div className="text-sm font-semibold capitalize tracking-tight">
        {label}
      </div>
      <button
        type="button"
        onClick={onNext}
        aria-label="Mes siguiente"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <DynamicIcon name="ChevronRight" size={16} />
      </button>
    </div>
  );
}

function WeekdayHeader() {
  return (
    <div className="grid grid-cols-7 gap-0 pb-2 px-0.5">
      {WEEKDAYS.map((d, i) => (
        <div
          key={i}
          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground text-center"
        >
          {d}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DayGrid · grilla de 42 celdas
//
// La celda es un wrapper que recibe el `bgTint` del evento dominante cuando es
// día de rango. El borde se redondea solo en los extremos del rango (start/end)
// para formar una banda continua. El botón interno tiene su propio hit-area.
// ──────────────────────────────────────────────────────────────────────────

function DayGrid({
  days,
  viewMonthIndex,
  todayISO,
  selectedDate,
  eventsByDay,
  onDayClick,
  reduceMotion,
}: {
  days: Date[];
  viewMonthIndex: number;
  todayISO: string;
  selectedDate: Date | null;
  eventsByDay: Map<string, CalendarEventItem[]>;
  onDayClick: (d: Date) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="grid grid-cols-7 gap-0">
      {days.map((day) => {
        const iso = day.toISOString().slice(0, 10);
        const dayEvents = eventsByDay.get(iso) ?? [];
        const hasEvents = dayEvents.length > 0;
        const hasImportant = dayEvents.some((e) => e.important);
        const isOutside = day.getMonth() !== viewMonthIndex;
        const isToday = iso === todayISO;
        const isSelected = selectedDate ? sameDay(day, selectedDate) : false;

        // Evento dominante (importante primero) para derivar color de la celda
        const sorted = [...dayEvents].sort(
          (a, b) => Number(!!b.important) - Number(!!a.important),
        );
        const dominant = sorted[0] ?? null;
        const dominantStyle = dominant ? styleForType(dominant.type) : null;

        // Info de rango respecto al evento dominante (para tint + bordes)
        const dominantPos: RangePosition | null =
          dominant && (dominant.endDate ?? null) !== null && !sameDay(parseISODate(dominant.date), parseISODate(dominant.endDate as string))
            ? rangePosition(dominant, day)
            : dominant
              ? "single"
              : null;

        // Todos los días con evento reciben tint; la forma (chip vs banda)
        // se controla sólo con las esquinas redondeadas según la posición.
        const hasTint = dominantPos != null && !isSelected;

        return (
          <div
            key={iso}
            className={cn(
              "p-0.5 transition-colors",
              hasTint && dominantStyle?.bgTint,
              dominantPos === "single" && "rounded-lg",
              dominantPos === "start" && "rounded-l-lg",
              dominantPos === "end" && "rounded-r-lg",
              // "middle" queda sin rounded (banda continua)
            )}
          >
            <DayCell
              day={day}
              iso={iso}
              dayEvents={dayEvents}
              hasEvents={hasEvents}
              hasImportant={hasImportant}
              isOutside={isOutside}
              isToday={isToday}
              isSelected={isSelected}
              dominantStyle={dominantStyle}
              onClick={() => onDayClick(day)}
              reduceMotion={reduceMotion}
            />
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DayCell · celda individual. Todo el lenguaje visual es tipográfico:
//   - Número con color del tipo dominante cuando hay evento
//   - Accent line 2px al pie (solo día single o start de rango)
//   - Mini contador (+N) si hay múltiples eventos ese día
//   - Ring con pulse gentil si hay evento importante (motion con propósito)
// ──────────────────────────────────────────────────────────────────────────

function DayCell({
  day,
  iso,
  dayEvents,
  hasEvents,
  hasImportant,
  isOutside,
  isToday,
  isSelected,
  dominantStyle,
  onClick,
  reduceMotion,
}: {
  day: Date;
  iso: string;
  dayEvents: CalendarEventItem[];
  hasEvents: boolean;
  hasImportant: boolean;
  isOutside: boolean;
  isToday: boolean;
  isSelected: boolean;
  dominantStyle: TypeStyle | null;
  onClick: () => void;
  reduceMotion: boolean;
}) {
  // Tipos únicos presentes ese día, priorizando importantes y el dominante.
  // Se muestran hasta 2 glifos tiny bajo el número — uno por tipo distinto.
  const uniqueTypes: CanonicalType[] = useMemo(() => {
    const seen = new Set<CanonicalType>();
    const list: CanonicalType[] = [];
    const sorted = [...dayEvents].sort(
      (a, b) => Number(!!b.important) - Number(!!a.important),
    );
    for (const ev of sorted) {
      const key = (
        (TYPE_STYLES as Record<string, TypeStyle>)[ev.type]
          ? ev.type
          : null
      ) as CanonicalType | null;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      list.push(key);
      if (list.length >= 2) break;
    }
    return list;
  }, [dayEvents]);

  return (
    <motion.button
      type="button"
      disabled={!hasEvents}
      onClick={onClick}
      whileHover={hasEvents && !reduceMotion ? { scale: 1.05 } : undefined}
      whileTap={hasEvents && !reduceMotion ? { scale: 0.97 } : undefined}
      animate={
        hasImportant && !isSelected && !reduceMotion
          ? {
              boxShadow: [
                "0 0 0 0 rgba(0,0,0,0)",
                dominantStyle?.haloShadow ?? "0 0 0 2px rgba(99,102,241,0.25)",
                "0 0 0 0 rgba(0,0,0,0)",
              ],
            }
          : undefined
      }
      transition={
        hasImportant && !isSelected && !reduceMotion
          ? {
              boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              scale: { type: "spring", stiffness: 420, damping: 24 },
            }
          : { type: "spring", stiffness: 420, damping: 24 }
      }
      aria-label={
        hasEvents
          ? `${formatFullDate(day)} · ${dayEvents.length} evento${dayEvents.length > 1 ? "s" : ""}`
          : formatFullDate(day)
      }
      aria-pressed={isSelected}
      className={cn(
        "relative w-full aspect-square rounded-md flex flex-col items-center justify-center",
        "outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-primary/60",
        isOutside && "opacity-35",
        !hasEvents && "cursor-default text-muted-foreground/70",
        hasEvents && !isSelected && "cursor-pointer hover:bg-foreground/[0.04]",
        isSelected && "bg-primary text-primary-foreground",
        isToday && !isSelected && "ring-1 ring-border",
      )}
    >
      <span
        className={cn(
          "text-sm tabular-nums leading-none transition-colors",
          hasEvents && "-mt-[6px]",
          isSelected
            ? "font-semibold"
            : hasEvents
              ? cn("font-semibold", dominantStyle?.text)
              : "font-normal",
        )}
        data-iso={iso}
      >
        {day.getDate()}
      </span>

      {/* Glifos · uno por tipo único presente ese día, motion propia por tipo */}
      {hasEvents && uniqueTypes.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[5px] flex items-center gap-[3px]">
          {uniqueTypes.map((t, i) => (
            <TypeGlyph
              key={t}
              type={t}
              isSelected={isSelected}
              reduceMotion={reduceMotion}
              stagger={i * 0.35}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// TypeGlyph · ícono tiny (10px) con movimiento propio por tipo.
//   academico      → tilt suave
//   investigacion  → sway como tubo de ensayo
//   administrativo → scale breathe
//   social         → bob vertical corto
//   deadline       → rotación continua tipo reloj
// ──────────────────────────────────────────────────────────────────────────

function TypeGlyph({
  type,
  isSelected,
  reduceMotion,
  stagger,
}: {
  type: CanonicalType;
  isSelected: boolean;
  reduceMotion: boolean;
  stagger: number;
}) {
  const style = TYPE_STYLES[type];
  const motionCfg = TYPE_MOTION[type];

  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center",
        isSelected ? "text-primary-foreground/90" : style.iconText,
      )}
      style={{
        transformOrigin: "center",
        filter: isSelected ? undefined : style.iconGlow,
      }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
      animate={
        reduceMotion
          ? { opacity: 1, scale: 1 }
          : {
              opacity: 1,
              scale: 1,
              ...motionCfg.animate,
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              opacity: { duration: 0.25, delay: stagger },
              scale: { duration: 0.25, delay: stagger },
              // Se re-aplica a la prop que corresponde al tipo (rotate/scale/y)
              ...(Object.keys(motionCfg.animate)[0] === "rotate"
                ? {
                    rotate: {
                      duration: motionCfg.duration,
                      repeat: Infinity,
                      ease: motionCfg.ease as "linear" | "easeInOut",
                      delay: stagger,
                    },
                  }
                : Object.keys(motionCfg.animate)[0] === "scale"
                  ? {
                      scale: {
                        duration: motionCfg.duration,
                        repeat: Infinity,
                        ease: motionCfg.ease as "easeInOut",
                        delay: stagger + 0.3,
                      },
                    }
                  : {
                      y: {
                        duration: motionCfg.duration,
                        repeat: Infinity,
                        ease: motionCfg.ease as "easeInOut",
                        delay: stagger,
                      },
                    }),
            }
      }
    >
      <DynamicIcon name={style.icon} size={10} className="[&>path]:stroke-[2.4]" />
    </motion.span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DetailPanel (sin cambios · íconos con espacio aportan info)
// ──────────────────────────────────────────────────────────────────────────

function DetailPanel({
  date,
  events,
  onBack,
}: {
  date: Date;
  events: CalendarEventItem[];
  onBack: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-professional-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onBack}
          className="h-8 -ml-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <DynamicIcon name="ArrowLeft" size={14} className="mr-1.5" />
          Volver al calendario
        </Button>
        <span className="text-xs font-semibold capitalize text-muted-foreground">
          {formatFullDate(date)}
        </span>
      </div>

      <div className="p-5 space-y-5 max-h-[440px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin eventos este día.
          </p>
        ) : (
          events.map((event) => <EventDetailCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}

function EventDetailCard({ event }: { event: CalendarEventItem }) {
  const type = styleForType(event.type);
  return (
    <article className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("text-xs border", type.badge)}>
          <DynamicIcon name={type.icon} size={12} className="mr-1" />
          {type.label}
        </Badge>
        {event.important && (
          <Badge variant="default" className="text-xs gap-1">
            <DynamicIcon name="Star" size={11} />
            Importante
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold leading-tight tracking-tight">
        {event.title}
      </h3>

      {event.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {event.description}
        </p>
      )}

      <dl className="grid gap-2 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-2">
          <DynamicIcon name="Calendar" size={13} className="text-primary/70" />
          <dd className="capitalize">{formatRange(event)}</dd>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <DynamicIcon name="MapPin" size={13} className="text-primary/70" />
            <dd>{event.location}</dd>
          </div>
        )}
      </dl>

      {event.href && (
        <a
          href={event.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-1"
        >
          Ver más detalles
          <DynamicIcon name="ExternalLink" size={11} />
        </a>
      )}
    </article>
  );
}

function CalendarSkeleton() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <div className="grid grid-cols-7 gap-0 pb-2 px-0.5">
        {WEEKDAYS.map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="p-0.5">
            <Skeleton className="aspect-square w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center backdrop-blur-sm">
      <DynamicIcon
        name="Calendar"
        size={48}
        className="mx-auto text-muted-foreground mb-4"
      />
      <p className="text-sm text-muted-foreground">No hay eventos programados</p>
    </div>
  );
}
