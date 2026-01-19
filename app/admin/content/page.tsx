"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT SECTIONS PAGE
// Lista de secciones editables del landing
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import {
  Sparkles,
  Building2,
  Users,
  FlaskConical,
  Calendar,
  HelpCircle,
  FileText,
  ArrowRight,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    id: "hero",
    title: "Hero",
    description: "Sección principal con título, descripción y CTA",
    icon: Sparkles,
    fields: ["Título", "Descripción", "Botones CTA", "Imagen de fondo"],
    lastUpdated: "Hace 2 días",
  },
  {
    id: "research",
    title: "Investigación",
    description: "Líneas de investigación y proyectos destacados",
    icon: FlaskConical,
    fields: ["Título", "Descripción", "Líneas de investigación"],
    lastUpdated: "Hace 1 semana",
  },
  {
    id: "offices",
    title: "Sedes",
    description: "Información de las sedes y oficinas",
    icon: Building2,
    fields: ["Título", "Descripción", "Lista de sedes"],
    lastUpdated: "Hace 3 días",
  },
  {
    id: "authorities",
    title: "Autoridades",
    description: "Equipo directivo y autoridades de la institución",
    icon: Users,
    fields: ["Título", "Descripción", "Lista de autoridades"],
    lastUpdated: "Hace 1 mes",
  },
  {
    id: "calendar",
    title: "Calendario",
    description: "Eventos y fechas importantes",
    icon: Calendar,
    fields: ["Título", "Descripción", "Eventos"],
    lastUpdated: "Hace 5 días",
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Preguntas frecuentes",
    icon: HelpCircle,
    fields: ["Título", "Lista de preguntas/respuestas"],
    lastUpdated: "Hace 2 semanas",
  },
  {
    id: "footer",
    title: "Footer",
    description: "Pie de página con enlaces y contacto",
    icon: FileText,
    fields: ["Logo", "Descripción", "Enlaces", "Redes sociales", "Contacto"],
    lastUpdated: "Hace 1 mes",
  },
];

export default function ContentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contenido del Landing</h1>
        <p className="text-muted-foreground">
          Edita el contenido de cada sección del landing page
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Edición de contenido</p>
            <p className="text-sm text-muted-foreground">
              Los cambios se reflejarán inmediatamente en el landing público
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card
            key={section.id}
            className="group hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {section.lastUpdated}
                </Badge>
              </div>
              <CardTitle className="mt-4">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {section.fields.map((field) => (
                    <Badge key={field} variant="secondary" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link href={`/admin/content/${section.id}`}>
                    Editar sección
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
