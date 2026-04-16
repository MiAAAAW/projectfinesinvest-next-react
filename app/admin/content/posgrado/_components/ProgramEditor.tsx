"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRAM EDITOR · formulario reutilizable para 1 programa (Maestría o Doctorado)
// Idéntico al patrón de ética:
//   - Campos text: name, description, content, requisitos, contacto
//   - PDF opcional con auto-persist (Document + ref en site_content[section].pdfDocumentId)
// Todo en 1 sección de site_content por programa (ej. "posgrado-maestria").
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { FileText, ExternalLink, X, Loader2, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadR2 } from "@/components/admin/FileUploadR2";
import { toast } from "sonner";
import { POSGRADO_PROGRAM_TEXT_KEYS, type PosgradoProgramTextKey } from "@/lib/constants/posgrado";

const TEXT_KEYS = POSGRADO_PROGRAM_TEXT_KEYS;
type TextKey = PosgradoProgramTextKey;

interface PdfDoc {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: string | null;
}

interface ProgramEditorProps {
  section: string;        // ej. "posgrado-maestria" o "posgrado-maestria-abc123"
  label: string;          // nombre visible del programa (para toasts/títulos)
  defaultPdfTitle: string; // ej. "Plan de estudios — Maestría en X"
  // Permite al contenedor (admin page) refrescar el sidebar cuando cambian
  // los metadatos que se muestran en la lista (name, presencia de PDF).
  onMetaChange?: (meta: { name: string; hasPdf: boolean }) => void;
}

