"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION EDITOR
// Editor visual para la sección Hero del landing
// Conectado a API real con PostgreSQL via /api/content
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/admin/FileUpload";
import { toast } from "sonner";

// Keys que se guardan en SiteContent con section="hero"
const HERO_KEYS = [
  "badgeText", "badgeHref",
  "titleMain", "titleHighlight", "titleSuffix",
  "description",
  "ctaPrimaryText", "ctaPrimaryHref",
  "ctaSecondaryText", "ctaSecondaryHref",
  "enable3D",
] as const;

// Defaults si no hay datos en la DB
const HERO_DEFAULTS: Record<string, string> = {
  badgeText: "Investigación de Excelencia",
  badgeHref: "/#research",
  titleMain: "Impulsamos la",
  titleHighlight: "Investigación",
  titleSuffix: "en la UNFV",
  description: "Somos el órgano rector de la investigación científica, tecnológica y humanística.",
  ctaPrimaryText: "Explorar Proyectos",
  ctaPrimaryHref: "/#research",
  ctaSecondaryText: "Conoce más",
  ctaSecondaryHref: "/#about",
  enable3D: "false",
};

export default function HeroEditorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>(HERO_DEFAULTS);

  // Fetch datos reales desde /api/content?section=hero
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const res = await fetch("/api/content?section=hero");
        const json = await res.json();

        if (res.ok && json.data?.hero) {
          const heroData = json.data.hero;
          const loaded: Record<string, string> = { ...HERO_DEFAULTS };
          for (const key of HERO_KEYS) {
            if (heroData[key]?.value) {
              loaded[key] = heroData[key].value;
            }
          }
          setFormData(loaded);
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
        toast.error("Error al cargar contenido del hero");
      } finally {
        setIsFetching(false);
      }
    };

    fetchHeroContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convertir formData a items para batch upsert
      const items = HERO_KEYS.map((key) => ({
        section: "hero",
        key,
        value: formData[key] || "",
        type: key === "enable3D" ? "boolean" : "text",
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

      toast.success("Hero actualizado exitosamente");
      router.push("/admin/content");
    } catch (error) {
      console.error("Error saving hero content:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar hero");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: String(value) }));
  };

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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

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
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Editar Hero</h1>
              <p className="text-muted-foreground">
                Sección principal del landing
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Ver landing
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badge */}
            <Card>
              <CardHeader>
                <CardTitle>Badge</CardTitle>
                <CardDescription>
                  Etiqueta pequeña sobre el título
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="badgeText">Texto del badge</Label>
                    <Input
                      id="badgeText"
                      placeholder="Ej: Investigación de Excelencia"
                      value={formData.badgeText}
                      onChange={(e) => updateField("badgeText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeHref">Enlace (opcional)</Label>
                    <Input
                      id="badgeHref"
                      placeholder="Ej: #research"
                      value={formData.badgeHref}
                      onChange={(e) => updateField("badgeHref", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Título</CardTitle>
                <CardDescription>
                  Título principal dividido en partes para resaltar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titleMain">Texto inicial</Label>
                  <Input
                    id="titleMain"
                    placeholder="Ej: Impulsamos la"
                    value={formData.titleMain}
                    onChange={(e) => updateField("titleMain", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleHighlight">
                    Texto destacado (con gradiente)
                  </Label>
                  <Input
                    id="titleHighlight"
                    placeholder="Ej: Investigación"
                    value={formData.titleHighlight}
                    onChange={(e) => updateField("titleHighlight", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleSuffix">Texto final</Label>
                  <Input
                    id="titleSuffix"
                    placeholder="Ej: en la UNFV"
                    value={formData.titleSuffix}
                    onChange={(e) => updateField("titleSuffix", e.target.value)}
                  />
                </div>

                {/* Preview */}
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                  <h2 className="text-xl font-bold">
                    {formData.titleMain}{" "}
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {formData.titleHighlight}
                    </span>{" "}
                    {formData.titleSuffix}
                  </h2>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
                <CardDescription>
                  Texto descriptivo debajo del título
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Descripción del Hero..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Botones de acción (CTA)</CardTitle>
                <CardDescription>
                  Botones principales de llamada a la acción
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Botón principal</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ctaPrimaryText">Texto</Label>
                      <Input
                        id="ctaPrimaryText"
                        placeholder="Ej: Explorar Proyectos"
                        value={formData.ctaPrimaryText}
                        onChange={(e) => updateField("ctaPrimaryText", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaPrimaryHref">Enlace</Label>
                      <Input
                        id="ctaPrimaryHref"
                        placeholder="Ej: #research"
                        value={formData.ctaPrimaryHref}
                        onChange={(e) => updateField("ctaPrimaryHref", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Botón secundario</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ctaSecondaryText">Texto</Label>
                      <Input
                        id="ctaSecondaryText"
                        placeholder="Ej: Conoce más"
                        value={formData.ctaSecondaryText}
                        onChange={(e) => updateField("ctaSecondaryText", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaSecondaryHref">Enlace</Label>
                      <Input
                        id="ctaSecondaryHref"
                        placeholder="Ej: #about"
                        value={formData.ctaSecondaryHref}
                        onChange={(e) => updateField("ctaSecondaryHref", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagen de fondo</CardTitle>
                <CardDescription>
                  Imagen que se muestra detrás del contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept="image/jpeg,image/png,image/webp"
                  maxSize={5}
                  value={imageFile}
                  onChange={(f) => setImageFile(f as File | null)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Opciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable3D">Escena 3D</Label>
                    <p className="text-xs text-muted-foreground">
                      Activar fondo 3D animado
                    </p>
                  </div>
                  <Switch
                    id="enable3D"
                    checked={formData.enable3D === "true"}
                    onCheckedChange={(checked) => updateField("enable3D", checked)}
                  />
                </div>
              </CardContent>
            </Card>

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
          </div>
        </div>
      </form>
    </div>
  );
}
