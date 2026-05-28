import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, Wifi, Zap, Clock, ArrowRight } from "lucide-react";
import { cafeFeatures } from "@/features/marketing/config/content";
import { CTASection } from "@/features/marketing/components/cta-section";

export const metadata: Metadata = {
  title: "Cafe & Workspace",
  description: "Premium cafe workspace at ₹70 for 2 hours — fully redeemable on drinks and snacks. Study, work, and connect.",
  openGraph: { title: "Cafe & Workspace | WaaRi PG" },
};

export default function CafePage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600">
                Cafe & Workspace
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Your Favorite Study & Work Spot
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Just ₹70 gets you 2 hours of premium workspace — and it&apos;s fully
                redeemable on our cafe menu. Specialty coffee, fresh snacks, high-speed
                WiFi, and a community of focused people.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { icon: Coffee, label: "Specialty Coffee" },
                  { icon: Wifi, label: "500 Mbps WiFi" },
                  { icon: Zap, label: "Power Outlets" },
                  { icon: Clock, label: "Quiet Zones" },
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-brand-100 via-brand-200/50 to-warm-100 border" />
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {cafeFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border p-6 transition-all hover:border-brand-200 hover:shadow-sm"
              >
                <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 mb-3">
                  {feature.highlight}
                </span>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Cafe Menu
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From espresso to smoothies — every item is redeemable with your workspace pass.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90 gap-2"
          >
            Visit Us Today
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <CTASection />
    </>
  );
}
