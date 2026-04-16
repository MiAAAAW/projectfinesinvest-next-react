"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT ACCREDITATION STANDARD PAGE
// Formulario para editar estándar + listar sub-evidencias
// ═══════════════════════════════════════════════════════════════════════════════

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard, DeleteConfirmDialog,
} from "@/components/admin";
import { EVIDENCE_CATEGORY_LABELS } from "@/lib/constants/accreditation";
import {
  StandardContentCard, StandardSettingsCard, STANDARD_DEFAULTS,
} from "../_components";
import type { StandardFormData } from "../_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SubEvidence {
  id: string;
  code: string;
  name: string;
  category: string;
  order: number;
  published: boolean;
  _count: {
    documents: number;
  };
}

export default function EditStandardPage({ params }: PageProps) {
  const { id } = use(params);

  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    handleSubmit,
    handleDelete,
  } = useEntityForm<StandardFormData>({
    endpoint: "/api/accreditation",
    entityId: id,
    entityName: "estándar",
    redirectPath: "/admin/accreditation",
    defaultValues: STANDARD_DEFAULTS,
    mapApiToForm: (data) => ({
      code: (data.code as string) || "",
      name: (data.name as string) || "",
      description: (data.description as string) || "",
      order: String(data.order ?? 0),
      published: (data.published as boolean) ?? true,
    }),
    mapFormToApi: (form) => ({
      code: form.code,
      name: form.name,
      description: form.description || null,
      order: parseInt(form.order) || 0,
      published: form.published,
    }),
  });

  // Sub-evidences state
  const [subEvidences, setSubEvidences] = useState<SubEvidence[]>([]);
  const [loadingEvidences, setLoadingEvidences] = useState(true);
  const [deleteEvidenceId, setDeleteEvidenceId] = useState<string | null>(null);
  const [deletingEvidence, setDeletingEvidence] = useState(false);

  const fetchEvidences = useCallback(async () => {
    try {
      const res = await fetch(`/api/accreditation/${id}/evidences`);
      const json = await res.json();
      if (res.ok) {
        setSubEvidences(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching sub-evidences:", error);
    } finally {
      setLoadingEvidences(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvidences();
  }, [fetchEvidences]);

  const handleDeleteEvidence = async () => {
    if (!deleteEvidenceId) return;

    try {
      setDeletingEvidence(true);
      const res = await fetch(`/api/accreditation/${id}/evidences/${deleteEvidenceId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success("Sub-evidencia eliminada");
      setDeleteEvidenceId(null);
      fetchEvidences();
    } catch (error) {
      console.error("Error deleting sub-evidence:", error);
      toast.error("Error al eliminar sub-evidencia");
    } finally {
      setDeletingEvidence(false);
    }
  };

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Estándar no encontrado"
        description="El estándar que buscas no existe o fue eliminado."
        backHref="/admin/accreditation"
        backLabel="Volver a acreditación"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/accreditation"
        title="Editar Estándar"
        description="Modifica la información del estándar"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar estándar?"
        deleteDescription="Esta acción no se puede deshacer. El estándar y todas sus sub-evidencias serán eliminados permanentemente."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <StandardContentCard formData={formData} updateField={updateField} />
          </div>

          <div className="space-y-6">
            <StandardSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/accreditation"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>

      {/* Sub-evidences section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sub-evidencias</CardTitle>
            <Button asChild size="sm">
              <Link href={`/admin/accreditation/${id}/evidences/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Sub-evidencia
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-[140px]">Categoría</TableHead>
                <TableHead className="w-[120px]">Documentos</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEvidences ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : subEvidences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No hay sub-evidencias
                  </TableCell>
                </TableRow>
              ) : (
                subEvidences.map((evidence) => (
                  <TableRow key={evidence.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">{evidence.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium line-clamp-1">{evidence.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={EVIDENCE_CATEGORY_LABELS[evidence.category]?.color}
                      >
                        {EVIDENCE_CATEGORY_LABELS[evidence.category]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {evidence._count.documents}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/accreditation/${id}/evidences/${evidence.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteEvidenceId(evidence.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Evidence Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteEvidenceId}
        onOpenChange={() => setDeleteEvidenceId(null)}
        onConfirm={handleDeleteEvidence}
        isDeleting={deletingEvidence}
        title="¿Eliminar sub-evidencia?"
        description="Esta acción no se puede deshacer. La sub-evidencia y todos sus documentos serán eliminados permanentemente."
      />
    </div>
  );
}
