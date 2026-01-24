// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE CONFIGURATION
// FINESI - Dirección de Investigación
// Facultad de Ingeniería Estadística e Informática
// ═══════════════════════════════════════════════════════════════════════════════

import type { LandingConfig } from "@/types/landing.types";

export const landingConfig: LandingConfig = {
  // ─────────────────────────────────────────────────────────────────────────────
  // UI STRINGS (Textos de interfaz centralizados)
  // ─────────────────────────────────────────────────────────────────────────────
  ui: {
    // Common
    readMore: "Leer más",
    viewAll: "Ver todo",
    download: "Descargar",
    close: "Cerrar",
    previous: "Anterior",
    next: "Siguiente",
    search: "Buscar",
    noResults: "No se encontraron resultados",
    loading: "Cargando...",

    // Theme
    lightMode: "Modo claro",
    darkMode: "Modo oscuro",

    // Announcements
    newLabel: "Nuevo",

    // Documents
    searchDocuments: "Buscar documentos...",
    noDocumentsFound: "No se encontraron documentos",
    allCategories: "Todos",

    // FAQ
    faqContactTitle: "¿No encontraste lo que buscabas?",
    faqContactDescription: "Contáctanos directamente y te ayudaremos con tu consulta.",
    faqContactButton: "Contactar",

    // Gallery
    imageOf: "de",

    // Newsletter
    newsletterTitle: "Mantente actualizado",
    newsletterPlaceholder: "tu@email.com",
    newsletterButton: "Suscribirse",

    // Accessibility
    toggleMenu: "Abrir menú",
    toggleTheme: "Cambiar tema",
    scrollDown: "Desplazar hacia abajo",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SITE METADATA
  // ─────────────────────────────────────────────────────────────────────────────
  site: {
    name: "FINESI - Dirección de Investigación",
    description: "Dirección de Investigación de la Facultad de Ingeniería Estadística e Informática - Universidad Nacional del Altiplano",
    url: "https://finesi.unap.edu.pe/investigacion",
    ogImage: "/og-image.png",
    creator: "FINESI - UNA Puno",
    keywords: [
      "FINESI",
      "investigación",
      "estadística",
      "informática",
      "UNA Puno",
      "universidad",
      "facultad",
      "ingeniería",
    ],
    links: {
      // Redes sociales institucionales
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────────
  navigation: {
    logo: {
      text: "FINESI Investigación",
      icon: "GraduationCap",
      href: "/",
    },
    items: [
      { label: "Inicio", href: "#" },
      { label: "Anuncios", href: "#announcements" },
      { label: "Líneas de Investigación", href: "#research" },
      { label: "Documentos", href: "#documents" },
      { label: "Calendario", href: "#calendar" },
      { label: "Galería", href: "#gallery" },
      { label: "Autoridades", href: "#authorities" },
      { label: "Oficinas", href: "#offices" },
      // { label: "FAQ", href: "#faq" }, // COMENTADO: FAQ desactivado
    ],
    cta: {
      text: "Contactar",
      href: "#offices",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // HERO SECTION
  // ─────────────────────────────────────────────────────────────────────────────
  hero: {
    badge: {
      text: "Dirección de Investigación",
      variant: "outline",
    },
    title: {
      main: "Portal de Investigación",
      highlight: "FINESI",
      suffix: "",
    },
    description:
      "Sistema integral de seguimiento de proyectos de investigación científica y tecnológica de la Facultad de Ingeniería Estadística e Informática - UNA Puno.",
    cta: {
      primary: {
        text: "Ver Convocatorias",
        href: "#announcements",
      },
      secondary: {
        text: "Líneas de Investigación",
        href: "#research",
      },
    },
    enable3D: false,
    image: {
      light: "/images/gallery/facultadfoto.png",
      dark: "/images/gallery/facultadfotonoche.png",
      alt: "Facultad de Ingeniería Estadística e Informática - FINESI",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ANNOUNCEMENTS (Anuncios/Noticias)
  // ─────────────────────────────────────────────────────────────────────────────
  announcements: {
    badge: "Actualidad",
    title: "Anuncios y Convocatorias",
    subtitle: "Mantente informado sobre las últimas novedades de investigación",
    showViewAll: true,
    viewAllHref: "/anuncios",
    items: [
      {
        id: "1",
        title: "Convocatoria FEDU 2026 - Proyectos de Investigación",
        date: "2026-01-15",
        type: "convocatoria",
        content: "Se apertura la convocatoria para proyectos de investigación financiados por FEDU. Fecha límite de presentación: 28 de febrero de 2026.",
        excerpt: "Convocatoria abierta para proyectos de investigación FEDU 2026",
        icon: "FileText",
        important: true,
        href: "/anuncios/fedu-2026",
      },
      {
        id: "2",
        title: "Taller de Redacción Científica - Inscripciones Abiertas",
        date: "2026-01-10",
        type: "evento",
        content: "El taller se realizará del 20 al 24 de enero. Dirigido a docentes y estudiantes de pregrado y posgrado.",
        excerpt: "Inscripciones abiertas para el taller de redacción científica",
        icon: "Calendar",
        href: "/anuncios/taller-redaccion",
      },
      {
        id: "3",
        title: "Publicación de Revista FINESI Vol. 12",
        date: "2026-01-05",
        type: "noticia",
        content: "Ya está disponible el nuevo volumen de la Revista de Investigación FINESI con artículos de investigadores de la facultad.",
        excerpt: "Nuevo volumen de la revista institucional disponible",
        icon: "BookOpen",
        href: "/anuncios/revista-vol12",
      },
      {
        id: "4",
        title: "Actualización de Formatos de Proyectos 2026",
        date: "2026-01-02",
        type: "comunicado",
        content: "Se han actualizado los formatos para la presentación de proyectos de investigación. Descargar desde la sección de documentos.",
        excerpt: "Nuevos formatos disponibles para descargar",
        icon: "Download",
        href: "#documents",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RESEARCH LINES (Líneas de Investigación)
  // ─────────────────────────────────────────────────────────────────────────────
  research: {
    badge: "Investigación",
    title: "Líneas de Investigación",
    subtitle: "Áreas prioritarias de investigación de la facultad",
    columns: 3,
    items: [
      {
        id: "1",
        title: "Inteligencia Artificial y Machine Learning",
        description: "Desarrollo de algoritmos y modelos de aprendizaje automático aplicados a problemas regionales y nacionales.",
        icon: "Brain",
        coordinator: "Dr. Juan Pérez Mamani",
        members: 12,
        href: "/lineas/inteligencia-artificial",
      },
      {
        id: "2",
        title: "Estadística Aplicada y Bioestadística",
        description: "Aplicación de métodos estadísticos avanzados en investigación biomédica, social y económica.",
        icon: "BarChart3",
        coordinator: "Dra. María Quispe Huanca",
        members: 8,
        href: "/lineas/estadistica-aplicada",
      },
      {
        id: "3",
        title: "Sistemas de Información y Big Data",
        description: "Diseño e implementación de sistemas de información y análisis de grandes volúmenes de datos.",
        icon: "Database",
        coordinator: "Mg. Carlos Condori Apaza",
        members: 10,
        href: "/lineas/sistemas-informacion",
      },
      {
        id: "4",
        title: "Ingeniería de Software",
        description: "Metodologías y buenas prácticas en el desarrollo de software de calidad.",
        icon: "Code",
        coordinator: "Dr. Roberto Flores Choque",
        members: 15,
        href: "/lineas/ingenieria-software",
      },
      {
        id: "5",
        title: "Seguridad Informática y Redes",
        description: "Investigación en ciberseguridad, criptografía y arquitecturas de redes seguras.",
        icon: "Shield",
        coordinator: "Mg. Ana Mamani Ccama",
        members: 6,
        href: "/lineas/seguridad-informatica",
      },
      {
        id: "6",
        title: "Tecnologías Emergentes",
        description: "Exploración de IoT, blockchain, realidad virtual y otras tecnologías innovadoras.",
        icon: "Cpu",
        coordinator: "Dr. Luis Ticona Ramos",
        members: 9,
        href: "/lineas/tecnologias-emergentes",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DOCUMENTS (Documentos y Formatos)
  // ─────────────────────────────────────────────────────────────────────────────
  documents: {
    badge: "Descargas",
    title: "Documentos y Formatos",
    subtitle: "Reglamentos, formatos y documentos institucionales",
    showSearch: true,
    categories: ["reglamentos", "formatos", "manuales", "investigacion"],
    items: [
      {
        id: "1",
        title: "Reglamento de Investigación FINESI 2026",
        description: "Normativa vigente para proyectos de investigación",
        fileUrl: "/docs/reglamento-investigacion-2026.pdf",
        fileType: "pdf",
        fileSize: "2.5 MB",
        category: "reglamentos",
        updatedAt: "2026-01-01",
      },
      {
        id: "2",
        title: "Formato de Proyecto de Investigación",
        description: "Plantilla para presentar proyectos de investigación",
        fileUrl: "/docs/formato-proyecto.docx",
        fileType: "doc",
        fileSize: "156 KB",
        category: "formatos",
        updatedAt: "2026-01-02",
      },
      {
        id: "3",
        title: "Formato de Informe Final",
        description: "Plantilla para el informe final de investigación",
        fileUrl: "/docs/formato-informe-final.docx",
        fileType: "doc",
        fileSize: "180 KB",
        category: "formatos",
        updatedAt: "2026-01-02",
      },
      {
        id: "4",
        title: "Formato de Presupuesto",
        description: "Plantilla para el presupuesto de proyectos",
        fileUrl: "/docs/formato-presupuesto.xlsx",
        fileType: "xls",
        fileSize: "45 KB",
        category: "formatos",
        updatedAt: "2026-01-02",
      },
      {
        id: "5",
        title: "Manual de Publicaciones Científicas",
        description: "Guía para la publicación de artículos científicos",
        fileUrl: "/docs/manual-publicaciones.pdf",
        fileType: "pdf",
        fileSize: "1.8 MB",
        category: "manuales",
        updatedAt: "2025-12-15",
      },
      {
        id: "6",
        title: "Líneas de Investigación Aprobadas",
        description: "Documento oficial de líneas de investigación",
        fileUrl: "/docs/lineas-investigacion.pdf",
        fileType: "pdf",
        fileSize: "890 KB",
        category: "investigacion",
        updatedAt: "2025-11-20",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // OFFICES (Oficinas y Contacto)
  // ─────────────────────────────────────────────────────────────────────────────
  offices: {
    badge: "Contacto",
    title: "Oficinas",
    subtitle: "Información de contacto y ubicación",
    showMap: true,
    items: [
      {
        id: "1",
        name: "Dirección de Investigación",
        description: "Oficina principal de la Dirección de Investigación FINESI",
        location: "Pabellón de Ingeniería, 2do piso, Of. 201",
        building: "Pabellón de Ingeniería",
        floor: "2do piso",
        schedule: {
          days: "Lunes a Viernes",
          hours: "8:00 AM - 4:00 PM",
        },
        phone: "(051) 123-4567",
        email: "investigacion.finesi@unap.edu.pe",
        icon: "Building2",
        responsible: "Dr. Pedro Mamani Quispe",
      },
      {
        id: "2",
        name: "Unidad de Proyectos",
        description: "Gestión y seguimiento de proyectos de investigación",
        location: "Pabellón de Ingeniería, 2do piso, Of. 203",
        building: "Pabellón de Ingeniería",
        floor: "2do piso",
        schedule: {
          days: "Lunes a Viernes",
          hours: "8:00 AM - 1:00 PM",
        },
        phone: "(051) 123-4568",
        email: "proyectos.finesi@unap.edu.pe",
        icon: "FolderOpen",
        responsible: "Mg. Rosa Condori Apaza",
      },
      {
        id: "3",
        name: "Laboratorio de Investigación",
        description: "Laboratorio de cómputo para investigación",
        location: "Pabellón de Ingeniería, 1er piso, Lab. 105",
        building: "Pabellón de Ingeniería",
        floor: "1er piso",
        schedule: {
          days: "Lunes a Sábado",
          hours: "7:00 AM - 9:00 PM",
        },
        phone: "(051) 123-4569",
        email: "laboratorio.finesi@unap.edu.pe",
        icon: "Monitor",
        responsible: "Ing. José Ticona Huanca",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTHORITIES (Autoridades)
  // ─────────────────────────────────────────────────────────────────────────────
  authorities: {
    badge: "Equipo",
    title: "Autoridades",
    subtitle: "Equipo de la Dirección de Investigación",
    members: [
      {
        id: "1",
        name: "Dr. Pedro Mamani Quispe",
        role: "Director de Investigación",
        department: "FINESI",
        avatar: "/team/director.jpg",
        bio: "Doctor en Ciencias de la Computación con más de 15 años de experiencia en investigación.",
        email: "pmamani@unap.edu.pe",
        officeHours: "Lunes y Miércoles 10:00 AM - 12:00 PM",
        social: {
          orcid: "https://orcid.org/0000-0001-2345-6789",
          googleScholar: "https://scholar.google.com/citations?user=example",
        },
      },
      {
        id: "2",
        name: "Dra. María Quispe Huanca",
        role: "Coordinadora de Líneas de Investigación",
        department: "Escuela Profesional de Estadística",
        avatar: "/team/coordinadora.jpg",
        bio: "Doctora en Estadística, especialista en bioestadística y análisis multivariado.",
        email: "mquispe@unap.edu.pe",
        officeHours: "Martes y Jueves 2:00 PM - 4:00 PM",
        social: {
          orcid: "https://orcid.org/0000-0002-3456-7890",
        },
      },
      {
        id: "3",
        name: "Mg. Carlos Condori Apaza",
        role: "Coordinador de Proyectos",
        department: "Escuela Profesional de Ingeniería Estadística e Informática",
        avatar: "/team/coordinador-proyectos.jpg",
        bio: "Magíster en Ingeniería de Sistemas, experto en gestión de proyectos de I+D.",
        email: "ccondori@unap.edu.pe",
        officeHours: "Lunes a Viernes 8:00 AM - 10:00 AM",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CALENDAR (Calendario de Eventos)
  // Datos vienen de la API/Base de datos - items vacío como fallback
  // ─────────────────────────────────────────────────────────────────────────────
  calendar: {
    badge: "Calendario",
    title: "Próximos Eventos",
    subtitle: "Fechas importantes del semestre académico",
    groupByMonth: true,
    items: [], // Datos desde API - ver /admin/calendar para gestionar
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // GALLERY (Galería de Fotos)
  // Datos vienen de la API/Base de datos - items vacío como fallback
  // ─────────────────────────────────────────────────────────────────────────────
  gallery: {
    badge: "Galería",
    title: "Actividades y Eventos",
    subtitle: "Momentos destacados de nuestra comunidad investigadora",
    columns: 3,
    showLightbox: true,
    items: [], // Datos desde API - ver /admin/gallery para gestionar
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FAQ (Preguntas Frecuentes Institucionales)
  // ─────────────────────────────────────────────────────────────────────────────
  faq: {
    badge: "FAQ",
    title: "Preguntas Frecuentes",
    subtitle: "Información sobre trámites y procedimientos",
    contactLink: {
      text: "¿Tienes más preguntas? Visítanos en la oficina",
      href: "#offices",
    },
    items: [
      {
        id: "1",
        question: "¿Cómo puedo presentar un proyecto de investigación?",
        answer: "Para presentar un proyecto de investigación debes descargar los formatos correspondientes de la sección de Documentos, completarlos según el reglamento vigente y presentarlos en la Dirección de Investigación dentro de las fechas de convocatoria.",
      },
      {
        id: "2",
        question: "¿Cuáles son los requisitos para participar en convocatorias FEDU?",
        answer: "Los docentes ordinarios de la facultad pueden participar en las convocatorias FEDU. Deben contar con título profesional, estar registrados en DINA/CTI Vitae, y el proyecto debe estar alineado a las líneas de investigación aprobadas.",
      },
      {
        id: "3",
        question: "¿Los estudiantes pueden participar en proyectos de investigación?",
        answer: "Sí, los estudiantes de pregrado y posgrado pueden participar como colaboradores en proyectos de investigación. Deben estar matriculados regularmente y contar con el aval de un docente investigador responsable.",
      },
      {
        id: "4",
        question: "¿Cuál es el proceso para publicar en la Revista FINESI?",
        answer: "Los artículos deben enviarse al correo de la revista siguiendo las normas de publicación disponibles en la sección de Documentos. El artículo pasará por revisión de pares (peer review) antes de su aceptación.",
      },
      {
        id: "5",
        question: "¿Dónde puedo consultar el estado de mi proyecto?",
        answer: "Puedes consultar el estado de tu proyecto en la Unidad de Proyectos (Of. 203) o enviando un correo a proyectos.finesi@unap.edu.pe con el código de tu proyecto.",
      },
      {
        id: "6",
        question: "¿Cómo accedo a los laboratorios de investigación?",
        answer: "El acceso al laboratorio de investigación requiere solicitud previa en la Dirección de Investigación. Los docentes con proyectos activos tienen acceso prioritario. Los estudiantes deben contar con autorización de su asesor.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────────────────────────────────────────
  footer: {
    logo: {
      text: "FINESI",
      icon: "GraduationCap",
    },
    description:
      "Dirección de Investigación de la Facultad de Ingeniería Estadística e Informática - Universidad Nacional del Altiplano, Puno.",
    columns: [
      {
        title: "Navegación",
        links: [
          { text: "Inicio", href: "#" },
          { text: "Anuncios", href: "#announcements" },
          { text: "Investigación", href: "#research" },
          { text: "Documentos", href: "#documents" },
        ],
      },
      {
        title: "Recursos",
        links: [
          { text: "Calendario", href: "#calendar" },
          { text: "Galería", href: "#gallery" },
          { text: "Autoridades", href: "#authorities" },
          { text: "Oficinas", href: "#offices" },
        ],
      },
      {
        title: "Contacto",
        links: [
          { text: "Email", href: "#" }, // TODO: Reemplazar con email real
          { text: "Teléfono", href: "#" }, // TODO: Reemplazar con teléfono real
        ],
      },
      {
        title: "Universidad",
        links: [
          { text: "UNA Puno", href: "#", external: true }, // TODO: URL oficial
          { text: "FINESI", href: "#", external: true }, // TODO: URL oficial
          { text: "VRIP", href: "#", external: true }, // TODO: URL oficial
        ],
      },
    ],
    copyright: "© 2026 FINESI - Universidad Nacional del Altiplano. Todos los derechos reservados.",
    bottomLinks: [
      { text: "Portal UNA", href: "#", external: true }, // TODO: URL oficial
      { text: "VRIP", href: "#", external: true }, // TODO: URL oficial
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3D GLOBAL CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  scene3D: {
    type: "geometric",
    enabled: true,
    options: {
      color: "#1e40af", // Azul institucional
      intensity: 0.6,
      speed: 0.3,
      count: 40,
      interactive: true,
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BACKGROUND EFFECTS CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  backgroundEffects: {
    animatedBackground: {
      enabled: true,
      className: "animated-bg",
    },
    codeRain: {
      enabled: true,
      opacity: 0.6,
      zIndex: 5,
    },
  },
};
