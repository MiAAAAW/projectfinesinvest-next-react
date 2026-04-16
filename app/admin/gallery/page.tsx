"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY PAGE
// Galería de imágenes con grid y acciones
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, Eye,
  Filter, Grid, List, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { IMAGE_CATEGORIES, IMAGE_CATEGORY_LABELS } from "@/lib/admin-constants";
import { useEntityList } from "@/hooks/use-entity-list";
import { DeleteConfirmDialog } from "@/components/admin";
import { GalleryImageForm } from "@/components/admin/gallery/GalleryImageForm";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
  event: string | null;
  category: string | null;
  date: string | null;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = "grid" | "list";

// Para URLs R2 (absolutas) usamos el src directo → Next/Image las optimiza
// sin pasar por el proxy (evita el 302 redirect que a veces rompe dev mode).
// Para imágenes legacy con path local (`storage/...`) caemos al proxy
// que sabe leer del filesystem.
function getImageSrc(image: { id: string; src: string | null | undefined }): string {
  if (image.src && /^https?:\/\//i.test(image.src)) return image.src;
  return `/api/gallery/image/${image.id}`;
}

function GridSkeleton() {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[4/3]" />
          <CardContent className="p-3">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-5 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-16 w-24 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);

  const {
    items: images,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
    refetch,
  } = useEntityList<GalleryImage>({
    endpoint: "/api/gallery",
    entityName: "imagen",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Galería</h1>
          <p className="text-muted-foreground">
            Gestiona las imágenes de la galería del landing
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Imagen
        </Button>
      </div>

      {/* Filters (custom - has view toggle) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar imágenes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filters.category || "all"} onValueChange={(v) => setFilter("category", v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {IMAGE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status || "all"} onValueChange={(v) => setFilter("status", v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Ocultos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid/List */}
      {loading ? (
        viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">No se encontraron imágenes</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div
          className="grid gap-4"
          style={{
            // Columnas fluidas sin hardcodear breakpoints — se auto-acomodan
            // según ancho disponible. Mínimo 220px por card, máximo 1fr.
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="relative aspect-[4/3] bg-muted/40">
                <Image
                  src={getImageSrc(image)}
                  alt={image.alt}
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditImage(image)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/api/gallery/image/${image.id}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver original
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(image.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {!image.published && (
                  <Badge variant="secondary" className="absolute top-2 left-2">
                    Oculto
                  </Badge>
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium truncate">{image.caption || image.alt}</p>
                <div className="flex items-center gap-2 mt-1">
                  {image.category && (
                    <Badge variant="outline" className="text-xs">
                      {IMAGE_CATEGORY_LABELS[image.category] || image.category}
                    </Badge>
                  )}
                  {image.event && (
                    <span className="text-xs text-muted-foreground truncate">
                      {image.event}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div className="relative h-16 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted/40">
                    <Image
                      src={getImageSrc(image)}
                      alt={image.alt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.caption || image.alt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {image.category && (
                        <Badge variant="outline" className="text-xs">
                          {IMAGE_CATEGORY_LABELS[image.category] || image.category}
                        </Badge>
                      )}
                      <Badge variant={image.published ? "default" : "secondary"}>
                        {image.published ? "Publicado" : "Oculto"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditImage(image)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/api/gallery/image/${image.id}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver original
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(image.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal · crear imagen (reemplaza la redirección a /new) */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => setCreateOpen(v)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva imagen</DialogTitle>
            <DialogDescription>
              Sube una imagen a la galería. Podés editar cualquier campo
              después de subirla.
            </DialogDescription>
          </DialogHeader>
          {/* Mount condicional → cada apertura arranca con estado limpio */}
          {createOpen && (
            <GalleryImageForm
              onSuccess={() => {
                setCreateOpen(false);
                refetch();
              }}
              onCancel={() => setCreateOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal · editar imagen */}
      <Dialog
        open={!!editImage}
        onOpenChange={(v) => !v && setEditImage(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar imagen</DialogTitle>
            <DialogDescription>
              Actualizá la información. Podés dejar el archivo vacío si sólo
              querés cambiar metadatos.
            </DialogDescription>
          </DialogHeader>
          {editImage && (
            <GalleryImageForm
              image={editImage}
              onSuccess={() => {
                setEditImage(null);
                refetch();
              }}
              onCancel={() => setEditImage(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={deleting}
        title="¿Eliminar imagen?"
        description="Esta acción no se puede deshacer. La imagen será eliminada permanentemente de la galería."
      />
    </div>
  );
}
