"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// GENERIC SECTION EDITOR
// Editor genérico para secciones del landing
// Conectado a API real con PostgreSQL via /api/content
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Building2,
  Users,
  FlaskConical,
  Calendar,
  HelpCircle,
  FileText,
} from "lucide-react";

// Configuración de cada sección
const sectionConfigs: Record<string, {
  title: string;
  description: string;
  icon: typeof Building2;
  fields: {
    name: string;
    label: string;
    type: "text" | "textarea";
    placeholder?: string;
  }[];
}> = {
  research: {
    title: "Investigación",
    description: "Líneas de investigación y proyectos",
    icon: FlaskConical,
    fields: [
      { name: "title", label: "Título de la sección", type: "text", placeholder: "Líneas de Investigación" },
      { name: "description", label: "Descripción", type: "textarea", placeholder: "Descripción de la sección..." },
    ],
  },
  offices: {
    title: "Sedes",
    description: "Información de las sedes y oficinas",
    icon: Building2,
    fields: [
      { name: "title", label: "Título de la sección", type: "text", placeholder: "Nuestras Sedes" },
      { name: "description", label: "Descripción", type: "textarea", placeholder: "Descripción de las sedes..." },
    ],
  },
  authorities: {
    title: "Autoridades",
    description: "Equipo directivo de la institución",
    icon: Users,
    fields: [
      { name: "title", label: "Título de la sección", type: "text", placeholder: "Autoridades" },
      { name: "description", label: "Descripción", type: "textarea", placeholder: "Descripción..." },
    ],
  },
  calendar: {
    title: "Calendario",
    description: "Eventos y fechas importantes",
    icon: Calendar,
    fields: [
      { name: "title", label: "Título de la sección", type: "text", placeholder: "Calendario Académico" },
      { name: "description", label: "Descripción", type: "textarea", placeholder: "Descripción..." },
    ],
  },
  faq: {
    title: "FAQ",
    description: "Preguntas frecuentes",
    icon: HelpCircle,
    fields: [
      { name: "title", label: "Título de la sección", type: "text", placeholder: "Preguntas Frecuentes" },
    ],
  },
  footer: {
    title: "Footer",
    description: "Pie de página",
    icon: FileText,
    fields: [
      { name: "description", label: "Descripción de la institución", type: "textarea", placeholder: "Descripción breve..." },
      { name: "address", label: "Dirección", type: "text", placeholder: "Av. Universidad 123" },
      { name: "phone", label: "Teléfono", type: "text", placeholder: "+51 1 234 5678" },
      { name: "email", label: "Email", type: "text", placeholder: "contacto@finesi.edu.pe" },
    ],
  },
};

export default function SectionEditorPage() {
  const router = useRouter();
  const params = useParams();
  const section = params.section as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const config = sectionConfigs[section];

  // Redirect if section doesn't exist
  useEffect(() => {
    if (!config) {
      router.push("/admin/content");
    }
  }, [config, router]);

  // Fetch datos reales desde /api/content?section={section}
  useEffect(() => {
    if (!config) return;

    const fetchSectionContent = async () => {
      try {
        const res = await fetch(`/api/content?section=${section}`);
        const json = await res.json();

        if (res.ok && json.data?.[section]) {
          const sectionData = json.data[section];
          const loaded: Record<string, string> = {};

          // Mapear cada field del config con los datos de la DB
          for (const field of config.fields) {
            loaded[field.name] = sectionData[field.name]?.value || "";
          }
          setFormData(loaded);
        } else {
          // Si no hay datos en DB, inicializar vacío
          const empty: Record<string, string> = {};
          for (const field of config.fields) {
            empty[field.name] = "";
          }
          setFormData(empty);
        }
      } catch (error) {
        console.error(`Error fetching ${section} content:`, error);
        toast.error("Error al cargar contenido");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSectionContent();
  }, [section, config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convertir formData a items para batch upsert
      const items = Object.entries(formData).map(([key, value]) => ({
        section,
        key,
        value,
        type: "text",
      }));

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al guardar");
      }

      toast.success(`${config.title} actualizado exitosamente`);
      router.push("/admin/content");
    } catch (error) {
      console.error(`Error saving ${section} content:`, error);
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!config) {
    return null;
  }

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/content">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Editar {config.title}
              </h1>
              <p className="text-muted-foreground">{config.description}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/#${section}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Ver sección
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenido</CardTitle>
                <CardDescription>
                  Edita el contenido de la sección {config.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        rows={3}
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Info about dynamic content */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">
                    El contenido dinámico (listas de items) se gestiona desde la
                    sección correspondiente del admin.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </span>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/content">Cancelar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ayuda</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Los cambios se guardarán en la base de datos y se reflejarán
                  inmediatamente en el landing.
                </p>
                <p>
                  Puedes usar el botón &quot;Ver sección&quot; para previsualizar los
                  cambios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
