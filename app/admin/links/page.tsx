"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL LINKS LIST PAGE
// Lista de enlaces externos con filtros y acciones
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, ExternalLink as ExternalLinkIcon } from "lucide-react";
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
import { DynamicIcon } from "@/lib/icons";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard, DeleteConfirmDialog } from "@/components/admin";
import { LINK_CATEGORIES, LINK_CATEGORY_LABELS } from "@/lib/constants/links";

interface ExternalLinkItem {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  icon: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const FILTERS = [
  {
    key: "category",
    placeholder: "Categoría",
    options: [
      { value: "all", label: "Todas" },
      ...LINK_CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label })),
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

export default function LinksPage() {
  const {
    items: links,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<ExternalLinkItem>({
    endpoint: "/api/links",
    entityName: "enlace",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enlaces Externos</h1>
          <p className="text-muted-foreground">
            Gestiona los enlaces externos de la Dirección de Investigación
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/links/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Enlace
          </Link>
        </Button>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar enlaces..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Enlace</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron enlaces
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => {
                  const categoryInfo = LINK_CATEGORY_LABELS[link.category];
                  return (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DynamicIcon name={link.icon} size={20} className="text-primary" />
                          </div>
                          <span className="font-medium">{link.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
                        >
                          <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{link.url}</span>
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={categoryInfo?.color}
                        >
                          {categoryInfo?.label || link.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {link.order}
                      </TableCell>
                      <TableCell>
                        <Badge variant={link.published ? "default" : "outline"}>
                          {link.published ? "Publicado" : "Oculto"}
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
                              <Link href={`/admin/links/${link.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                Abrir enlace
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(link.id)}
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
        title="¿Eliminar enlace?"
        description="Esta acción no se puede deshacer. El enlace será eliminado permanentemente."
      />
    </div>
  );
}