export function ProgramEditor({ section, label, defaultPdfTitle, onMetaChange }: ProgramEditorProps) {
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPdf, setIsUpdatingPdf] = useState(false);

  const [saved, setSaved] = useState<Record<TextKey, string>>({
    name: "", description: "", content: "", requisitos: "", contacto: "",
  });
  const [form, setForm] = useState<Record<TextKey, string>>({
    name: "", description: "", content: "", requisitos: "", contacto: "",
  });
  const [pdfDoc, setPdfDoc] = useState<PdfDoc | null>(null);
  const [pendingPdfTitle, setPendingPdfTitle] = useState("");

  // Fetch inicial
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/content?section=${section}`);
        const json = await res.json();
        const secData = json.data?.[section] ?? {};
        const loaded: Record<TextKey, string> = {
          name: secData.name?.value ?? "",
          description: secData.description?.value ?? "",
          content: secData.content?.value ?? "",
          requisitos: secData.requisitos?.value ?? "",
          contacto: secData.contacto?.value ?? "",
        };
        setSaved(loaded);
        setForm(loaded);

        // Resolver PDF si hay referencia
        const docId = secData.pdfDocumentId?.value;
        if (docId) {
          try {
            const docRes = await fetch(`/api/documents/${docId}`);
            if (docRes.ok) {
              const d = (await docRes.json()).data;
              if (d) setPdfDoc({ id: d.id, title: d.title, fileUrl: d.fileUrl, fileSize: d.fileSize });
            }
          } catch (e) {
            console.error("Error loading PDF:", e);
          }
        }
      } catch (err) {
        console.error("Error loading program:", err);
        toast.error("Error al cargar datos");
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [section]);

  const hasChanges = TEXT_KEYS.some((k) => form[k] !== saved[k]);

  const updateField = (key: TextKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Guardar campos de texto (batch)
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const items = TEXT_KEYS.map((k) => ({
        section, key: k, value: form[k], type: "text",
      }));
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      setSaved({ ...form });
      onMetaChange?.({ name: form.name.trim(), hasPdf: !!pdfDoc });
      toast.success(`${label} actualizado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = () => setForm({ ...saved });

  // Persistir referencia del PDF en site_content (auto-persist tras upload/remove)
  const persistPdfReference = async (docId: string) => {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ section, key: "pdfDocumentId", value: docId, type: "text" }],
      }),
    });
    if (!res.ok) throw new Error("Error al persistir referencia del PDF");
  };

  // Subir PDF → crea Document(category="posgrado") + auto-persist
  const handlePdfUploaded = async (result: {
    url: string;
    fileType: string;
    fileSize: string;
    fileName: string;
  }) => {
    setIsUpdatingPdf(true);
    try {
      const title = (pendingPdfTitle || result.fileName.replace(/\.[^/.]+$/, "")).trim() || defaultPdfTitle;
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          fileUrl: result.url,
          fileType: result.fileType,
          fileSize: result.fileSize,
          category: "posgrado",
          published: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al registrar documento");

      const d = json.data;
      await persistPdfReference(d.id);
      setPdfDoc({ id: d.id, title: d.title, fileUrl: d.fileUrl, fileSize: d.fileSize });
      setPendingPdfTitle("");
      onMetaChange?.({ name: saved.name.trim(), hasPdf: true });
      toast.success("Plan de estudios agregado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir PDF");
    } finally {
      setIsUpdatingPdf(false);
    }
  };

  const handlePdfRemove = async () => {
    if (!pdfDoc) return;
    if (!confirm("¿Quitar el plan de estudios? El PDF será eliminado del almacenamiento.")) return;
    setIsUpdatingPdf(true);
    try {
      const res = await fetch(`/api/documents/${pdfDoc.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      await persistPdfReference("");
      setPdfDoc(null);
      onMetaChange?.({ name: saved.name.trim(), hasPdf: false });
      toast.success("Plan de estudios removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setIsUpdatingPdf(false);
    }
  };

  if (isFetching) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Cargando...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Información general del programa */}
      <Card>
        <CardHeader>
          <CardTitle>Información del programa</CardTitle>
          <CardDescription>
            Contenido que aparece en la pestaña de <strong>{label}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${section}-name`}>Nombre del programa</Label>
            <Input
              id={`${section}-name`}
              placeholder={`Ej: ${label} en Ingeniería Estadística`}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${section}-description`}>Descripción corta</Label>
            <Textarea
              id={`${section}-description`}
              placeholder="Subtítulo o línea de presentación"
              rows={2}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${section}-content`}>Contenido principal</Label>
            <Textarea
              id={`${section}-content`}
              placeholder="Descripción extensa del programa: perfil, duración, objetivos, competencias..."
              rows={8}
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Requisitos y contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Requisitos y contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${section}-requisitos`}>Requisitos de admisión</Label>
            <Textarea
              id={`${section}-requisitos`}
              placeholder="Ej: Bachiller en Ingeniería Estadística..."
              rows={5}
              value={form.requisitos}
              onChange={(e) => updateField("requisitos", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section}-contacto`}>Contacto del programa</Label>
            <Textarea
              id={`${section}-contacto`}
              placeholder="Email, teléfono, horario de atención..."
              rows={3}
              value={form.contacto}
              onChange={(e) => updateField("contacto", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* PDF plan de estudios (opcional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Plan de estudios (PDF opcional)
          </CardTitle>
          <CardDescription>
            Si subes un PDF se muestra embebido en la página pública <strong>y aparece también
            en la sección Documentos del landing</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pdfDoc ? (
            <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{pdfDoc.title}</p>
                  {pdfDoc.fileSize && (
                    <p className="text-xs text-muted-foreground">{pdfDoc.fileSize}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button type="button" variant="ghost" size="sm" asChild>
                  <a href={pdfDoc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePdfRemove}
                  disabled={isUpdatingPdf}
                >
                  {isUpdatingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Quitar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor={`${section}-pdfTitle`}>Título del PDF</Label>
                <Input
                  id={`${section}-pdfTitle`}
                  placeholder={defaultPdfTitle}
                  value={pendingPdfTitle}
                  onChange={(e) => setPendingPdfTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Si lo dejás vacío, se usa el nombre del archivo.
                </p>
              </div>
              <FileUploadR2
                folder="posgrado"
                accept=".pdf"
                maxSizeMB={50}
                label="Subir PDF del plan de estudios"
                onUploaded={handlePdfUploaded}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Acciones guardar */}
      <div className="sticky bottom-4 flex items-center justify-end gap-2 rounded-md border bg-card/95 backdrop-blur px-4 py-3 shadow-lg">
        {hasChanges && (
          <>
            <span className="text-xs text-amber-500 mr-auto">
              Tenés cambios sin guardar
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={handleRevert} disabled={isLoading}>
              <Undo2 className="mr-1.5 h-3.5 w-3.5" />
              Descartar
            </Button>
          </>
        )}
        {!hasChanges && (
          <span className="text-xs text-muted-foreground mr-auto">Todo guardado</span>
        )}
        <Button type="button" size="sm" onClick={handleSave} disabled={isLoading || !hasChanges}>
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Guardar {label}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
