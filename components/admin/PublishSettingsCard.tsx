"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLISH SETTINGS CARD
// Reemplaza el card de publicación copy-pasteado en 5+ edit/create pages
// Incluye: Switch "Publicar" + Orden + slot para contenido extra
// ═══════════════════════════════════════════════════════════════════════════════

interface PublishSettingsCardProps {
  published: boolean;
  onPublishedChange: (checked: boolean) => void;
  order?: string;
  onOrderChange?: (value: string) => void;
  /** Contenido extra entre el switch y el orden (ej: "important", "date") */
  children?: React.ReactNode;
}

export function PublishSettingsCard({
  published,
  onPublishedChange,
  order,
  onOrderChange,
  children,
}: PublishSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Published Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="published">Publicar</Label>
            <p className="text-xs text-muted-foreground">
              Visible en el landing
            </p>
          </div>
          <Switch
            id="published"
            checked={published}
            onCheckedChange={onPublishedChange}
          />
        </div>

        {/* Extra content (important toggle, date, etc.) */}
        {children}

        {/* Order */}
        {onOrderChange && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="order">Orden de aparición</Label>
              <Input
                id="order"
                type="number"
                min="0"
                placeholder="0"
                value={order || "0"}
                onChange={(e) => onOrderChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Menor número = aparece primero
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
