"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR COMPONENT - ENHANCED
// Barra de navegación con animaciones fluidas y efectos profesionales
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DynamicIcon, Menu, X, Sun, Moon, ChevronDown } from "@/lib/icons";
import type { NavigationConfig, NavItem } from "@/types/landing.types";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

// Altura del navbar para offset del scroll
const NAVBAR_HEIGHT = 80; // h-16 (64px) + padding extra

// ═══════════════════════════════════════════════════════════════════════════════
// DROPDOWN LINK · maneja los 3 casos:
//   · "#foo" o "/#foo"       → onAnchorClick (smart scroll handler)
//   · "/path#hash" misma ruta → <a> nativo (garantiza hashchange event)
//   · "/path"                 → Next.js Link (SPA navigation)
// ═══════════════════════════════════════════════════════════════════════════════

function DropdownLink({
  href,
  onAnchorClick,
  closeMenu,
  className,
  children,
}: {
  href: string;
  onAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  closeMenu: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const isLandingHash = href.startsWith("#") || href.startsWith("/#");
  const hasHash = href.includes("#");

  // Caso 1: landing hash (anuncios, research) → smart scroll handler
  if (isLandingHash) {
    return (
      <a
        href={href}
        onClick={(e) => {
          onAnchorClick(e, href);
          closeMenu();
        }}
        className={className}
      >
        {children}
      </a>
    );
  }

  // Caso 2: URL con hash (ej. "/acreditacion#std-22") → <a> nativo
  // Next.js <Link> no siempre dispara hashchange en la misma ruta
  if (hasHash) {
    return (
      <a href={href} onClick={closeMenu} className={className}>
        {children}
      </a>
    );
  }

  // Caso 3: ruta normal → Next.js Link con navegación SPA
  return (
    <Link href={href} onClick={closeMenu} className={className}>
      {children}
    </Link>
  );
}

interface NavbarProps {
  config: NavigationConfig;
  className?: string;
}

function NavDropdown({
  item,
  onAnchorClick,
}: {
  item: NavItem;
  onAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dynamicChildren, setDynamicChildren] = useState<NavItem[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch dinámico si item.dynamicSource está definido (data-driven)
  useEffect(() => {
    if (!item.dynamicSource) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/${item.dynamicSource}/nav`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json.data)) {
          setDynamicChildren(json.data as NavItem[]);
        }
      } catch (err) {
        console.warn(`Dynamic nav fetch failed for ${item.dynamicSource}:`, err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.dynamicSource]);

  // Merge: static children (del config) + dynamic children (del fetch)
  const children: NavItem[] = [
    ...(item.children ?? []),
    ...(dynamicChildren ?? []),
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={item.href}
        onClick={(e) => {
          onAnchorClick(e, item.href);
          setOpen(false);
        }}
        className="relative px-2.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors group cursor-pointer flex items-center gap-1"
      >
        {item.label}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-1/2 transition-all duration-300" />
      </a>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 min-w-[200px] rounded-lg border border-border bg-popover p-1 shadow-md"
          >
            {children.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Cargando...</p>
            ) : (
              children.map((child, idx) => {
                const hasSubChildren = child.children && child.children.length > 0;
                const isLast = idx === children.length - 1;
                return (
                  <div key={child.label}>
                    <DropdownLink
                      href={child.href}
                      onAnchorClick={onAnchorClick}
                      closeMenu={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {child.label}
                    </DropdownLink>
                    {hasSubChildren && (
                      <div className="space-y-0.5 mb-1">
                        {child.children!.map((sub) => (
                          <DropdownLink
                            key={sub.label}
                            href={sub.href}
                            onAnchorClick={onAnchorClick}
                            closeMenu={() => setOpen(false)}
                            className="block rounded-md pl-7 pr-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            {sub.label}
                          </DropdownLink>
                        ))}
                      </div>
                    )}
                    {!isLast && hasSubChildren && (
                      <div className="my-1 h-px bg-border/40" />
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
    // Manejar anclas: "#section" o "/#section"
    const isAnchor = href.startsWith("#");
    const isHomeAnchor = href.startsWith("/#");

    if (!isAnchor && !isHomeAnchor) return;

    e.preventDefault();

    // Si es solo "#", scroll al top
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetId = isHomeAnchor ? href.slice(2) : href.slice(1);
    const isOnHomePage = window.location.pathname === "/";

    if (!isOnHomePage && isHomeAnchor) {
      // Navegar a la landing con el hash
      window.location.href = href;
      return;
    }

    // Buscar el elemento target
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
          : "bg-white/20 backdrop-blur-md dark:bg-transparent dark:backdrop-blur-none",
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
              <span className="font-bold text-xl text-foreground">
                {logo.text}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            {items.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
              >
                {item.children || item.dynamicSource ? (
                  <NavDropdown item={item} onAnchorClick={handleAnchorClick} />
                ) : item.href.startsWith("#") || item.href.startsWith("/#") ? (
                  <a
                    href={item.href}
                    onClick={(e) => handleAnchorClick(e, item.href)}
                    className="relative px-2.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors group cursor-pointer"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-1/2 transition-all duration-300" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="relative px-2.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors group cursor-pointer"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-1/2 transition-all duration-300" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Right side: Theme toggle + CTA */}
          <div className="hidden lg:flex items-center space-x-3">
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
            className="lg:hidden"
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
              className="lg:hidden overflow-hidden"
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
                      {item.href.startsWith("#") || item.href.startsWith("/#") ? (
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
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer"
                        >
                          {item.label}
                        </Link>
                      )}
                      {item.children && (
                        <div className="ml-4 border-l border-border/50 pl-2">
                          {item.children.map((child) => {
                            const isAnchor =
                              child.href.startsWith("#") || child.href.startsWith("/#");
                            return isAnchor ? (
                              <a
                                key={child.label}
                                href={child.href}
                                onClick={(e) => {
                                  handleAnchorClick(e, child.href);
                                  setIsOpen(false);
                                }}
                                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer"
                              >
                                {child.label}
                              </a>
                            ) : (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all cursor-pointer"
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
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
