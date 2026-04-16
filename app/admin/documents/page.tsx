"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS LIST PAGE
// Lista de documentos con filtros y acciones
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, Download, ExternalLink } from "lucide-react";
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
import { CATEGORY_LABELS, FILE_TYPE_ICONS } from "@/lib/admin-constants";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard, DeleteConfirmDialog } from "@/components/admin";

interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSize: string | null;
  category: string;
  downloads: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const FILTERS = [
  {
    key: "category",
    placeholder: "Categoría",
    options: [
      { value: "all", label: "Todas las categorías" },
      { value: "reglamentos", label: "Reglamentos" },
      { value: "formatos", label: "Formatos" },
      { value: "manuales", label: "Manuales" },
      { value: "investigacion", label: "Investigación" },
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

export default function DocumentsPage() {
  const {
    items: documents,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Document>({
    endpoint: "/api/documents",
    entityName: "documento",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Gestiona los documentos descargables del landing
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            Subir Documento
          </Link>
        </Button>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar documentos..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Documento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Descargas</TableHead>
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
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron documentos
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => {
                  const Icon = FILE_TYPE_ICONS[doc.fileType] || FILE_TYPE_ICONS.default;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="max-w-[400px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className="font-medium line-clamp-1 break-all">{doc.title}</span>
                            <p className="text-sm text-muted-foreground line-clamp-1 break-all">
                              {doc.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[doc.category] || doc.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.fileSize || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Download className="h-4 w-4" />
                          {doc.downloads}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.published ? "default" : "outline"}>
                          {doc.published ? "Publicado" : "Oculto"}
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
                              <Link href={`/admin/documents/${doc.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/api/download/${doc.id}`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver archivo
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(doc.id)}
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
        title={(() => {
          const d = documents.find((doc) => doc.id === deleteId);
          return d ? `¿Eliminar "${d.title}"?` : "¿Eliminar documento?";
        })()}
        description="El archivo será removido del almacenamiento y desaparecerá del Centro de Documentos público. El registro queda en histórico para auditoría."
        files={(() => {
          const d = documents.find((doc) => doc.id === deleteId);
          return d ? [{ name: d.title, sizeLabel: d.fileSize }] : [];
        })()}
      />
    </div>
  );
}
