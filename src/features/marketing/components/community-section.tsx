"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/shared/animations";
import { testimonials } from "@/features/marketing/config/content";

export function CommunitySection() {
  return (
    <section className="relative px-4 py-24 sm:py-32 bg-muted/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/20 via-transparent to-brand-50/10 pointer-events-none" />
      <div className="mx-auto max-w-7xl relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center rounded-full border bg-background px-3.5 py-1 text-xs font-medium text-muted-foreground"
          >
            Community
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            More Than Just a Place to Stay
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Join a thriving community of students, creators, and professionals. Game
            nights, study groups, cafe hangouts — the vibe is unmatched.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              className="relative rounded-xl border bg-background p-5"
            >
              <Quote className="mb-2 h-5 w-5 text-brand-300" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 border-t pt-4">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center text-xs font-bold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
