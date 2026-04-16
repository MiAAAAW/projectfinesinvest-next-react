"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHERS RENACYT LIST PAGE
// Vista filtrada de docentes registrados en RENACYT (solo lectura)
// Reutiliza la API de teachers con filtro isRenacyt=true
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { MoreHorizontal, Pencil, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard } from "@/components/admin";
import { getInitials } from "@/lib/utils";

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  degree: string | null;
  specialty: string | null;
  renacytCode: string | null;
  renacytLevel: string | null;
  isRenacyt: boolean;
  published: boolean;
}

export default function TeachersRenacytPage() {
  const {
    items: teachers,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
  } = useEntityList<Teacher>({
    endpoint: "/api/teachers",
    entityName: "docente RENACYT",
    fixedParams: { isRenacyt: "true" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Docentes RENACYT</h1>
            <p className="text-muted-foreground">
              Docentes registrados en RENACYT
            </p>
          </div>
        </div>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar docentes RENACYT..."
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Docente</TableHead>
                <TableHead>Codigo RENACYT</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Especialidad</TableHead>
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
                          <Skeleton className="h-3 w-[120px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron docentes RENACYT
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {teacher.avatarUrl ? (
                            <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(teacher.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 min-w-0">
                          <span className="font-medium line-clamp-1 break-all">
                            {teacher.degree && <span className="text-muted-foreground">{teacher.degree} </span>}
                            {teacher.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {teacher.renacytCode || "-"}
                    </TableCell>
                    <TableCell>
                      {teacher.renacytLevel ? (
                        <Badge variant="secondary">
                          {teacher.renacytLevel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {teacher.specialty || "-"}
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
    </div>
  );
}
