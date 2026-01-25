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

  // ═══════════════════════════════════════════════════════════════════════════
  // DATOS DE CONTENIDO (LANDING)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n📚 Creando datos de contenido...");

  // --- LINEAS DE INVESTIGACION ---
  const lineas = await Promise.all([
    prisma.researchLine.upsert({
      where: { id: "seed-linea-ia" },
      update: {},
      create: {
        id: "seed-linea-ia",
        title: "Inteligencia Artificial Aplicada",
        description: "Investigacion en IA, Machine Learning y Deep Learning aplicados a problemas del mundo real.",
        icon: "Brain",
        published: true,
        order: 1,
      },
    }),
    prisma.researchLine.upsert({
      where: { id: "seed-linea-seguridad" },
      update: {},
      create: {
        id: "seed-linea-seguridad",
        title: "Seguridad Informatica",
        description: "Ciberseguridad, criptografia, analisis de vulnerabilidades y proteccion de sistemas.",
        icon: "Shield",
        published: true,
        order: 2,
      },
    }),
    prisma.researchLine.upsert({
      where: { id: "seed-linea-datos" },
      update: {},
      create: {
        id: "seed-linea-datos",
        title: "Ciencia de Datos y Big Data",
        description: "Analisis de grandes volumenes de datos, estadistica avanzada y visualizacion.",
        icon: "BarChart3",
        published: true,
        order: 3,
      },
    }),
    prisma.researchLine.upsert({
      where: { id: "seed-linea-iot" },
      update: {},
      create: {
        id: "seed-linea-iot",
        title: "Internet de las Cosas (IoT)",
        description: "Desarrollo de soluciones IoT, sensores inteligentes y automatizacion.",
        icon: "Cpu",
        published: true,
        order: 4,
      },
    }),
  ]);
  console.log(`  ✓ ${lineas.length} lineas de investigacion`);

  // --- DOCENTES ---
  const docentes = await Promise.all([
    prisma.teacher.upsert({
      where: { id: "seed-docente-1" },
      update: {},
      create: {
        id: "seed-docente-1",
        name: "Maria Elena Garcia Lopez",
        degree: "Dr.",
        email: "maria.garcia@universidad.edu.pe",
        phone: "+51 999 111 222",
        specialty: "Machine Learning y Redes Neuronales",
        bio: "Doctora en Ciencias de la Computacion. Mas de 15 anios de experiencia en IA.",
        orcid: "0000-0001-2345-6789",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
        published: true,
        order: 1,
      },
    }),
    prisma.teacher.upsert({
      where: { id: "seed-docente-2" },
      update: {},
      create: {
        id: "seed-docente-2",
        name: "Carlos Alberto Rodriguez Perez",
        degree: "Mg.",
        email: "carlos.rodriguez@universidad.edu.pe",
        phone: "+51 999 333 444",
        specialty: "Ciberseguridad y Ethical Hacking",
        bio: "Magister en Seguridad Informatica. Certificaciones CEH, OSCP y CISSP.",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        published: true,
        order: 2,
      },
    }),
    prisma.teacher.upsert({
      where: { id: "seed-docente-3" },
      update: {},
      create: {
        id: "seed-docente-3",
        name: "Ana Patricia Martinez Silva",
        degree: "PhD.",
        email: "ana.martinez@universidad.edu.pe",
        specialty: "Big Data y Estadistica Aplicada",
        bio: "PhD en Estadistica. Especialista en analisis predictivo y mineria de datos.",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
        published: true,
        order: 3,
      },
    }),
    prisma.teacher.upsert({
      where: { id: "seed-docente-4" },
      update: {},
      create: {
        id: "seed-docente-4",
        name: "Luis Fernando Fernandez Torres",
        degree: "Ing.",
        email: "luis.fernandez@universidad.edu.pe",
        specialty: "Sistemas Embebidos e IoT",
        bio: "Ingeniero Electronico con especializacion en sistemas embebidos.",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
        published: true,
        order: 4,
      },
    }),
  ]);
  console.log(`  ✓ ${docentes.length} docentes`);

  // --- ASIGNACIONES DOCENTE-LINEA ---
  const asignaciones = [
    { teacherId: "seed-docente-1", researchLineId: "seed-linea-ia", role: "coordinador" },
    { teacherId: "seed-docente-1", researchLineId: "seed-linea-datos", role: "investigador" },
    { teacherId: "seed-docente-2", researchLineId: "seed-linea-seguridad", role: "coordinador" },
    { teacherId: "seed-docente-3", researchLineId: "seed-linea-datos", role: "coordinador" },
    { teacherId: "seed-docente-3", researchLineId: "seed-linea-ia", role: "colaborador" },
    { teacherId: "seed-docente-4", researchLineId: "seed-linea-iot", role: "coordinador" },
    { teacherId: "seed-docente-4", researchLineId: "seed-linea-seguridad", role: "investigador" },
  ];

  for (const asig of asignaciones) {
    await prisma.teacherResearchLine.upsert({
      where: {
        teacherId_researchLineId: {
          teacherId: asig.teacherId,
          researchLineId: asig.researchLineId,
        },
      },
      update: { role: asig.role },
      create: asig,
    });
  }
  console.log(`  ✓ ${asignaciones.length} asignaciones docente-linea`);

  // --- ANUNCIOS ---
  await prisma.announcement.upsert({
    where: { id: "seed-anuncio-1" },
    update: {},
    create: {
      id: "seed-anuncio-1",
      title: "Convocatoria de Proyectos de Investigacion 2026",
      content: "Se abre la convocatoria para presentar proyectos de investigacion. Fecha limite: 28 de febrero.",
      type: "convocatoria",
      icon: "FileText",
      published: true,
      order: 1,
    },
  });
  await prisma.announcement.upsert({
    where: { id: "seed-anuncio-2" },
    update: {},
    create: {
      id: "seed-anuncio-2",
      title: "Seminario Internacional de IA",
      content: "Invitamos al Seminario Internacional de Inteligencia Artificial el 15 de marzo.",
      type: "evento",
      icon: "Calendar",
      published: true,
      order: 2,
    },
  });
  await prisma.announcement.upsert({
    where: { id: "seed-anuncio-3" },
    update: {},
    create: {
      id: "seed-anuncio-3",
      title: "Nuevo Reglamento de Lineas de Investigacion",
      content: "Se ha aprobado el nuevo reglamento. Consulta el documento en la seccion de documentos.",
      type: "comunicado",
      icon: "Bell",
      published: true,
      order: 3,
    },
  });
  console.log("  ✓ 3 anuncios");

  // --- DOCUMENTOS ---
  await prisma.document.upsert({
    where: { id: "seed-doc-1" },
    update: {},
    create: {
      id: "seed-doc-1",
      title: "Reglamento de Investigacion 2026",
      description: "Documento oficial con normas y procedimientos para la investigacion.",
      category: "reglamentos",
      fileUrl: "/docs/reglamento-2026.pdf",
      fileType: "pdf",
      fileSize: 2500000,
      downloads: 150,
      published: true,
      order: 1,
    },
  });
  await prisma.document.upsert({
    where: { id: "seed-doc-2" },
    update: {},
    create: {
      id: "seed-doc-2",
      title: "Formato de Proyecto de Investigacion",
      description: "Plantilla oficial para presentacion de proyectos.",
      category: "formatos",
      fileUrl: "/docs/formato-proyecto.docx",
      fileType: "doc",
      fileSize: 500000,
      downloads: 320,
      published: true,
      order: 2,
    },
  });
  console.log("  ✓ 2 documentos");

  // --- AUTORIDADES ---
  await prisma.authority.upsert({
    where: { id: "seed-autoridad-1" },
    update: {},
    create: {
      id: "seed-autoridad-1",
      name: "Dr. Roberto Jimenez Alvarez",
      position: "Director de Investigacion",
      email: "direccion@universidad.edu.pe",
      phone: "+51 1 234 5678",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      published: true,
      order: 1,
    },
  });
  await prisma.authority.upsert({
    where: { id: "seed-autoridad-2" },
    update: {},
    create: {
      id: "seed-autoridad-2",
      name: "Dra. Carmen Flores Rios",
      position: "Coordinadora General",
      email: "coordinacion@universidad.edu.pe",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
      published: true,
      order: 2,
    },
  });
  console.log("  ✓ 2 autoridades");

  // --- OFICINAS ---
  await prisma.office.upsert({
    where: { id: "seed-oficina-1" },
    update: {},
    create: {
      id: "seed-oficina-1",
      name: "Direccion de Investigacion",
      address: "Pabellon A, 3er piso, Oficina 301",
      phone: "+51 1 234 5678",
      email: "investigacion@universidad.edu.pe",
      schedule: "Lunes a Viernes: 8:00 - 17:00",
      published: true,
      order: 1,
    },
  });
  console.log("  ✓ 1 oficina");

  // --- GALERIA ---
  await prisma.galleryImage.upsert({
    where: { id: "seed-imagen-1" },
    update: {},
    create: {
      id: "seed-imagen-1",
      title: "Seminario IA 2025",
      description: "Participantes del seminario internacional de IA.",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      category: "eventos",
      published: true,
      order: 1,
    },
  });
  await prisma.galleryImage.upsert({
    where: { id: "seed-imagen-2" },
    update: {},
    create: {
      id: "seed-imagen-2",
      title: "Laboratorio de Investigacion",
      description: "Instalaciones del laboratorio de computacion avanzada.",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
      category: "instalaciones",
      published: true,
      order: 2,
    },
  });
  console.log("  ✓ 2 imagenes de galeria");

  // --- EVENTOS DE CALENDARIO ---
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);

  await prisma.calendarEvent.upsert({
    where: { id: "seed-evento-1" },
    update: {},
    create: {
      id: "seed-evento-1",
      title: "Seminario de IA",
      description: "Seminario internacional sobre avances en Inteligencia Artificial.",
      type: "investigacion",
      startDate: nextMonth,
      location: "Auditorio Principal",
      published: true,
    },
  });
  await prisma.calendarEvent.upsert({
    where: { id: "seed-evento-2" },
    update: {},
    create: {
      id: "seed-evento-2",
      title: "Fecha limite - Proyectos",
      description: "Ultimo dia para presentar proyectos de investigacion.",
      type: "deadline",
      startDate: new Date(today.getFullYear(), today.getMonth() + 1, 28),
      allDay: true,
      published: true,
    },
  });
  console.log("  ✓ 2 eventos de calendario");

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
