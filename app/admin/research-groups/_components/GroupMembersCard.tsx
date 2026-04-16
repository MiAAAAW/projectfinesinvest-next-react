"use client";

import { X, UserPlus, Loader2 } from "lucide-react";
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
import { getInitials } from "@/lib/utils";
import { useRelationManager } from "@/hooks/use-relation-manager";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MemberTeacher {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  specialty: string | null;
  degree: string | null;
  published: boolean;
}

export interface AssignedMember extends MemberTeacher {
  role: string;
  joinedAt: string;
}

const MEMBER_ROLES = [
  { value: "lider", label: "Líder" },
  { value: "miembro", label: "Miembro" },
  { value: "colaborador", label: "Colaborador" },
] as const;

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  lider: { label: "Líder", color: "bg-primary text-primary-foreground" },
  miembro: { label: "Miembro", color: "bg-blue-500/10 text-blue-600" },
  colaborador: { label: "Colaborador", color: "bg-gray-500/10 text-gray-600" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface GroupMembersCardProps {
  groupId: string;
}

export function GroupMembersCard({ groupId }: GroupMembersCardProps) {
  const relation = useRelationManager<AssignedMember, MemberTeacher>({
    relationEndpoint: `/api/research-groups/${groupId}/members`,
    availableEndpoint: "/api/teachers?status=published&limit=100",
    entityName: "miembro",
    idFieldName: "teacherId",
    defaultRole: "miembro",
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Miembros del Grupo
            <Badge variant="secondary" className="ml-2">
              {relation.assignedItems.length} miembros
            </Badge>
          </CardTitle>
          <CardDescription>
            Docentes que forman parte de este grupo de investigación
          </CardDescription>
        </div>
        <Dialog open={relation.assignDialogOpen} onOpenChange={relation.setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={relation.unassignedItems.length === 0}>
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Miembro</DialogTitle>
              <DialogDescription>
                Selecciona un docente y asígnale un rol en este grupo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Docente</Label>
                <Select value={relation.selectedItemId} onValueChange={relation.setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {relation.unassignedItems.map((teacher) => (
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
                <Select value={relation.selectedRole} onValueChange={relation.setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => relation.setAssignDialogOpen(false)}
                disabled={relation.isAssigning}
              >
                Cancelar
              </Button>
              <Button onClick={relation.handleAssign} disabled={relation.isAssigning}>
                {relation.isAssigning ? (
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
        {relation.isLoadingItems ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : relation.assignedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay miembros asignados</p>
            <p className="text-sm">Agrega miembros usando el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-2">
            {relation.assignedItems.map((member) => {
              const roleInfo = ROLE_LABELS[member.role] || ROLE_LABELS.miembro;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {member.avatarUrl ? (
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.degree && (
                          <span className="text-muted-foreground">{member.degree} </span>
                        )}
                        {member.name}
                      </p>
                      {member.specialty && (
                        <p className="text-xs text-muted-foreground">{member.specialty}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(value) => relation.handleUpdateRole(member.id, value)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMBER_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => relation.handleRemove(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
