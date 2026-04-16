"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ACCREDITATION STANDARDS LIST PAGE
// Lista de estándares de acreditación con filtros y acciones
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

interface Standard {
  id: string;
  code: string;
  name: string;
  description: string | null;
  order: number;
  published: boolean;
  _count: {
    subEvidences: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE FILTROS
// ═══════════════════════════════════════════════════════════════════════════════

const FILTERS = [
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

export default function AccreditationPage() {
  const {
    items: standards,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Standard>({
    endpoint: "/api/accreditation",
    entityName: "estándar",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Acreditación</h1>
          <p className="text-muted-foreground">
            Gestiona los estándares de acreditación y sus evidencias
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/accreditation/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Estándar
          </Link>
        </Button>
      </div>

      {/* Editor del encabezado público (colapsable) */}
      <PageHeaderEditor
        section="acreditacion"
        placeholderTitle="Acreditación"
        placeholderDescription="Estándares, sub-evidencias y documentos del proceso de autoevaluación."
      />

      {/* Filters */}
      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar estándares..."
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
                <TableHead className="w-[120px]">Código</TableHead>
                <TableHead>Estándar</TableHead>
                <TableHead className="w-[140px]">Sub-evidencias</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : standards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron estándares
                  </TableCell>
                </TableRow>
              ) : (
                standards.map((standard) => (
                  <TableRow key={standard.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">{standard.code}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium line-clamp-1">{standard.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {standard._count.subEvidences}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={standard.published ? "default" : "outline"}>
                        {standard.published ? "Publicado" : "Borrador"}
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
                            <Link href={`/admin/accreditation/${standard.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(standard.id)}
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
        title="¿Eliminar estándar?"
        description="Esta acción no se puede deshacer. El estándar y todas sus sub-evidencias serán eliminados permanentemente."
      />
    </div>
  );
}
