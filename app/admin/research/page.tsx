"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH LINES LIST PAGE
// Lista de líneas de investigación con filtros y acciones
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Users } from "lucide-react";
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

interface ResearchLine {
  id: string;
  title: string;
  description: string;
  icon: string;
  coordinator: string | null;
  members: number | null;
  href: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const FILTERS = [
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

export default function ResearchPage() {
  const {
    items: researchLines,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<ResearchLine>({
    endpoint: "/api/research",
    entityName: "línea de investigación",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Líneas de Investigación</h1>
          <p className="text-muted-foreground">
            Gestiona las líneas de investigación de la facultad
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/research/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Línea
          </Link>
        </Button>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar líneas de investigación..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Línea de Investigación</TableHead>
                <TableHead>Coordinador</TableHead>
                <TableHead>Investigadores</TableHead>
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
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : researchLines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron líneas de investigación
                  </TableCell>
                </TableRow>
              ) : (
                researchLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="max-w-[400px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <DynamicIcon name={line.icon || "FlaskConical"} size={20} className="text-primary" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="font-medium line-clamp-1 break-all">{line.title}</span>
                          <p className="text-sm text-muted-foreground line-clamp-1 break-all">
                            {line.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {line.coordinator || "-"}
                    </TableCell>
                    <TableCell>
                      {line.members ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {line.members}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {line.order}
                    </TableCell>
                    <TableCell>
                      <Badge variant={line.published ? "default" : "outline"}>
                        {line.published ? "Publicado" : "Oculto"}
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
                            <Link href={`/admin/research/${line.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/#research" target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver en landing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(line.id)}
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

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleting}
        title="¿Eliminar línea de investigación?"
        description="Esta acción no se puede deshacer. La línea de investigación será eliminada permanentemente."
      />
    </div>
  );
}
