import { NextResponse } from "next/server";
import { prisma, notDeleted } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/stats - Obtener estadísticas del dashboard
export async function GET() {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener conteos en paralelo
    const [
      totalAnnouncements,
      publishedAnnouncements,
      totalDocuments,
      publishedDocuments,
      totalGalleryImages,
      publishedGalleryImages,
      totalUsers,
      totalDownloads,
      recentAnnouncements,
      recentDocuments,
    ] = await Promise.all([
      // Anuncios
      prisma.announcement.count({ where: notDeleted }),
      prisma.announcement.count({ where: { ...notDeleted, published: true } }),
      // Documentos
      prisma.document.count({ where: notDeleted }),
      prisma.document.count({ where: { ...notDeleted, published: true } }),
      // Galería
      prisma.galleryImage.count({ where: notDeleted }),
      prisma.galleryImage.count({ where: { ...notDeleted, published: true } }),
      // Usuarios
      prisma.user.count({ where: { ...notDeleted, active: true } }),
      // Total descargas
      prisma.document.aggregate({
        where: notDeleted,
        _sum: { downloads: true },
      }),
      // Últimos anuncios
      prisma.announcement.findMany({
        where: notDeleted,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          published: true,
          createdAt: true,
        },
      }),
      // Últimos documentos
      prisma.document.findMany({
        where: notDeleted,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          downloads: true,
          createdAt: true,
        },
      }),
    ]);

    // Estadísticas por tipo de anuncio
    const announcementsByType = await prisma.announcement.groupBy({
      by: ["type"],
      where: notDeleted,
      _count: { id: true },
    });

    // Estadísticas por categoría de documento
    const documentsByCategory = await prisma.document.groupBy({
      by: ["category"],
      where: notDeleted,
      _count: { id: true },
    });

    return NextResponse.json({
      data: {
        overview: {
          announcements: {
            total: totalAnnouncements,
            published: publishedAnnouncements,
            draft: totalAnnouncements - publishedAnnouncements,
          },
          documents: {
            total: totalDocuments,
            published: publishedDocuments,
            draft: totalDocuments - publishedDocuments,
            totalDownloads: totalDownloads._sum.downloads || 0,
          },
          gallery: {
            total: totalGalleryImages,
            published: publishedGalleryImages,
            draft: totalGalleryImages - publishedGalleryImages,
          },
          users: {
            total: totalUsers,
          },
        },
        byType: {
          announcements: announcementsByType.map((item) => ({
            type: item.type,
            count: item._count.id,
          })),
          documents: documentsByCategory.map((item) => ({
            category: item.category,
            count: item._count.id,
          })),
        },
        recent: {
          announcements: recentAnnouncements,
          documents: recentDocuments,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
