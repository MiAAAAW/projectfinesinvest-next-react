"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR COMPONENT - ENHANCED
// Barra de navegación con animaciones fluidas y efectos profesionales
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DynamicIcon, Menu, X, Sun, Moon } from "@/lib/icons";
import type { NavigationConfig } from "@/types/landing.types";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

// Altura del navbar para offset del scroll
const NAVBAR_HEIGHT = 80; // h-16 (64px) + padding extra

interface NavbarProps {
  config: NavigationConfig;
  className?: string;
}

export default function Navbar({ config, className }: NavbarProps) {
  const { logo, items, cta } = config;
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler para anclas
  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Solo manejar anclas locales (#)
    if (!href.startsWith("#")) return;

    e.preventDefault();

    // Si es solo "#", scroll al top
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Buscar el elemento target
    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  }, []);

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent",
        className
      )}
    >
      <nav className="container px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href={logo.href}
              className="flex items-center space-x-2 group"
            >
              {logo.icon && (
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <DynamicIcon
                    name={logo.icon}
                    className="h-6 w-6 text-primary transition-colors group-hover:text-primary/80"
                  />
                </motion.div>
              )}
              <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {logo.text}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                >
                  {item.label}
                  {/* Hover underline effect */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-1/2 transition-all duration-300" />
                </a>
              </motion.div>
            ))}
          </div>

          {/* Right side: Theme toggle + CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            {mounted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9 rounded-full hover:bg-primary/10"
                >
                  <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </motion.div>
            )}

            {/* CTA Button */}
            {cta && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="rounded-full px-6">
                  <Link href={cta.href}>{cta.text}</Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-10 w-10 rounded-full"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-border/50">
                <div className="flex flex-col space-y-1">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={mobileItemVariants}
                    >
                      <a
                        href={item.href}
                        onClick={(e) => {
                          handleAnchorClick(e, item.href);
                          setIsOpen(false);
                        }}
                        className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer"
                      >
                        {item.label}
                      </a>
                    </motion.div>
                  ))}

                  <motion.div
                    custom={items.length}
                    initial="hidden"
                    animate="visible"
                    variants={mobileItemVariants}
                    className="flex items-center justify-between pt-4 mt-2 border-t border-border/50"
                  >
                    {/* Theme Toggle Mobile */}
                    {mounted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full"
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun className="h-4 w-4 mr-2" /> Modo claro
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4 mr-2" /> Modo oscuro
                          </>
                        )}
                      </Button>
                    )}

                    {/* CTA Mobile */}
                    {cta && (
                      <Button asChild size="sm" className="rounded-full">
                        <a
                          href={cta.href}
                          onClick={(e) => {
                            handleAnchorClick(e, cta.href);
                            setIsOpen(false);
                          }}
                        >
                          {cta.text}
                        </a>
                      </Button>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
