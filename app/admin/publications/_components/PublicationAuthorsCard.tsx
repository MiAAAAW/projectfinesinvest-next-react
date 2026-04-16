"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PublicationAuthor, Teacher } from "./types";

interface PublicationAuthorsCardProps {
  publicationId: string;
  authors: PublicationAuthor[];
  setAuthors: React.Dispatch<React.SetStateAction<PublicationAuthor[]>>;
  teachers: Teacher[];
}

export function PublicationAuthorsCard({
  publicationId,
  authors,
  setAuthors,
  teachers,
}: PublicationAuthorsCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [order, setOrder] = useState((authors.length + 1).toString());
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`/api/publications/${publicationId}/authors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          teacherId: teacherId || null,
          order: parseInt(order) || authors.length + 1,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al agregar autor");
      }

      setAuthors((prev) => [...prev, json.data].sort((a, b) => a.order - b.order));
      setName("");
      setTeacherId("");
      setOrder((authors.length + 2).toString());
      setShowForm(false);
      toast.success("Autor agregado");
    } catch (error) {
      console.error("Error adding author:", error);
      toast.error(error instanceof Error ? error.message : "Error al agregar autor");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (authorId: string) => {
    setRemovingId(authorId);
    try {
      const res = await fetch(`/api/publications/${publicationId}/authors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al remover autor");
      }

      setAuthors((prev) => prev.filter((a) => a.id !== authorId));
      toast.success("Autor removido");
    } catch (error) {
      console.error("Error removing author:", error);
      toast.error("Error al remover autor");
    } finally {
      setRemovingId(null);
    }
  };

  const handleTeacherSelect = (value: string) => {
    setTeacherId(value === "none" ? "" : value);
    if (value !== "none") {
      const teacher = teachers.find((t) => t.id === value);
      if (teacher && !name.trim()) {
        setName(teacher.name);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Autores</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar autor
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="space-y-2">
              <Label htmlFor="author-teacher">Docente vinculado (opcional)</Label>
              <Select
                value={teacherId || "none"}
                onValueChange={handleTeacherSelect}
              >
                <SelectTrigger id="author-teacher">
                  <SelectValue placeholder="Seleccionar docente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Autor externo</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="author-name">Nombre *</Label>
                <Input
                  id="author-name"
                  placeholder="Nombre del autor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author-order">Orden</Label>
                <Input
                  id="author-order"
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAdd}
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Agregar
              </Button>
            </div>
          </div>
        )}

        {authors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay autores asignados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Orden</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Docente vinculado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="text-muted-foreground">
                    {author.order}
                  </TableCell>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell>
                    {author.teacher ? (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <UserCheck className="h-3 w-3" />
                        {author.teacher.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Externo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(author.id)}
                      disabled={removingId === author.id}
                    >
                      {removingId === author.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                      <span className="sr-only">Remover</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
