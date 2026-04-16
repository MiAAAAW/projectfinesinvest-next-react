"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER ASSIGNMENT COMPONENT
// Gestión de docentes asignados a una línea de investigación
// Incluye: lista de asignados, dialog para agregar, selector de rol
// ═══════════════════════════════════════════════════════════════════════════════

import { X, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TEACHER_ROLES } from "@/lib/admin-constants";
import { getInitials } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Teacher {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  specialty: string | null;
  degree: string | null;
  published: boolean;
}

export interface AssignedTeacher extends Teacher {
  role: string;
  active: boolean;
  joinedAt: string;
}

interface TeacherAssignmentProps {
  assignedTeachers: AssignedTeacher[];
  unassignedTeachers: Teacher[];
  isLoadingTeachers: boolean;
  assignDialogOpen: boolean;
  setAssignDialogOpen: (open: boolean) => void;
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  isAssigning: boolean;
  onAssign: () => Promise<void>;
  onUpdateRole: (teacherId: string, newRole: string) => Promise<void>;
  onToggleActive: (teacherId: string, active: boolean) => Promise<void>;
  onRemove: (teacherId: string) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════════

export function TeacherAssignment({
  assignedTeachers,
  unassignedTeachers,
  isLoadingTeachers,
  assignDialogOpen,
  setAssignDialogOpen,
  selectedTeacherId,
  setSelectedTeacherId,
  selectedRole,
  setSelectedRole,
  isAssigning,
  onAssign,
  onUpdateRole,
  onToggleActive,
  onRemove,
}: TeacherAssignmentProps) {
  const currentCoordinator = assignedTeachers.find((t) => t.role === "coordinador");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Equipo de Investigación
            <Badge variant="secondary" className="ml-2">
              {assignedTeachers.length} docentes
            </Badge>
          </CardTitle>
          <CardDescription>
            Docentes asignados a esta línea de investigación
          </CardDescription>
        </div>
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={unassignedTeachers.length === 0}>
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar Docente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Docente</DialogTitle>
              <DialogDescription>
                Selecciona un docente y asígnale un rol en esta línea
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Docente</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.degree && `${teacher.degree} `}
                        {teacher.name}
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
                    {TEACHER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRole === "coordinador" && currentCoordinator && (
                  <p className="text-xs text-amber-600">
                    Ya hay un coordinador: {currentCoordinator.name}. Se
                    reemplazará si continúas.
                  </p>
                )}
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
                  "Agregar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoadingTeachers ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : assignedTeachers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay docentes asignados</p>
            <p className="text-sm">Agrega docentes usando el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  teacher.active ? "bg-muted/30 hover:bg-muted/50" : "bg-muted/10 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {teacher.avatarUrl ? (
                      <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {teacher.name}
                    </p>
                    {teacher.specialty && (
                      <p className="text-xs text-muted-foreground">{teacher.specialty}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={teacher.role}
                    onValueChange={(value) => onUpdateRole(teacher.id, value)}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEACHER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${teacher.active ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-muted-foreground/80"}`}
                    onClick={() => onToggleActive(teacher.id, !teacher.active)}
                    title={teacher.active ? "Desactivar docente" : "Activar docente"}
                  >
                    {teacher.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(teacher.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
