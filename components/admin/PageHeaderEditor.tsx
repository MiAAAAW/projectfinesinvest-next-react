"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE HEADER EDITOR · edita título + descripción del encabezado público
// Persiste en site_content[section, key]. Usado dentro de páginas admin CRUD
// para evitar duplicar rutas — todo en una sola página.
//
// Features:
// - Colapsable (cerrado por default, no estorba)
// - Preview en vivo del título custom vs el default
// - Botón "Restaurar por defecto" → limpia el custom, vuelve al fallback
// - Botón "Descartar cambios" → revierte al último guardado
// - Save solo habilitado si hay cambios reales vs lo guardado
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2, Save, RotateCcw, Undo2, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PageHeaderEditorProps {
  section: string;
  placeholderTitle: string;
  placeholderDescription: string;
  defaultOpen?: boolean;
}

export function PageHeaderEditor({
  section,
  placeholderTitle,
  placeholderDescription,
  defaultOpen = false,
}: PageHeaderEditorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Estado "en servidor" (última versión guardada)
  const [savedTitle, setSavedTitle] = useState("");
  const [savedDescription, setSavedDescription] = useState("");

  // Estado "en edición"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/content?section=${section}`);
        const json = await res.json();
        if (res.ok && json.data?.[section]) {
          const t = json.data[section].title?.value ?? "";
          const d = json.data[section].description?.value ?? "";
          setSavedTitle(t);
          setSavedDescription(d);
          setTitle(t);
          setDescription(d);
        }
      } catch (err) {
        console.error("Error loading header:", err);
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [section]);

  const hasChanges = title !== savedTitle || description !== savedDescription;
  const isUsingDefaults = !savedTitle && !savedDescription;
  const effectiveTitle = title.trim() || placeholderTitle;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const items = [
        { section, key: "title", value: title, type: "text" },
        { section, key: "description", value: description, type: "text" },
      ];
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al guardar");
      }
      setSavedTitle(title);
      setSavedDescription(description);
      toast.success("Encabezado actualizado");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = () => {
    setTitle(savedTitle);
    setDescription(savedDescription);
  };

  const handleReset = async () => {
    if (!confirm("¿Restaurar los valores por defecto? Se usarán los textos originales de la página.")) return;
    setIsLoading(true);
    try {
      const items = [
        { section, key: "title", value: "", type: "text" },
        { section, key: "description", value: "", type: "text" },
      ];
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Error al restaurar");
      setSavedTitle("");
      setSavedDescription("");
      setTitle("");
      setDescription("");
      toast.success("Restaurado a valores por defecto");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al restaurar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full text-left hover:bg-muted/30 transition-colors"
      >
        <CardHeader className="flex flex-row items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 shrink-0">
              <Pencil className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                Encabezado público
                {isUsingDefaults ? (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    Por defecto
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                    <Check className="h-2.5 w-2.5" />
                    Personalizado
                  </Badge>
                )}
                {hasChanges && !isFetching && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    Sin guardar
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                Actual: <span className="font-mono text-foreground">{effectiveTitle}</span>
              </CardDescription>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </CardHeader>
      </button>

      {isOpen && (
        <CardContent className="space-y-5 border-t pt-5 bg-muted/20">
          {isFetching ? (
            <p className="text-xs text-muted-foreground">Cargando...</p>
          ) : (
            <>
              {/* Título */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${section}-title`} className="text-xs uppercase tracking-wide font-semibold">
                    Título
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {title.length} car.
                  </span>
                </div>
                <Input
                  id={`${section}-title`}
                  placeholder={placeholderTitle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-medium"
                />
                <p className="text-[11px] text-muted-foreground">
                  Por defecto: <span className="font-mono">{placeholderTitle}</span>
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`${section}-description`}
                    className="text-xs uppercase tracking-wide font-semibold"
                  >
                    Descripción
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {description.length} car.
                  </span>
                </div>
                <Textarea
                  id={`${section}-description`}
                  placeholder={placeholderDescription}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Por defecto: <span className="font-mono italic">{placeholderDescription}</span>
                </p>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                {!isUsingDefaults && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    <RotateCcw className="mr-1.5 h-3 w-3" />
                    Restaurar por defecto
                  </Button>
                )}

                <div className="ml-auto flex gap-2">
                  {hasChanges && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRevert}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      <Undo2 className="mr-1.5 h-3 w-3" />
                      Descartar cambios
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading || !hasChanges}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
