// ═══════════════════════════════════════════════════════════════════════════════
// SITE NAVIGATION CONFIGURATION
// Fuente única de verdad para la jerarquía del sitio.
// Usado por: Navbar, SectionPage (breadcrumb, back link, sidebar, tabs), Footer.
//
// Convención:
// - `path` siempre absoluto desde root
// - `label` es el texto visible al usuario
// - `children` es opcional (solo si la sección tiene hermanas navegables)
// ═══════════════════════════════════════════════════════════════════════════════

export interface NavItem {
  label: string;
  path: string;
}

export interface NavSection extends NavItem {
  children?: Record<string, NavItem>;
}

export const siteNav = {
  home: { label: "Inicio", path: "/" },

  sections: {
    investigacion: {
      label: "Investigación",
      path: "/#research",
      children: {
        grupos: { label: "Grupos", path: "/investigacion/grupos" },
        semilleros: { label: "Semilleros", path: "/investigacion/semilleros" },
        publicaciones: { label: "Publicaciones", path: "/investigacion/publicaciones" },
        posters: { label: "Posters FINESI", path: "/investigacion/posters" },
        docentes: { label: "Docentes", path: "/investigacion/docentes" },
        etica: { label: "Ética", path: "/investigacion/etica" },
      },
    },
    resoluciones: {
      label: "Resoluciones",
      path: "/#documents",
      children: {
        decanales: { label: "Decanales", path: "/resoluciones/decanales" },
        rectorales: { label: "Rectorales", path: "/resoluciones/rectorales" },
      },
    },
    convenios: { label: "Convenios", path: "/convenios" },
    posgrado: { label: "Posgrado", path: "/posgrado" },
    acreditacion: { label: "Acreditación", path: "/acreditacion" },
  },
} as const satisfies {
  home: NavItem;
  sections: Record<string, NavSection>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DERIVADOS (autocompletado en props)
// ═══════════════════════════════════════════════════════════════════════════════

export type SectionId = keyof typeof siteNav.sections;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Devuelve la sección por id con tipado seguro */
export function getSection(id: SectionId): NavSection {
  return siteNav.sections[id];
}

/** Obtiene los children como array (preservando el orden del objeto) */
export function getSectionChildren(id: SectionId): NavItem[] {
  const section = siteNav.sections[id];
  return "children" in section && section.children
    ? Object.values(section.children)
    : [];
}

/** Encuentra la sección cuyo `path` o cuyos children coincidan con el pathname */
export function findSectionByPath(pathname: string): {
  section: NavSection;
  sectionId: SectionId;
  child?: NavItem;
} | null {
  for (const [id, section] of Object.entries(siteNav.sections) as [SectionId, NavSection][]) {
    if (section.children) {
      for (const child of Object.values(section.children)) {
        if (pathname === child.path || pathname.startsWith(child.path + "/")) {
          return { section, sectionId: id, child };
        }
      }
    }
    if (pathname === section.path || pathname.startsWith(section.path + "/")) {
      return { section, sectionId: id };
    }
  }
  return null;
}
