"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Phone, MessageCircle, Calendar } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/shared/animations";

const ctaOptions = [
  {
    icon: Calendar,
    title: "Schedule a Visit",
    description: "Come see the space in person",
    href: "/contact",
    variant: "primary" as const,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Us",
    description: "Quick replies within minutes",
    href: "https://wa.me/919876543210",
    variant: "secondary" as const,
  },
  {
    icon: Phone,
    title: "Call Now",
    description: "+91 98765 43210",
    href: "tel:+919876543210",
    variant: "outline" as const,
  },
];

export function CTASection() {
  return (
    <section className="relative px-4 py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_white,_transparent_50%)] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_white,_transparent_50%)] opacity-5 pointer-events-none" />

      <div className="mx-auto max-w-7xl relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Ready to Experience WaaRi?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-xl text-brand-100"
          >
            Your premium co-living space is waiting. Book a visit, drop a message, or
            call us — we&apos;d love to show you around.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-10 grid gap-4 sm:grid-cols-3"
        >
          {ctaOptions.map((option) => (
            <motion.div key={option.title} variants={fadeInUp}>
              {option.href.startsWith("http") || option.href.startsWith("tel:") ? (
                <a
                  href={option.href}
                  target={option.href.startsWith("http") ? "_blank" : undefined}
                  rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex flex-col items-center gap-2 rounded-xl bg-white/10 p-6 text-center text-white transition-all hover:bg-white/20 backdrop-blur-sm"
                >
                  <option.icon className="h-6 w-6" />
                  <span className="font-semibold">{option.title}</span>
                  <span className="text-sm text-brand-100">{option.description}</span>
                </a>
              ) : (
                <Link
                  href={option.href}
                  className="group flex flex-col items-center gap-2 rounded-xl bg-white/10 p-6 text-center text-white transition-all hover:bg-white/20 backdrop-blur-sm"
                >
                  <option.icon className="h-6 w-6" />
                  <span className="font-semibold">{option.title}</span>
                  <span className="text-sm text-brand-100">{option.description}</span>
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-8 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-brand-100 transition-colors hover:text-white"
          >
            View full pricing details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
