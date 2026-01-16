"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// THEME PROVIDER
// Wrapper para next-themes con configuración de dark mode
// ═══════════════════════════════════════════════════════════════════════════════

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
