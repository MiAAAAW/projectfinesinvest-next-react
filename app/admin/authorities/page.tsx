"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHORITIES LIST PAGE
// Lista de autoridades con filtros y acciones
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Mail } from "lucide-react";
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

interface Authority {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  officeHours: string | null;
  avatarUrl: string | null;
  linkedin: string | null;
  orcid: string | null;
  googleScholar: string | null;
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

export default function AuthoritiesPage() {
  const {
    items: authorities,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Authority>({
    endpoint: "/api/authorities",
    entityName: "autoridad",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Autoridades</h1>
          <p className="text-muted-foreground">
            Gestiona las autoridades de la Dirección de Investigación
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/authorities/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Autoridad
          </Link>
        </Button>
      </div>

      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar autoridades..."
        filters={FILTERS}
        filterValues={filters}
        onFilterChange={setFilter}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Autoridad</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Contacto</TableHead>
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
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : authorities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron autoridades
                  </TableCell>
                </TableRow>
              ) : (
                authorities.map((authority) => (
                  <TableRow key={authority.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {authority.avatarUrl ? (
                            <AvatarImage
                              src={`/api/authorities/image/${authority.id}`}
                              alt={authority.name}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(authority.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{authority.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {authority.role}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {authority.department || "-"}
                    </TableCell>
                    <TableCell>
                      {authority.email ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{authority.email}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {authority.order}
                    </TableCell>
                    <TableCell>
                      <Badge variant={authority.published ? "default" : "outline"}>
                        {authority.published ? "Publicado" : "Oculto"}
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
                            <Link href={`/admin/authorities/${authority.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/#authorities" target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver en landing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(authority.id)}
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
        title="¿Eliminar autoridad?"
        description="Esta acción no se puede deshacer. La autoridad será eliminada permanentemente."
      />
    </div>
  );
}
