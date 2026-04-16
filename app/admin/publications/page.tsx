"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLICATIONS LIST PAGE
// Lista de publicaciones con filtros y acciones
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
import { PUBLICATION_TYPES, PUBLICATION_TYPE_LABELS, INDEXED_IN_OPTIONS } from "@/lib/constants/publications";

interface Publication {
  id: string;
  title: string;
  journal: string | null;
  year: number;
  type: string;
  indexedIn: string | null;
  published: boolean;
  _count: {
    authors: number;
  };
}

const FILTERS = [
  {
    key: "type",
    placeholder: "Tipo",
    options: [
      { value: "all", label: "Todos los tipos" },
      ...PUBLICATION_TYPES.map((t) => ({ value: t.value, label: t.label })),
    ],
  },
  {
    key: "status",
    placeholder: "Estado",
    options: [
      { value: "all", label: "Todos" },
      { value: "published", label: "Publicados" },
      { value: "draft", label: "Ocultos" },
    ],
  },
];

export default function PublicationsPage() {
  const {
    items: publications,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Publication>({
    endpoint: "/api/publications",
    entityName: "publicación",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Publicaciones</h1>
          <p className="text-muted-foreground">
            Gestiona las publicaciones científicas y académicas
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/publications/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Publicación
          </Link>
        </Button>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar publicaciones..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Publicación</TableHead>
                <TableHead>Revista</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Indexación</TableHead>
                <TableHead>Autores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : publications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No se encontraron publicaciones
                  </TableCell>
                </TableRow>
              ) : (
                publications.map((pub) => {
                  const typeInfo = PUBLICATION_TYPE_LABELS[pub.type];
                  const indexedLabel = INDEXED_IN_OPTIONS.find(
                    (o) => o.value === pub.indexedIn
                  )?.label;

                  return (
                    <TableRow key={pub.id}>
                      <TableCell>
                        <span className="font-medium line-clamp-2">
                          {pub.title}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pub.journal || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pub.year}
                      </TableCell>
                      <TableCell>
                        {typeInfo ? (
                          <Badge variant="secondary" className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{pub.type}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {indexedLabel ? (
                          <Badge variant="outline">{indexedLabel}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pub._count.authors}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pub.published ? "default" : "outline"}>
                          {pub.published ? "Publicado" : "Oculto"}
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
                              <Link href={`/admin/publications/${pub.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(pub.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleting}
        title="¿Eliminar publicación?"
        description="Esta acción no se puede deshacer. La publicación será eliminada permanentemente."
      />
    </div>
  );
}
