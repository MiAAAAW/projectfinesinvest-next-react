import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener usuario completo con roles
    const user = await prisma.user.findUnique({
      where: {
        id: authUser.id,
        deletedAt: null,
      },
      include: {
        roles: {
          where: { active: true },
          include: { role: true },
        },
      },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Usuario no encontrado o desactivado" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        roles: user.roles.map((ur) => ({
          code: ur.role.code,
          name: ur.role.name,
          context: ur.context,
        })),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
