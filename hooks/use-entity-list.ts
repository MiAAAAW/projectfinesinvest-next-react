"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// USE ENTITY LIST HOOK
// Reemplaza la lógica repetida en las 9 list pages de admin
// Maneja: fetch, search, filters, delete, loading, paginación, debounce
// ═══════════════════════════════════════════════════════════════════════════════

interface UseEntityListOptions {
  /** Endpoint base de la API, ej: "/api/announcements" */
  endpoint: string;
  /** Nombre de la entidad para mensajes de toast, ej: "anuncio" */
  entityName: string;
  /** Parámetros fijos que siempre se envían, ej: { includeResearchLines: "true" } */
  fixedParams?: Record<string, string>;
  /** Items por página (default: 20) */
  pageSize?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseEntityListReturn<T> {
  items: T[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  deleting: boolean;
  handleDelete: () => Promise<void>;
  refetch: () => Promise<void>;
  // Paginación
  pagination: PaginationMeta;
  setPage: (page: number) => void;
}

export function useEntityList<T>({
  endpoint,
  entityName,
  fixedParams,
  pageSize = 20,
}: UseEntityListOptions): UseEntityListReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: pageSize,
    totalPages: 1,
  });

  // Estabilizar fixedParams para evitar re-renders infinitos
  const fixedParamsRef = useRef(fixedParams);
  fixedParamsRef.current = fixedParams;

  // Debounce de búsqueda (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset a página 1 al buscar
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset a página 1 al filtrar
  }, []);

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (debouncedSearch) params.set("search", debouncedSearch);

      params.set("page", String(page));
      params.set("limit", String(pageSize));

      // Agregar filtros dinámicos (solo si no son "all")
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        }
      });

      // Agregar parámetros fijos
      if (fixedParamsRef.current) {
        Object.entries(fixedParamsRef.current).forEach(([key, value]) => {
          params.set(key, value);
        });
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Error al cargar ${entityName}s`);
      }

      setItems(json.data || []);

      // Actualizar metadata de paginación si el API la devuelve
      if (json.meta) {
        setPagination(json.meta);
      }
    } catch (error) {
      console.error(`Error fetching ${entityName}s:`, error);
      toast.error(`Error al cargar ${entityName}s`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, entityName, debouncedSearch, filters, page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Delete entity
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const res = await fetch(`${endpoint}/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} eliminado`);
      setDeleteId(null);
      fetchItems();
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      toast.error(`Error al eliminar ${entityName}`);
    } finally {
      setDeleting(false);
    }
  };

  return {
    items,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    deleteId,
    setDeleteId,
    deleting,
    handleDelete,
    refetch: fetchItems,
    pagination,
    setPage,
  };
}
