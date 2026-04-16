"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// USE ENTITY FORM HOOK
// Reemplaza la lógica repetida en los 10+ edit/create pages de admin
// Maneja: formData, fetch, submit, delete, loading states
// ═══════════════════════════════════════════════════════════════════════════════

interface UseEntityFormOptions<T extends object> {
  /** Endpoint base de la API, ej: "/api/announcements" */
  endpoint: string;
  /** ID de la entidad (undefined = modo crear) */
  entityId?: string;
  /** Nombre de la entidad para toasts, ej: "anuncio" */
  entityName: string;
  /** Ruta a la que redirigir tras guardar/eliminar, ej: "/admin/announcements" */
  redirectPath: string;
  /** Valores por defecto del formulario (modo crear) */
  defaultValues: T;
  /** Transforma la respuesta de la API al estado del formulario */
  mapApiToForm?: (data: Record<string, unknown>) => T;
  /** Transforma el estado del formulario al body de la API */
  mapFormToApi?: (form: T) => Record<string, unknown>;
}

interface UseEntityFormReturn<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  updateField: (field: keyof T, value: T[keyof T]) => void;
  isLoading: boolean;
  isDeleting: boolean;
  isFetching: boolean;
  notFound: boolean;
  isEditMode: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useEntityForm<T extends object>({
  endpoint,
  entityId,
  entityName,
  redirectPath,
  defaultValues,
  mapApiToForm,
  mapFormToApi,
}: UseEntityFormOptions<T>): UseEntityFormReturn<T> {
  const router = useRouter();
  const isEditMode = !!entityId;

  const [formData, setFormData] = useState<T>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);

  // Estabilizar callbacks para evitar re-renders
  const mapApiToFormRef = useRef(mapApiToForm);
  mapApiToFormRef.current = mapApiToForm;
  const mapFormToApiRef = useRef(mapFormToApi);
  mapFormToApiRef.current = mapFormToApi;

  const updateField = (field: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch entity data (solo en modo editar)
  useEffect(() => {
    if (!isEditMode) return;

    const fetchEntity = async () => {
      try {
        const res = await fetch(`${endpoint}/${entityId}`);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error(json.error || `Error al cargar ${entityName}`);
        }

        const data = json.data;
        if (mapApiToFormRef.current) {
          setFormData(mapApiToFormRef.current(data));
        } else {
          setFormData(data);
        }
      } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        toast.error(`Error al cargar ${entityName}`);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEntity();
  }, [endpoint, entityId, entityName, isEditMode]);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body = mapFormToApiRef.current ? mapFormToApiRef.current(formData) : formData;
      const url = isEditMode ? `${endpoint}/${entityId}` : endpoint;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Error al ${isEditMode ? "actualizar" : "crear"} ${entityName}`);
      }

      toast.success(
        `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${isEditMode ? "actualizado" : "creado"}`
      );
      router.push(redirectPath);
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} ${entityName}:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Error al ${isEditMode ? "actualizar" : "crear"} ${entityName}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete entity
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${endpoint}/${entityId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al eliminar");
      }

      toast.success(
        `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} eliminado`
      );
      router.push(redirectPath);
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      toast.error(`Error al eliminar ${entityName}`);
      setIsDeleting(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    isEditMode,
    handleSubmit,
    handleDelete,
  };
}
