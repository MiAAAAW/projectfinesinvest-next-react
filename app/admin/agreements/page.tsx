"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// AGREEMENTS LIST PAGE
// Lista de convenios con filtros y acciones
// Conectado a API real con PostgreSQL
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
import {
  AGREEMENT_TYPE_LABELS, AGREEMENT_STATUS_LABELS,
  AGREEMENT_TYPES, AGREEMENT_STATUSES,
} from "@/lib/constants/agreements";
import { useEntityList } from "@/hooks/use-entity-list";
import { FilterCard, DeleteConfirmDialog } from "@/components/admin";
import { PageHeaderEditor } from "@/components/admin/PageHeaderEditor";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface Agreement {
  id: string;
  title: string;
  institution: string;
  country: string | null;
  type: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  fileUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  published: boolean;
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
      ...AGREEMENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
    ],
  },
  {
    key: "agreementStatus",
    placeholder: "Estado del convenio",
    options: [
      { value: "all", label: "Todos los estados" },
      ...AGREEMENT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
    ],
  },
  {
    key: "status",
    placeholder: "Publicación",
    options: [
      { value: "all", label: "Todos" },
      { value: "published", label: "Publicados" },
      { value: "draft", label: "Borradores" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════════

export default function AgreementsPage() {
  const {
    items: agreements,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
  } = useEntityList<Agreement>({
    endpoint: "/api/agreements",
    entityName: "convenio",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Convenios</h1>
          <p className="text-muted-foreground">
            Gestiona los convenios institucionales
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/agreements/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Convenio
          </Link>
        </Button>
      </div>

      {/* Editor del encabezado público (colapsable) */}
      <PageHeaderEditor
        section="convenios"
        placeholderTitle="Convenios"
        placeholderDescription="Convenios institucionales de FINESI con universidades, empresas y organizaciones."
      />

      {/* Filters */}
      <FilterCard
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar convenios..."
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
                <TableHead className="w-[300px]">Convenio</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Publicación</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : agreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron convenios
                  </TableCell>
                </TableRow>
              ) : (
                agreements.map((agreement) => (
                  <TableRow key={agreement.id}>
                    <TableCell className="max-w-[300px]">
                      <div className="space-y-1">
                        <span className="font-medium line-clamp-1 break-all">
                          {agreement.title}
                        </span>
                        <p className="text-sm text-muted-foreground line-clamp-1 break-all">
                          {agreement.institution}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agreement.country || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={AGREEMENT_TYPE_LABELS[agreement.type]?.color}
                      >
                        {AGREEMENT_TYPE_LABELS[agreement.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={AGREEMENT_STATUS_LABELS[agreement.status]?.color}
                      >
                        {AGREEMENT_STATUS_LABELS[agreement.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(agreement.startDate)} — {formatDate(agreement.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={agreement.published ? "default" : "outline"}>
                        {agreement.published ? "Publicado" : "Borrador"}
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
                            <Link href={`/admin/agreements/${agreement.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(agreement.id)}
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
        title={(() => {
          const a = agreements.find((x) => x.id === deleteId);
          return a ? `¿Eliminar "${a.title}"?` : "¿Eliminar convenio?";
        })()}
        description="El PDF y el logo del convenio serán removidos del almacenamiento. El registro queda en histórico para auditoría."
        files={(() => {
          const a = agreements.find((x) => x.id === deleteId);
          if (!a) return [];
          const list: Array<{ name: string; sizeLabel?: string | null }> = [];
          if (a.fileUrl) list.push({ name: `PDF — ${a.title}` });
          if (a.logoUrl) list.push({ name: `Logo — ${a.institution}` });
          return list;
        })()}
      />
    </div>
  );
}
