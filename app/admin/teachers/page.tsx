"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHERS LIST PAGE
// Lista de docentes/investigadores con filtros y acciones
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, Mail, Phone } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard, DeleteConfirmDialog } from "@/components/admin";
import { getInitials } from "@/lib/utils";

interface Teacher {
  id: string;
  name: string;
  code: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  specialty: string | null;
  degree: string | null;
  category: string | null;
  employmentType: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  researchLines?: Array<{
    role: string;
    researchLine: {
      id: string;
      title: string;
      icon: string;
    };
  }>;
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

export default function TeachersPage() {
  const {
    items: teachers,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Teacher>({
    endpoint: "/api/teachers",
    entityName: "docente",
    fixedParams: { includeResearchLines: "true" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Docentes</h1>
          <p className="text-muted-foreground">
            Gestiona los docentes e investigadores de la facultad
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/teachers/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Docente
          </Link>
        </Button>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar docentes..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Código</TableHead>
                <TableHead className="w-[300px]">Docente</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Líneas</TableHead>
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
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron docentes
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {teacher.code || "-"}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {teacher.avatarUrl ? (
                            <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0">
                          <span className="font-medium text-sm line-clamp-1 break-all">
                            {teacher.degree && <span className="text-muted-foreground">{teacher.degree} </span>}
                            {teacher.name}
                          </span>
                          {teacher.specialty && (
                            <p className="text-xs text-muted-foreground line-clamp-1 break-all">
                              {teacher.specialty}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {teacher.category ? (
                        <Badge variant="outline" className="text-xs">{teacher.category}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {teacher.employmentType ? (
                        <Badge variant={teacher.employmentType === "N" ? "default" : "secondary"} className="text-xs">
                          {teacher.employmentType === "N" ? "Nombrado" : "Contratado"}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {teacher.researchLines && teacher.researchLines.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.researchLines.slice(0, 2).map((rl) => (
                            <Badge
                              key={rl.researchLine.id}
                              variant={rl.role === "coordinador" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {rl.researchLine.title.slice(0, 20)}
                              {rl.researchLine.title.length > 20 ? "..." : ""}
                            </Badge>
                          ))}
                          {teacher.researchLines.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{teacher.researchLines.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.published ? "default" : "outline"}>
                        {teacher.published ? "Publicado" : "Oculto"}
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
                            <Link href={`/admin/teachers/${teacher.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(teacher.id)}
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
        title="¿Eliminar docente?"
        description="Esta acción no se puede deshacer. El docente será eliminado permanentemente junto con sus asignaciones a líneas de investigación."
      />
    </div>
  );
}
