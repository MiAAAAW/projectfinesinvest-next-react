import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcryptjs";

// Crear pool de conexión PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Crear adapter y cliente Prisma
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ═══════════════════════════════════════════════════════════════════════════
  // CREAR ROLES BASE
  // ═══════════════════════════════════════════════════════════════════════════

  const roles = [
    {
      code: "super_admin",
      name: "Super Administrador",
      description: "Acceso total al sistema",
      color: "#DC2626",
      icon: "Shield",
      isSystem: true,
    },
    {
      code: "admin",
      name: "Administrador",
      description: "Administración general",
      color: "#2563EB",
      icon: "UserCog",
      isSystem: true,
    },
    {
      code: "staff",
      name: "Personal",
      description: "Personal administrativo",
      color: "#059669",
      icon: "Briefcase",
      isSystem: false,
    },
    {
      code: "docente",
      name: "Docente",
      description: "Docente investigador",
      color: "#7C3AED",
      icon: "GraduationCap",
      isSystem: false,
    },
    {
      code: "estudiante",
      name: "Estudiante",
      description: "Estudiante de investigación",
      color: "#F59E0B",
      icon: "BookOpen",
      isSystem: false,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
    console.log(`  ✓ Rol: ${role.name}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREAR PERMISOS BASE
  // ═══════════════════════════════════════════════════════════════════════════

  const permissions = [
    // Landing
    { code: "landing.announcements.read", module: "landing", action: "read", name: "Ver anuncios" },
    { code: "landing.announcements.create", module: "landing", action: "create", name: "Crear anuncios" },
    { code: "landing.announcements.update", module: "landing", action: "update", name: "Editar anuncios" },
    { code: "landing.announcements.delete", module: "landing", action: "delete", name: "Eliminar anuncios" },
    { code: "landing.documents.read", module: "landing", action: "read", name: "Ver documentos" },
    { code: "landing.documents.create", module: "landing", action: "create", name: "Subir documentos" },
    { code: "landing.documents.update", module: "landing", action: "update", name: "Editar documentos" },
    { code: "landing.documents.delete", module: "landing", action: "delete", name: "Eliminar documentos" },
    { code: "landing.gallery.read", module: "landing", action: "read", name: "Ver galería" },
    { code: "landing.gallery.create", module: "landing", action: "create", name: "Subir imágenes" },
    { code: "landing.gallery.update", module: "landing", action: "update", name: "Editar imágenes" },
    { code: "landing.gallery.delete", module: "landing", action: "delete", name: "Eliminar imágenes" },
    { code: "landing.content.read", module: "landing", action: "read", name: "Ver contenido" },
    { code: "landing.content.update", module: "landing", action: "update", name: "Editar contenido" },
    // Usuarios
    { code: "users.read", module: "users", action: "read", name: "Ver usuarios" },
    { code: "users.create", module: "users", action: "create", name: "Crear usuarios" },
    { code: "users.update", module: "users", action: "update", name: "Editar usuarios" },
    { code: "users.delete", module: "users", action: "delete", name: "Eliminar usuarios" },
    { code: "users.roles.manage", module: "users", action: "manage", name: "Gestionar roles de usuarios" },
    // Roles
    { code: "roles.read", module: "roles", action: "read", name: "Ver roles" },
    { code: "roles.create", module: "roles", action: "create", name: "Crear roles" },
    { code: "roles.update", module: "roles", action: "update", name: "Editar roles" },
    { code: "roles.delete", module: "roles", action: "delete", name: "Eliminar roles" },
    { code: "roles.permissions.manage", module: "roles", action: "manage", name: "Gestionar permisos" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
  }
  console.log(`  ✓ ${permissions.length} permisos creados`);

  // ═══════════════════════════════════════════════════════════════════════════
  // ASIGNAR TODOS LOS PERMISOS A SUPER_ADMIN
  // ═══════════════════════════════════════════════════════════════════════════

  const superAdminRole = await prisma.role.findUnique({
    where: { code: "super_admin" },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole!.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole!.id,
        permissionId: perm.id,
      },
    });
  }
  console.log(`  ✓ Permisos asignados a Super Admin`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CREAR USUARIOS ADMIN INICIALES
  // ═══════════════════════════════════════════════════════════════════════════

  const adminPassword = await bcrypt.hash("123123123", 12);

  const admins = [
    { email: "admin@gmail.com", name: "Administrador" },
    { email: "hts.ez.v@gmail.com", name: "HTS Admin" },
  ];

  for (const admin of admins) {
    const adminUser = await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        passwordHash: adminPassword,
        name: admin.name,
        active: true,
        verified: true,
      },
    });

    // Verificar si ya tiene el rol asignado
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId: adminUser.id,
        roleId: superAdminRole!.id,
        context: null,
      },
    });

    // Asignar rol super_admin solo si no existe
    if (!existingRole) {
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: superAdminRole!.id,
          active: true,
          context: null,
        },
      });
    }

    console.log(`  ✓ Usuario admin creado: ${admin.email} / 123123123`);
  }

  console.log("\n✅ Seed completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
