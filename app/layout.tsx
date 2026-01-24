import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BackgroundEffects } from "@/components/providers/BackgroundEffects";
import { Toaster } from "@/components/ui/sonner";
import { landingConfig } from "@/config/landing.config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: landingConfig.site.name,
  description: landingConfig.site.description,
  keywords: landingConfig.site.keywords,
  authors: [{ name: landingConfig.site.creator }],
  openGraph: {
    title: landingConfig.site.name,
    description: landingConfig.site.description,
    url: landingConfig.site.url,
    siteName: landingConfig.site.name,
    images: [
      {
        url: landingConfig.site.ogImage,
        width: 1200,
        height: 630,
        alt: landingConfig.site.name,
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: landingConfig.site.name,
    description: landingConfig.site.description,
    images: [landingConfig.site.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {/* Efectos de fondo config-driven (animated-bg, code-rain) */}
          <BackgroundEffects />
          {children}
          {/* Toast notifications */}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
