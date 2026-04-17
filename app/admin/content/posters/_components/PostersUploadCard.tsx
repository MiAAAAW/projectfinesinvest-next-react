"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// POSTERS FINESI · gestor multi-PDF (flat, no scope a entidad padre)
// Patrón: clona DocumentUploadCard de acreditación pero con endpoint /api/posters.
// Cada poster es un Document con category="posters".
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

interface Poster {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
}

export function PostersUploadCard() {
  const [items, setItems] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Poster | null>(null);

  // Edit inline state
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
      const res = await fetch("/api/posters");
      const json = await res.json();
      if (res.ok) setItems(json.data || []);
    } catch (err) {
      console.error("Error fetching posters:", err);
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
      const res = await fetch("/api/posters", {
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
        throw new Error(json.error || "Error al agregar poster");
      }
      toast.success("Poster agregado");
      setNewDoc({ title: "", fileUrl: "", fileType: "", fileSize: "" });
      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error("Error adding poster:", err);
      toast.error(err instanceof Error ? err.message : "Error al agregar poster");
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
      const res = await fetch(`/api/posters/${id}`, {
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
      console.error("Error updating poster:", err);
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posters/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar poster");
      }
      toast.success("Poster eliminado");
      setConfirmDelete(null);
      fetchItems();
    } catch (err) {
      console.error("Error deleting poster:", err);
      toast.error(err instanceof Error ? err.message : "Error al eliminar poster");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Posters</CardTitle>
            <CardDescription>
              PDFs que se mostrarán en la página pública de Posters FINESI
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar poster
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        {showForm && (
          <>
            <div className="space-y-3 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="poster-title">Título</Label>
                <Input
                  id="poster-title"
                  placeholder="Ej: RR 1919-2023-R-UNA Hugo Ticona"
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
                    folder="posters"
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

        {/* List */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay posters. Agrega el primero con el botón de arriba.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(p.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[p.fileType?.toUpperCase(), p.fileSize]
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
                          onClick={() => handleSaveEdit(p.id)}
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
                            href={p.fileUrl}
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
                            setEditingId(p.id);
                            setEditTitle(p.title);
                          }}
                          title="Editar título"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDelete(p)}
                          disabled={deletingId === p.id}
                          title="Eliminar"
                        >
                          {deletingId === p.id ? (
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
