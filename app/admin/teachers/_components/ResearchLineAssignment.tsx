"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH LINE ASSIGNMENT COMPONENT
// Gestión de líneas de investigación asignadas a un docente
// ═══════════════════════════════════════════════════════════════════════════════

import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DynamicIcon } from "@/lib/icons";
import { TEACHER_ROLES } from "@/lib/admin-constants";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ResearchLine {
  id: string;
  title: string;
  icon: string;
  description?: string;
  published?: boolean;
}

export interface TeacherResearchLine extends ResearchLine {
  role: string;
  joinedAt: string;
}

interface ResearchLineAssignmentProps {
  assignedLines: TeacherResearchLine[];
  unassignedLines: ResearchLine[];
  assignDialogOpen: boolean;
  setAssignDialogOpen: (open: boolean) => void;
  selectedLineId: string;
  setSelectedLineId: (id: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  isAssigning: boolean;
  onAssign: () => Promise<void>;
  onRemove: (lineId: string) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════════

export function ResearchLineAssignment({
  assignedLines,
  unassignedLines,
  assignDialogOpen,
  setAssignDialogOpen,
  selectedLineId,
  setSelectedLineId,
  selectedRole,
  setSelectedRole,
  isAssigning,
  onAssign,
  onRemove,
}: ResearchLineAssignmentProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Líneas de Investigación</CardTitle>
          <CardDescription>
            Líneas de investigación en las que participa
          </CardDescription>
        </div>
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={unassignedLines.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Asignar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Línea de Investigación</DialogTitle>
              <DialogDescription>
                Selecciona una línea de investigación y el rol del docente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Línea de Investigación</Label>
                <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una línea" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedLines.map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEACHER_ROLES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                disabled={isAssigning}
              >
                Cancelar
              </Button>
              <Button onClick={onAssign} disabled={isAssigning}>
                {isAssigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  "Asignar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {assignedLines.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Este docente no está asignado a ninguna línea de investigación
          </p>
        ) : (
          <div className="space-y-2">
            {assignedLines.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <DynamicIcon name={line.icon || "FlaskConical"} size={16} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{line.title}</span>
                    <Badge
                      variant={line.role === "coordinador" ? "default" : "outline"}
                      className="ml-2 text-xs"
                    >
                      {line.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(line.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
