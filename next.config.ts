import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIMIZACIÓN DE IMPORTS PARA DESARROLLO RÁPIDO
  // Reduce módulos de lucide-react: 1583 → 333 módulos
  // Reduce tiempo de HMR y navegación entre páginas
  // ═══════════════════════════════════════════════════════════════════════════
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "framer-motion",
      "date-fns",
      "class-variance-authority",
    ],
  },
};

export default nextConfig;
