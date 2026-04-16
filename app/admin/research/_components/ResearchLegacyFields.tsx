"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH LEGACY FIELDS
// Campos legacy (coordinator, members) que serán reemplazados por docentes
// ═══════════════════════════════════════════════════════════════════════════════

import { AlertTriangle, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ResearchFormData } from "./ResearchFormFields";

interface ResearchLegacyFieldsProps {
  formData: ResearchFormData;
  updateField: (field: keyof ResearchFormData, value: string | boolean) => void;
  showLegacy: boolean;
  setShowLegacy: (open: boolean) => void;
  assignedCount: number;
}

export function ResearchLegacyFields({
  formData,
  updateField,
  showLegacy,
  setShowLegacy,
  assignedCount,
}: ResearchLegacyFieldsProps) {
  return (
    <Card className="border-dashed border-amber-500/50">
      <Collapsible open={showLegacy} onOpenChange={setShowLegacy}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Campos Legacy (Deprecados)
              <ChevronDown
                className={`h-4 w-4 ml-auto transition-transform ${
                  showLegacy ? "rotate-180" : ""
                }`}
              />
            </CardTitle>
            <CardDescription>
              Estos campos serán reemplazados por la gestión de docentes.
              {assignedCount > 0 && (
                <span className="text-green-600 ml-1">
                  (Ya tienes {assignedCount} docentes asignados)
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              <strong>Nota:</strong> Usa la sección &quot;Equipo de
              Investigación&quot; para gestionar docentes. Estos campos
              se mantendrán por compatibilidad pero serán ignorados si
              hay docentes asignados.
            </div>
            <div className="space-y-2">
              <Label htmlFor="coordinator" className="text-muted-foreground">
                Coordinador (texto manual)
              </Label>
              <Input
                id="coordinator"
                placeholder="Nombre del coordinador"
                value={formData.coordinator}
                onChange={(e) => updateField("coordinator", e.target.value)}
                className="border-dashed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="members" className="text-muted-foreground">
                Número de investigadores (manual)
              </Label>
              <Input
                id="members"
                type="number"
                min="0"
                placeholder="Ej: 12"
                value={formData.members}
                onChange={(e) => updateField("members", e.target.value)}
                className="border-dashed"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
