"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// FAQ SECTION - ANIMATED ACCORDION
// Acordeones con animaciones fluidas usando Framer Motion
// ═══════════════════════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FAQConfig } from "@/types/landing.types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DynamicIcon } from "@/lib/icons";
import Link from "next/link";
import { landingConfig } from "@/config/landing.config";

interface FAQProps {
  config: FAQConfig;
  className?: string;
}

// Componente de Item de FAQ individual
function FAQItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQConfig["items"][0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "group border rounded-2xl overflow-hidden transition-all duration-500",
        isOpen
          ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
          : "border-border/50 bg-background/50 hover:border-primary/20 hover:bg-muted/30"
      )}
    >
      {/* Question button */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full p-5 md:p-6 text-left",
          "transition-colors duration-300"
        )}
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "text-base md:text-lg font-medium pr-4 transition-colors duration-300",
            isOpen ? "text-primary" : "text-foreground group-hover:text-primary/80"
          )}
        >
          {item.question}
        </span>

        {/* Icon with rotation animation */}
        <motion.div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            "transition-colors duration-300",
            isOpen
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <DynamicIcon name={isOpen ? "Minus" : "Plus"} className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Answer with animated expand/collapse */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
                opacity: { duration: 0.3, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                opacity: { duration: 0.2 },
              },
            }}
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6">
              <motion.p
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-muted-foreground leading-relaxed"
              >
                {item.answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ({ config, className }: FAQProps) {
  const { badge, title, subtitle, items, contactLink } = config;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={cn(
        "relative py-24 md:py-32 overflow-hidden",
        className
      )}
    >
      {/* Background - transparente */}
      <div className="absolute inset-0 bg-background/10" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {badge && (
            <Badge
              variant="outline"
              className="mb-4 px-4 py-1.5 text-sm border-primary/20 bg-primary/5"
            >
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, index) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
            />
          ))}
        </div>

        {/* Contact CTA */}
        {contactLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div
              className={cn(
                "inline-flex items-center gap-4 px-6 py-4 rounded-2xl",
                "bg-muted/50 backdrop-blur-sm border border-border/50"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DynamicIcon name="MessageCircle" className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">
                  {landingConfig.ui.faqContactTitle}
                </p>
                <Button asChild variant="link" className="h-auto p-0 text-primary">
                  <Link href={contactLink.href}>{contactLink.text}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
