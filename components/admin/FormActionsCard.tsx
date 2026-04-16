"use client";

import Link from "next/link";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ═══════════════════════════════════════════════════════════════════════════════
// FORM ACTIONS CARD
// Reemplaza los botones Save/Cancel copy-pasteados en 10+ edit/create pages
// ═══════════════════════════════════════════════════════════════════════════════

interface FormActionsCardProps {
  isLoading: boolean;
  cancelHref: string;
  saveLabel?: string;
}

export function FormActionsCard({
  isLoading,
  cancelHref,
  saveLabel = "Guardar cambios",
}: FormActionsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {saveLabel}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={cancelHref}>Cancelar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
