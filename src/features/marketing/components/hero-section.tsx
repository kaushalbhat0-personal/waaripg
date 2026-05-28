"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/shared/animations";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/30 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-100/20 via-transparent to-transparent pointer-events-none" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div variants={fadeInUp} className="mb-6">
          <span className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            Now Open — Premium Co-Living in the Heart of the City
          </span>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="block">Stay. Study.</span>
          <span className="block mt-2">
            <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent">
              Work. Chill.
            </span>
          </span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Premium PG, hostel, and cafe workspace — designed for students, remote workers,
          freelancers, and digital nomads who want more than just a room.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/rooms"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-all hover:opacity-90 gap-2"
          >
            Explore Rooms
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/cafe"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border px-8 text-sm font-medium transition-colors hover:bg-muted gap-2"
          >
            View Cafe Space
          </Link>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-brand-200 bg-brand-50/50 px-8 text-sm font-medium text-brand-700 transition-all hover:bg-brand-100 gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            WhatsApp Us
          </a>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {["Students", "Interns", "Freelancers", "Remote Workers", "Digital Nomads"].map(
            (item) => (
              <span
                key={item}
                className="text-xs sm:text-sm text-muted-foreground/60"
              >
                {item}
              </span>
            )
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="h-5 w-5 text-muted-foreground/40 animate-bounce" />
      </motion.div>
    </section>
  );
}
