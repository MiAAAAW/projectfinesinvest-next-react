// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CONSTANTS - Re-export from lib/constants for backwards compatibility
// ═══════════════════════════════════════════════════════════════════════════════

export * from "./constants";

// Legacy compat exports
import { DASHBOARD_ITEM, LANDING_SECTIONS } from "./constants/sidebar";

export const MAIN_MENU_ITEMS = [
  DASHBOARD_ITEM,
  ...LANDING_SECTIONS.filter(s => s.type === "crud"),
] as const;

export const CONTENT_SECTIONS = LANDING_SECTIONS
  .filter(s => s.type === "content")
  .map(({ title, url }) => ({ title, url }));
