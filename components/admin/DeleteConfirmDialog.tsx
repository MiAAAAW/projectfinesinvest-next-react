"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE CONFIRM DIALOG · profesional, edge-case-aware
// Soporta detalle de qué pasa con archivos R2 + audit trail.
// Se usa en las 9+ list pages del admin.
// ═══════════════════════════════════════════════════════════════════════════════

import { Loader2, FileText, Archive, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  title: string;
  description: string;
  /** Si pasás archivos, muestra un panel de "qué pasa con los archivos" */
  files?: Array<{ name: string; sizeLabel?: string | null }>;
  /** Por defecto true: muestra nota de "registro queda en histórico" */
  preservesAudit?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  title,
  description,
  files,
  preservesAudit = true,
}: DeleteConfirmDialogProps) {
  const hasFiles = files && files.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Detalle de archivos a eliminar */}
        {hasFiles && (
          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
              Se eliminarán {files!.length} {files!.length === 1 ? "archivo" : "archivos"} del almacenamiento
            </div>
            <ul className="space-y-1">
              {files!.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  {f.sizeLabel && (
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {f.sizeLabel}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nota de audit trail */}
        {preservesAudit && (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
            <Archive className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80">
              <strong className="font-semibold">Registro preservado para auditoría.</strong>{" "}
              El historial queda marcado como eliminado pero no se borra de la BD. El archivo
              físico sí se elimina del storage.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
