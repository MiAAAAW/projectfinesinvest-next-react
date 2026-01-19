"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// Panel principal con estadísticas y accesos rápidos
// Conectado a API real con PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Download,
  ArrowRight,
  Plus,
  Megaphone,
  FileText,
  ImageIcon,
  Calendar,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/lib/admin-constants";

interface Stats {
  overview: {
    announcements: { total: number; published: number; draft: number };
    documents: { total: number; published: number; draft: number; totalDownloads: number };
    gallery: { total: number; published: number; draft: number };
    users: { total: number };
  };
  recent: {
    announcements: Array<{
      id: string;
      title: string;
      type: string;
      published: boolean;
      createdAt: string;
    }>;
    documents: Array<{
      id: string;
      title: string;
      category: string;
      downloads: number;
      createdAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const json = await res.json();
          setStats(json.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardStats = stats
    ? [
        {
          title: "Total Anuncios",
          value: stats.overview.announcements.total,
          description: `${stats.overview.announcements.published} publicados`,
          icon: Megaphone,
        },
        {
          title: "Documentos",
          value: stats.overview.documents.total,
          description: `${stats.overview.documents.totalDownloads} descargas`,
          icon: FileText,
        },
        {
          title: "Imágenes Galería",
          value: stats.overview.gallery.total,
          description: `${stats.overview.gallery.published} publicadas`,
          icon: ImageIcon,
        },
        {
          title: "Usuarios",
          value: stats.overview.users.total,
          description: "Usuarios activos",
          icon: Users,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido al panel de administración de FINESI
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Ver Landing
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/announcements/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Anuncio
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : dashboardStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Anuncios Recientes</CardTitle>
              <CardDescription>Últimos anuncios publicados</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/announcements">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recent.announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay anuncios aún
              </p>
            ) : (
              <div className="space-y-4">
                {stats?.recent.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/announcements/${announcement.id}`}
                        className="font-medium hover:underline truncate block"
                      >
                        {announcement.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={ANNOUNCEMENT_TYPE_LABELS[announcement.type]?.color}
                        >
                          {ANNOUNCEMENT_TYPE_LABELS[announcement.type]?.label || announcement.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString("es-PE")}
                        </span>
                      </div>
                    </div>
                    {!announcement.published && (
                      <Badge variant="outline">Borrador</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Documentos Recientes</CardTitle>
              <CardDescription>Últimos documentos agregados</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/documents">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recent.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay documentos aún
              </p>
            ) : (
              <div className="space-y-4">
                {stats?.recent.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/documents/${doc.id}`}
                          className="font-medium hover:underline truncate block"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {doc.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Download className="h-4 w-4" />
                      {doc.downloads}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/admin/announcements/new">
                <Megaphone className="h-6 w-6 mb-2" />
                <span>Nuevo Anuncio</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/admin/documents/new">
                <FileText className="h-6 w-6 mb-2" />
                <span>Subir Documento</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/admin/gallery/new">
                <ImageIcon className="h-6 w-6 mb-2" />
                <span>Agregar Imagen</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/admin/content">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Editar Contenido</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
