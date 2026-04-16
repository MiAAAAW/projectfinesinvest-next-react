"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS LIST PAGE
// Lista de anuncios con filtros y acciones
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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
import { ANNOUNCEMENT_TYPE_LABELS } from "@/lib/admin-constants";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard, DeleteConfirmDialog } from "@/components/admin";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface Announcement {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  type: string;
  icon: string;
  important: boolean;
  published: boolean;
  date: string;
  href: string | null;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE FILTROS
// ═══════════════════════════════════════════════════════════════════════════════

const FILTERS = [
  {
    key: "type",
    placeholder: "Tipo",
    options: [
      { value: "all", label: "Todos los tipos" },
      { value: "convocatoria", label: "Convocatoria" },
      { value: "comunicado", label: "Comunicado" },
      { value: "evento", label: "Evento" },
      { value: "noticia", label: "Noticia" },
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

export default function AnnouncementsPage() {
  const {
    items: announcements,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
    pagination,
    setPage,
  } = useEntityList<Announcement>({
    endpoint: "/api/announcements",
    entityName: "anuncio",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anuncios</h1>
          <p className="text-muted-foreground">
            Gestiona los anuncios, noticias y comunicados del landing
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Anuncio
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar anuncios..."
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
                <TableHead className="w-[400px]">Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron anuncios
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="max-w-[400px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-clamp-1 break-all">{announcement.title}</span>
                          {announcement.important && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 shrink-0">
                              Importante
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 break-all">
                          {announcement.excerpt}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={ANNOUNCEMENT_TYPE_LABELS[announcement.type]?.color}
                      >
                        {ANNOUNCEMENT_TYPE_LABELS[announcement.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(announcement.date).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={announcement.published ? "default" : "outline"}>
                        {announcement.published ? "Publicado" : "Borrador"}
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
                            <Link href={`/admin/announcements/${announcement.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/anuncios" target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver en landing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(announcement.id)}
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

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {announcements.length} de {pagination.total} anuncios
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleting}
        title="¿Eliminar anuncio?"
        description="Esta acción no se puede deshacer. El anuncio será eliminado permanentemente."
      />
    </div>
  );
}
