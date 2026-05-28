import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { roomTypes } from "@/features/marketing/config/content";
import { CTASection } from "@/features/marketing/components/cta-section";

export const metadata: Metadata = {
  title: "Rooms",
  description: "Explore our premium PG rooms — single, twin sharing, and dormitory options for students and professionals.",
  openGraph: { title: "Rooms | WaaRi PG" },
};

export default function RoomsPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600">
            Accommodation
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Perfect Space
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Fully furnished rooms designed for comfort, productivity, and community living.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {roomTypes.map((room) => (
              <div
                key={room.title}
                id={room.title.toLowerCase().replace(/\s+/g, "-")}
                className="relative rounded-2xl border p-8"
              >
                {room.popular && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-brand-500 px-3 py-0.5 text-[10px] font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h2 className="text-2xl font-bold">{room.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{room.subtitle}</p>
                <p className="mt-4">
                  <span className="text-3xl font-bold">{room.price}</span>
                  <span className="text-sm text-muted-foreground">{room.period}</span>
                </p>
                <p className="mt-4 text-sm text-muted-foreground">{room.description}</p>
                <ul className="mt-6 space-y-3">
                  {room.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-all hover:opacity-90 gap-2"
                >
                  Check Availability
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
