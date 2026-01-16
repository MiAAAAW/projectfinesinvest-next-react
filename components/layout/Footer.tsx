"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER COMPONENT - ENHANCED
// Pie de página profesional con animaciones y diseño moderno
// Inspirado en Launch UI + Linkify
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import {
  DynamicIcon,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ArrowRight,
  Heart,
} from "@/lib/icons";
import type { FooterConfig } from "@/types/landing.types";
import Link from "next/link";
import { motion } from "framer-motion";

interface FooterProps {
  config: FooterConfig;
  className?: string;
}

const socialIcons: Record<string, typeof Github> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function Footer({ config, className }: FooterProps) {
  const { logo, description, columns, social, copyright, bottomLinks } = config;

  return (
    <footer
      className={cn(
        "relative border-t overflow-hidden",
        "bg-gradient-to-b from-background via-muted/20 to-muted/40",
        className
      )}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 py-16 md:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-12 md:grid-cols-2 lg:grid-cols-6"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {logo && (
              <Link href="/" className="inline-flex items-center space-x-2 group">
                {logo.icon && (
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <DynamicIcon
                      name={logo.icon}
                      className="h-7 w-7 text-primary transition-colors group-hover:text-primary/80"
                    />
                  </motion.div>
                )}
                <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {logo.text}
                </span>
              </Link>
            )}

            {description && (
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {description}
              </p>
            )}

            {/* Newsletter signup (optional visual) */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Mantente actualizado</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className={cn(
                    "flex-1 px-4 py-2.5 text-sm rounded-lg",
                    "bg-background/50 border border-border/50",
                    "placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
                    "transition-all duration-300"
                  )}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-4 py-2.5 rounded-lg",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                    "flex items-center gap-2"
                  )}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Social Links */}
            {social && (
              <div className="flex space-x-3 pt-2">
                {Object.entries(social).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform];
                  if (!Icon) return null;

                  return (
                    <motion.div
                      key={platform}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg",
                          "bg-muted/50 text-muted-foreground",
                          "hover:bg-primary/10 hover:text-primary",
                          "transition-all duration-300"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{platform}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Link Columns */}
          {columns.map((column, columnIndex) => (
            <motion.div
              key={column.title}
              variants={itemVariants}
              className="space-y-4"
            >
              <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/80">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: columnIndex * 0.1 + linkIndex * 0.05,
                      duration: 0.3,
                    }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className={cn(
                        "text-sm text-muted-foreground",
                        "hover:text-primary transition-colors duration-300",
                        "inline-flex items-center group"
                      )}
                    >
                      <span className="relative">
                        {link.text}
                        <span
                          className={cn(
                            "absolute -bottom-0.5 left-0 w-0 h-px",
                            "bg-primary transition-all duration-300",
                            "group-hover:w-full"
                          )}
                        />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className={cn(
            "mt-16 pt-8 border-t border-border/50",
            "flex flex-col md:flex-row justify-between items-center gap-4"
          )}
        >
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {copyright}
            <span className="inline-flex items-center ml-1">
              Made with
              <Heart className="w-3.5 h-3.5 mx-1 text-red-500 fill-red-500 animate-pulse" />
              by the team
            </span>
          </p>

          {bottomLinks && bottomLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6">
              {bottomLinks.map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  className={cn(
                    "text-sm text-muted-foreground",
                    "hover:text-primary transition-colors duration-300"
                  )}
                >
                  {link.text}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </footer>
  );
}
