"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, Scale, FileText, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadR2 } from "@/components/admin/FileUploadR2";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTICA · editor de contenido
// El PDF opcional se guarda como un Document (category="etica") para aparecer
// también en la sección Documentos del landing. Aquí solo persistimos la
// referencia al Document.id en site_content[section=etica, key=pdfDocumentId].
// ═══════════════════════════════════════════════════════════════════════════════

const KEYS = [
  "title",
  "description",
  "content",
  "comiteTitle",
  "comiteContent",
  "normativas",
  "contacto",
  "pdfDocumentId",
] as const;

const DEFAULTS: Record<string, string> = {
  title: "",
  description: "",
  content: "",
  comiteTitle: "",
  comiteContent: "",
  normativas: "",
  contacto: "",
  pdfDocumentId: "",
};

interface PdfDocumentPreview {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: string | null;
}

export default function EticaEditorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>(DEFAULTS);
  const [pdfDoc, setPdfDoc] = useState<PdfDocumentPreview | null>(null);
  const [isUpdatingPdf, setIsUpdatingPdf] = useState(false);
  const [pendingPdfTitle, setPendingPdfTitle] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/content?section=etica");
        const json = await res.json();
        if (res.ok && json.data?.etica) {
          const loaded: Record<string, string> = { ...DEFAULTS };
          for (const key of KEYS) {
            if (json.data.etica[key]?.value) {
              loaded[key] = json.data.etica[key].value;
            }
          }
          setFormData(loaded);

          // Si hay pdfDocumentId, traer el Document para mostrar preview
          const docId = loaded.pdfDocumentId;
          if (docId) {
            try {
              const docRes = await fetch(`/api/documents/${docId}`);
              if (docRes.ok) {
                const docJson = await docRes.json();
                const d = docJson.data;
                if (d) {
                  setPdfDoc({
                    id: d.id,
                    title: d.title,
                    fileUrl: d.fileUrl,
                    fileSize: d.fileSize,
                  });
                }
              }
            } catch (err) {
              console.error("Error fetching linked document:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching etica content:", error);
        toast.error("Error al cargar contenido");
      } finally {
        setIsFetching(false);
      }
    };
    fetchContent();
  }, []);

  // Auto-persist solo el pdfDocumentId en site_content — elimina grieta de
  // estado intermedio si el admin cierra la tab sin pulsar "Guardar cambios".
  const persistPdfReference = async (docId: string) => {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ section: "etica", key: "pdfDocumentId", value: docId, type: "text" }],
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "Error al persistir referencia");
    }
  };

  // Al subir un PDF nuevo: crea Document (category="etica") + persiste referencia
  const handlePdfUploaded = async (result: {
    url: string;
    fileType: string;
    fileSize: string;
    fileName: string;
  }) => {
    setIsUpdatingPdf(true);
    try {
      const title = (pendingPdfTitle || result.fileName.replace(/\.[^/.]+$/, "")).trim();

      // [1/2] Crear Document
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          fileUrl: result.url,
          fileType: result.fileType,
          fileSize: result.fileSize,
          category: "etica",
          published: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al registrar documento");
      const d = json.data;

      // [2/2] Persistir referencia en site_content (atómico con la creación)
      await persistPdfReference(d.id);

      setPdfDoc({ id: d.id, title: d.title, fileUrl: d.fileUrl, fileSize: d.fileSize });
      updateField("pdfDocumentId", d.id);
      setPendingPdfTitle("");
      toast.success("Documento agregado. Aparecerá también en Documentos.");
    } catch (err) {
      console.error("Error creating Document:", err);
      toast.error(err instanceof Error ? err.message : "Error al registrar documento");
    } finally {
      setIsUpdatingPdf(false);
    }
  };

  // Al quitar: soft-delete Document + limpiar referencia (ambos persistidos inmediato)
  const handlePdfRemove = async () => {
    if (!pdfDoc) return;
    if (!confirm("¿Quitar este PDF? Se eliminará también de la sección Documentos.")) return;
    setIsUpdatingPdf(true);
    try {
      // [1/2] Soft-delete Document
      const res = await fetch(`/api/documents/${pdfDoc.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      // [2/2] Limpiar referencia en site_content (atómico)
      await persistPdfReference("");

      setPdfDoc(null);
      updateField("pdfDocumentId", "");
      toast.success("PDF removido");
    } catch (err) {
      console.error("Error removing document:", err);
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setIsUpdatingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const items = KEYS.map((key) => ({
        section: "etica",
        key,
        value: formData[key] || "",
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
      toast.success("Ética actualizado");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Editar Ética</h1>
              <p className="text-muted-foreground">Comité de ética y normativas de investigación</p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/investigacion/etica" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Ver página
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Título y descripción de la página</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la página</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Ética en Investigación"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción general</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descripción sobre ética en investigación..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Contenido introductorio</Label>
                  <Textarea
                    id="content"
                    placeholder="Texto introductorio sobre la importancia de la ética..."
                    rows={4}
                    value={formData.content}
                    onChange={(e) => updateField("content", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comité de Ética</CardTitle>
                <CardDescription>Información sobre el comité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comiteTitle">Título de la sección</Label>
                  <Input
                    id="comiteTitle"
                    placeholder="Ej: Comité de Ética en Investigación"
                    value={formData.comiteTitle}
                    onChange={(e) => updateField("comiteTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comiteContent">Contenido</Label>
                  <Textarea
                    id="comiteContent"
                    placeholder="Miembros del comité, funciones, objetivos..."
                    rows={6}
                    value={formData.comiteContent}
                    onChange={(e) => updateField("comiteContent", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Normativas y Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="normativas">Normativas vigentes</Label>
                  <Textarea
                    id="normativas"
                    placeholder="Reglamentos, códigos de ética, procedimientos..."
                    rows={5}
                    value={formData.normativas}
                    onChange={(e) => updateField("normativas", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto">Información de contacto</Label>
                  <Textarea
                    id="contacto"
                    placeholder="Email, teléfono del comité de ética..."
                    rows={3}
                    value={formData.contacto}
                    onChange={(e) => updateField("contacto", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Código / Reglamento en PDF (opcional)
                </CardTitle>
                <CardDescription>
                  Si subes un PDF, se mostrará embebido en la página pública con visor interactivo
                  <strong className="text-foreground"> y aparecerá también en la sección Documentos</strong>.
                  Si no hay PDF, solo se muestra el contenido de texto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pdfDoc ? (
                  <div className="space-y-3">
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
                    <p className="text-xs text-muted-foreground">
                      También visible en{" "}
                      <Link href={`/admin/documents/${pdfDoc.id}`} className="text-primary hover:underline">
                        Documentos → {pdfDoc.title}
                      </Link>
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="pendingPdfTitle">Título del documento</Label>
                      <Input
                        id="pendingPdfTitle"
                        placeholder="Ej: Código de Integridad Científica FINESI 2026"
                        value={pendingPdfTitle}
                        onChange={(e) => setPendingPdfTitle(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Si dejas vacío, se usa el nombre del archivo.
                      </p>
                    </div>
                    <FileUploadR2
                      folder="etica"
                      accept=".pdf"
                      maxSizeMB={50}
                      label="Subir PDF"
                      onUploaded={handlePdfUploaded}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
                    <Link href="/admin">Cancelar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ayuda</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Completa las secciones que necesites. Las secciones vacías no se mostrarán en la página pública.</p>
                <p>Los cambios se reflejan inmediatamente al guardar.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
