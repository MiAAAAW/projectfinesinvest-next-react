"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENTS LIST PAGE
// Lista de estudiantes con filtros y acciones.
// Patrón: useEntityList + FilterCard + Tabla. Consistente con admin de teachers.
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard, DeleteConfirmDialog } from "@/components/admin";
import { getInitials } from "@/lib/utils";
import {
  STUDENT_PROGRAMS,
  STUDENT_STATUSES,
  findOption,
} from "@/lib/constants/students";

interface Student {
  id: string;
  universityCode: string;
  program: string | null;
  currentSemester: number | null;
  admissionYear: number | null;
  status: string;
  published: boolean;
  featured: boolean;
  user: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl: string | null;
    dni: string | null;
  };
}

// Filtros desde constants (sin hardcode)
const FILTERS = [
  {
    key: "status",
    placeholder: "Estado",
    options: [
      { value: "all", label: "Todos los estados" },
      ...STUDENT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    ],
  },
  {
    key: "program",
    placeholder: "Programa",
    options: [
      { value: "all", label: "Todos los programas" },
      ...STUDENT_PROGRAMS.map((p) => ({ value: p.value, label: p.label })),
    ],
  },
];

export default function StudentsPage() {
  const {
    items: students,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Student>({
    endpoint: "/api/students",
    entityName: "estudiante",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estudiantes</h1>
          <p className="text-muted-foreground">
            Gestiona los estudiantes de la facultad y sus datos académicos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/students/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Estudiante
          </Link>
        </Button>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, código, DNI o email..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead className="w-[280px]">Estudiante</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead className="w-[80px]">Semestre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[90px]">Visible</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[140px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {searchQuery ||
                    (filters.status && filters.status !== "all") ||
                    (filters.program && filters.program !== "all")
                      ? "No hay resultados con los filtros actuales"
                      : "No hay estudiantes registrados todavía"}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => {
                  const statusOpt = findOption(STUDENT_STATUSES, s.status);
                  const programLabel = findOption(STUDENT_PROGRAMS, s.program)?.label ?? s.program;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.universityCode}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {s.user.avatarUrl ? (
                              <AvatarImage src={s.user.avatarUrl} alt={s.user.name} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(s.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{s.user.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {s.user.dni ? `DNI ${s.user.dni}` : s.user.email || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm line-clamp-1">
                          {programLabel || <span className="text-muted-foreground">—</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        {s.currentSemester ? (
                          <span className="text-sm">{s.currentSemester}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {statusOpt ? (
                          <Badge variant={statusOpt.color} className="text-xs">
                            {statusOpt.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">{s.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.published ? "default" : "outline"} className="text-xs">
                          {s.published ? "Publicado" : "Oculto"}
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
                              <Link href={`/admin/students/${s.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(s.id)}
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
        title="¿Eliminar estudiante?"
        description="Se marcará como eliminado y se desactivará su rol y cuenta. No se borra para preservar historial."
      />
    </div>
  );
}
