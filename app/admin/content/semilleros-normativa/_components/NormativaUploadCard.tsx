"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// SEMILLEROS · NORMATIVA — gestor multi-PDF
// Clon del patrón de PostersUploadCard, scoped a category="semilleros-normativa".
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Loader2,
  ExternalLink,
  Pencil,
  Check,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUploadR2, DeleteConfirmDialog } from "@/components/admin";
import { toast } from "sonner";

const API_BASE = "/api/semilleros-normativa";
const R2_FOLDER = "semilleros-normativa";

interface Doc {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
}

export function NormativaUploadCard() {
  const [items, setItems] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Doc | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [newDoc, setNewDoc] = useState({
    title: "",
    fileUrl: "",
    fileType: "",
    fileSize: "",
  });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      if (res.ok) setItems(json.data || []);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!newDoc.title || !newDoc.fileUrl) {
      toast.error("Sube un archivo y escribe un título");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(API_BASE, {
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
        throw new Error(json.error || "Error al agregar");
      }
      toast.success("Documento agregado");
      setNewDoc({ title: "", fileUrl: "", fileType: "", fileSize: "" });
      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error("Error adding:", err);
      toast.error(err instanceof Error ? err.message : "Error al agregar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      toast.error("El título no puede estar vacío");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al actualizar");
      }
      toast.success("Título actualizado");
      setEditingId(null);
      fetchItems();
    } catch (err) {
      console.error("Error updating:", err);
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }
      toast.success("Documento eliminado");
      setConfirmDelete(null);
      fetchItems();
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Resoluciones Rectorales</CardTitle>
            <CardDescription>
              PDFs de normativa sobre semilleros. Se muestran en un panel lateral dentro
              de la página pública de Semilleros.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar RR
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <>
            <div className="space-y-3 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="rr-title">Título</Label>
                <Input
                  id="rr-title"
                  placeholder="Ej: RR 1843-2024-R-UNA Reglamento Semilleros"
                  value={newDoc.title}
                  onChange={(e) =>
                    setNewDoc((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Archivo PDF</Label>
                {newDoc.fileUrl ? (
                  <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate flex-1">
                      {newDoc.fileUrl.split("/").pop()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {newDoc.fileSize}
                    </span>
                  </div>
                ) : (
                  <FileUploadR2
                    folder={R2_FOLDER}
                    accept=".pdf"
                    label="Subir PDF"
                    onUploaded={(result) => {
                      setNewDoc((prev) => ({
                        ...prev,
                        fileUrl: result.url,
                        fileType: result.fileType,
                        fileSize: result.fileSize,
                        title:
                          prev.title ||
                          result.fileName
                            .replace(/\.[^/.]+$/, "")
                            .replace(/[_-]/g, " "),
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
                    setNewDoc({
                      title: "",
                      fileUrl: "",
                      fileType: "",
                      fileSize: "",
                    });
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

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay documentos. Agrega el primero con el botón de arriba.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((d) => {
              const isEditing = editingId === d.id;
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border p-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    {isEditing ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(d.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[d.fileType?.toUpperCase(), d.fileSize]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(d.id)}
                          disabled={savingEdit}
                        >
                          {savingEdit ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
                          disabled={savingEdit}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" variant="ghost" size="icon" asChild>
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir PDF"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(d.id);
                            setEditTitle(d.title);
                          }}
                          title="Editar título"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDelete(d)}
                          disabled={deletingId === d.id}
                          title="Eliminar"
                        >
                          {deletingId === d.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <DeleteConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() =>
          confirmDelete ? handleDelete(confirmDelete.id) : Promise.resolve()
        }
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
