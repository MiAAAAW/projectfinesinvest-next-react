"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESOLUCIONES DECANALES LIST PAGE
// Lista de resoluciones decanales con filtros y acciones
// ═══════════════════════════════════════════════════════════════════════════════

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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard, DeleteConfirmDialog } from "@/components/admin";
import { PageHeaderEditor } from "@/components/admin/PageHeaderEditor";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface Resolution {
  id: string;
  number: string;
  subject: string;
  type: string;
  date: string;
  year: number;
  fileUrl: string | null;
  fileSize: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE FILTROS
// ═══════════════════════════════════════════════════════════════════════════════

const FILTERS = [
  {
    key: "year",
    placeholder: "Año",
    options: [
      { value: "all", label: "Todos los años" },
      { value: "2026", label: "2026" },
      { value: "2025", label: "2025" },
      { value: "2024", label: "2024" },
      { value: "2023", label: "2023" },
    ],
  },
  {
    key: "status",
    placeholder: "Estado",
    options: [
      { value: "all", label: "Todos" },
      { value: "published", label: "Publicados" },
      { value: "draft", label: "Borradores" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════════

export default function ResolucionesDecanalesPage() {
  const {
    items: resolutions,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Resolution>({
    endpoint: "/api/resolutions",
    entityName: "resolución",
    fixedParams: { type: "decanal" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resoluciones Decanales</h1>
          <p className="text-muted-foreground">
            Gestiona las resoluciones decanales de la facultad
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/resolutions/decanales/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Resolución
          </Link>
        </Button>
      </div>

      {/* Editor del encabezado público (colapsable) */}
      <PageHeaderEditor
        section="resoluciones-decanales"
        placeholderTitle="Resoluciones Decanales"
        placeholderDescription="Resoluciones emitidas por el Decanato de FINESI."
      />

      {/* Filters */}
      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por número o asunto..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Número</TableHead>
                <TableHead className="w-[400px]">Asunto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : resolutions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron resoluciones decanales
                  </TableCell>
                </TableRow>
              ) : (
                resolutions.map((resolution) => (
                  <TableRow key={resolution.id}>
                    <TableCell className="font-medium">
                      {resolution.number}
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="line-clamp-1 break-all">
                        {resolution.subject}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(resolution.date).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {resolution.year}
                    </TableCell>
                    <TableCell>
                      <Badge variant={resolution.published ? "default" : "outline"}>
                        {resolution.published ? "Publicado" : "Borrador"}
                      </Badge>
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
                            <Link href={`/admin/resolutions/decanales/${resolution.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(resolution.id)}
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

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleting}
        title={(() => {
          const r = resolutions.find((x) => x.id === deleteId);
          return r ? `¿Eliminar Resolución N.° ${r.number}?` : "¿Eliminar resolución?";
        })()}
        description="El archivo PDF será removido del almacenamiento y la resolución dejará de aparecer en la página pública. El registro queda en histórico para auditoría."
        files={(() => {
          const r = resolutions.find((x) => x.id === deleteId);
          return r?.fileUrl ? [{ name: `Resolución N.° ${r.number}`, sizeLabel: r.fileSize }] : [];
        })()}
      />
    </div>
  );
}
