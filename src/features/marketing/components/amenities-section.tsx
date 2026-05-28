"use client";

import { motion } from "framer-motion";
import {
  Wifi,
  Coffee,
  Briefcase,
  Shirt,
  ShieldCheck,
  Sparkles,
  Zap,
  ScanEye,
  Users,
} from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/shared/animations";
import { amenities } from "@/features/marketing/config/content";

const iconMap: Record<string, React.ElementType> = {
  Wifi,
  Coffee,
  Briefcase,
  Shirt,
  ShieldCheck,
  Sparkles,
  Zap,
  ScanEye,
  Users,
};

export function AmenitiesSection() {
  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600"
          >
            Amenities
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            We&apos;ve thought of everything — so you can focus on what matters.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {amenities.map((amenity) => {
            const Icon = iconMap[amenity.icon] || Wifi;
            return (
              <motion.div
                key={amenity.title}
                variants={staggerItem}
                className="group rounded-xl border p-5 transition-all hover:border-brand-200 hover:shadow-sm hover:bg-brand-50/20"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-brand-600 transition-colors group-hover:bg-brand-50 group-hover:border-brand-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{amenity.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {amenity.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
