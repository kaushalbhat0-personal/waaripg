"use client";

import { motion } from "framer-motion";
import { Coffee, Wifi, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/shared/animations";

const highlights = [
  { icon: Coffee, label: "Barista Coffee" },
  { icon: Wifi, label: "High-Speed WiFi" },
  { icon: Zap, label: "Power Outlets" },
  { icon: Clock, label: "Quiet Zones" },
];

export function CafeSection() {
  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600"
            >
              Cafe & Workspace
            </motion.span>

            <motion.h2
              variants={fadeInUp}
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Just{" "}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                ₹70
              </span>{" "}
              for 2 Hours of Premium Workspace
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="mt-4 text-muted-foreground leading-relaxed"
            >
              And it&apos;s fully redeemable on drinks and snacks. Study, work, or hang
              out in our thoughtfully designed cafe space with high-speed WiFi, ample
              power outlets, and a community of like-minded people.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-6 flex flex-wrap gap-3"
            >
              {highlights.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/cafe"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
              >
                Explore Cafe
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-full border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                View Pricing
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="relative"
          >
            <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-brand-100 via-brand-200/50 to-warm-100 border shadow-xl" />
            <motion.div
              variants={fadeInUp}
              className="absolute -bottom-4 -left-4 rounded-xl border bg-background p-4 shadow-lg"
            >
              <p className="text-xs text-muted-foreground">Workspace Access</p>
              <p className="text-2xl font-bold text-brand-600">₹70</p>
              <p className="text-xs text-muted-foreground">2 hours + redeemable drink</p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="absolute -top-4 -right-4 rounded-xl border bg-background p-3 shadow-lg"
            >
              <Coffee className="h-6 w-6 text-brand-500" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
