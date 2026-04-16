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
      // Cloudflare R2 public buckets — cubre cualquier bucket pub-*.r2.dev
      // (incluye el actual del proyecto y futuros si se rotan credenciales).
      {
        protocol: "https",
        hostname: "*.r2.dev",
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
