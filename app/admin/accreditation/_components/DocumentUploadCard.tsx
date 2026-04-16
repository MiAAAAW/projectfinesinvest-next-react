"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, FileText, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUploadR2, DeleteConfirmDialog } from "@/components/admin";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
}

interface DocumentUploadCardProps {
  standardId: string;
  evidenceId: string;
}

export function DocumentUploadCard({ standardId, evidenceId }: DocumentUploadCardProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Document | null>(null);

  const [newDoc, setNewDoc] = useState({
    title: "",
    fileUrl: "",
    fileType: "",
    fileSize: "",
  });

  const baseUrl = `/api/accreditation/${standardId}/evidences/${evidenceId}/documents`;

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(baseUrl);
      const json = await res.json();
      if (res.ok) {
        setDocuments(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleAdd = async () => {
    if (!newDoc.title || !newDoc.fileUrl) {
      toast.error("Sube un archivo y escribe un título");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDoc.title,
          fileUrl: newDoc.fileUrl,
          fileType: newDoc.fileType || undefined,
          fileSize: newDoc.fileSize || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al agregar documento");
      }

      toast.success("Documento agregado");
      setNewDoc({ title: "", fileUrl: "", fileType: "", fileSize: "" });
      setShowForm(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error(error instanceof Error ? error.message : "Error al agregar documento");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (documentId: string) => {
    setDeletingId(documentId);
    try {
      const res = await fetch(baseUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar documento");
      }

      toast.success("Documento eliminado");
      setConfirmDelete(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar documento");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Documentos</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar documento
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add document form */}
        {showForm && (
          <>
            <div className="space-y-3 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="doc-title">Título del documento</Label>
                <Input
                  id="doc-title"
                  placeholder="Ej: Marco normativo de investigación"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Archivo</Label>
                {newDoc.fileUrl ? (
                  <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate flex-1">{newDoc.fileUrl.split("/").pop()}</span>
                    <span className="text-xs text-muted-foreground">{newDoc.fileSize}</span>
                  </div>
                ) : (
                  <FileUploadR2
                    folder="acreditacion"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    label="Subir PDF o documento"
                    onUploaded={(result) => {
                      setNewDoc((prev) => ({
                        ...prev,
                        fileUrl: result.url,
                        fileType: result.fileType,
                        fileSize: result.fileSize,
                        title: prev.title || result.fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
                      }));
                    }}
                  />
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setNewDoc({ title: "", fileUrl: "", fileType: "", fileSize: "" });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAdd}
                  disabled={saving || !newDoc.fileUrl}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Agregar
                </Button>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Document list */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay documentos agregados</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[doc.fileType?.toUpperCase(), doc.fileSize].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDelete(doc)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Modal de confirmación profesional */}
      <DeleteConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => (confirmDelete ? handleRemove(confirmDelete.id) : Promise.resolve())}
        isDeleting={!!deletingId}
        title={`¿Eliminar "${confirmDelete?.title ?? ""}"?`}
        description="El archivo será removido del almacenamiento R2 y desaparecerá de la página pública. El registro queda en histórico para auditoría."
        files={
          confirmDelete
            ? [{ name: confirmDelete.title, sizeLabel: confirmDelete.fileSize }]
            : []
        }
      />
    </Card>
  );
}
