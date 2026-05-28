"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { fadeInUp, staggerContainer, staggerItem } from "@/shared/animations";
import { cn } from "@/lib/utils";
import { roomTypes } from "@/features/marketing/config/content";

export function RoomsShowcase() {
  return (
    <section className="relative px-4 py-24 sm:py-32 bg-muted/30">
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
            className="inline-flex items-center rounded-full border bg-background px-3.5 py-1 text-xs font-medium text-muted-foreground"
          >
            Accommodation
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Rooms Built for{" "}
            <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
              Living
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            From private sanctuaries to budget-friendly community living — find the
            space that matches your vibe.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {roomTypes.map((room) => (
            <motion.div
              key={room.title}
              variants={staggerItem}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md",
                room.popular && "border-brand-200 bg-brand-50/30 shadow-sm"
              )}
            >
              {room.popular && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-brand-500 px-3 py-0.5 text-[10px] font-semibold text-white">
                  Most Popular
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{room.title}</h3>
                <p className="text-sm text-muted-foreground">{room.subtitle}</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">{room.price}</span>
                <span className="text-sm text-muted-foreground">{room.period}</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                {room.description}
              </p>
              <ul className="mb-6 flex-1 space-y-2.5">
                {room.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/rooms#${room.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full border text-sm font-medium transition-colors hover:bg-muted gap-2"
              >
                Learn More
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
