"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// USE RELATION MANAGER HOOK
// Maneja asignaciones many-to-many (docentes↔líneas de investigación)
// Usado por: research/[id] y teachers/[id]
// ═══════════════════════════════════════════════════════════════════════════════

interface RelationItem {
  id: string;
}

interface AssignedItem extends RelationItem {
  role: string;
  active?: boolean;
}

interface UseRelationManagerOptions {
  /** URL para fetch/manage asignados, ej: "/api/research/{id}/teachers" */
  relationEndpoint: string;
  /** URL para fetch disponibles, ej: "/api/teachers?status=published&limit=100" */
  availableEndpoint: string;
  /** Nombre de la entidad asignada para toasts, ej: "docente" */
  entityName: string;
  /** Campo ID al enviar en POST/DELETE body, ej: "teacherId" */
  idFieldName: string;
  /** Rol por defecto al asignar */
  defaultRole?: string;
}

interface UseRelationManagerReturn<TAssigned extends AssignedItem, TAvailable extends RelationItem> {
  assignedItems: TAssigned[];
  availableItems: TAvailable[];
  unassignedItems: TAvailable[];
  isLoadingItems: boolean;
  assignDialogOpen: boolean;
  setAssignDialogOpen: (open: boolean) => void;
  selectedItemId: string;
  setSelectedItemId: (id: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  isAssigning: boolean;
  handleAssign: () => Promise<void>;
  handleRemove: (itemId: string) => Promise<void>;
  handleUpdateRole: (itemId: string, newRole: string) => Promise<void>;
  handleToggleActive: (itemId: string, active: boolean) => Promise<void>;
}

export function useRelationManager<
  TAssigned extends AssignedItem = AssignedItem,
  TAvailable extends RelationItem = RelationItem,
>({
  relationEndpoint,
  availableEndpoint,
  entityName,
  idFieldName,
  defaultRole = "investigador",
}: UseRelationManagerOptions): UseRelationManagerReturn<TAssigned, TAvailable> {
  const [assignedItems, setAssignedItems] = useState<TAssigned[]>([]);
  const [availableItems, setAvailableItems] = useState<TAvailable[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [isAssigning, setIsAssigning] = useState(false);

  // Items no asignados
  const unassignedItems = useMemo(
    () => availableItems.filter((item) => !assignedItems.some((a) => a.id === item.id)),
    [availableItems, assignedItems]
  );

  // Fetch asignados
  const fetchAssigned = useCallback(async () => {
    try {
      setIsLoadingItems(true);
      const res = await fetch(relationEndpoint);
      if (res.ok) {
        const json = await res.json();
        setAssignedItems(json.data || []);
      }
    } catch (error) {
      console.error(`Error fetching assigned ${entityName}s:`, error);
    } finally {
      setIsLoadingItems(false);
    }
  }, [relationEndpoint, entityName]);

  // Fetch disponibles
  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await fetch(availableEndpoint);
        if (res.ok) {
          const json = await res.json();
          setAvailableItems(json.data || []);
        }
      } catch (error) {
        console.error(`Error fetching available ${entityName}s:`, error);
      }
    };

    fetchAvailable();
  }, [availableEndpoint, entityName]);

  // Fetch asignados al montar
  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  // Asignar item
  const handleAssign = async () => {
    if (!selectedItemId) {
      toast.error(`Selecciona un ${entityName}`);
      return;
    }

    setIsAssigning(true);
    try {
      const res = await fetch(relationEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [idFieldName]: selectedItemId,
          role: selectedRole,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Error al asignar ${entityName}`);
      }

      setAssignedItems((prev) => [...prev, json.data]);
      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} asignado`);
      setAssignDialogOpen(false);
      setSelectedItemId("");
      setSelectedRole(defaultRole);
    } catch (error) {
      console.error(`Error assigning ${entityName}:`, error);
      toast.error(error instanceof Error ? error.message : `Error al asignar ${entityName}`);
    } finally {
      setIsAssigning(false);
    }
  };

  // Actualizar rol
  const handleUpdateRole = async (itemId: string, newRole: string) => {
    try {
      const res = await fetch(relationEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [idFieldName]: itemId, role: newRole }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar rol");
      }

      setAssignedItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, role: newRole } : item))
      );
      toast.success("Rol actualizado");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar rol");
    }
  };

  // Toggle active
  const handleToggleActive = async (itemId: string, active: boolean) => {
    try {
      const res = await fetch(relationEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [idFieldName]: itemId, active }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar estado");
      }

      setAssignedItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, active } : item))
      );
      toast.success(active ? "Docente activado" : "Docente desactivado");
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar estado");
    }
  };

  // Remover item
  const handleRemove = async (itemId: string) => {
    try {
      const res = await fetch(relationEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [idFieldName]: itemId }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || `Error al remover ${entityName}`);
      }

      setAssignedItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} removido`);
    } catch (error) {
      console.error(`Error removing ${entityName}:`, error);
      toast.error(`Error al remover ${entityName}`);
    }
  };

  return {
    assignedItems,
    availableItems,
    unassignedItems,
    isLoadingItems,
    assignDialogOpen,
    setAssignDialogOpen,
    selectedItemId,
    setSelectedItemId,
    selectedRole,
    setSelectedRole,
    isAssigning,
    handleAssign,
    handleRemove,
    handleUpdateRole,
    handleToggleActive,
  };
}
