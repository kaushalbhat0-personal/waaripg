import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { CTASection } from "@/features/marketing/components/cta-section";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing for PG rooms, hostel accommodation, and cafe workspace access.",
  openGraph: { title: "Pricing | WaaRi PG" },
};

const plans = [
  {
    name: "Single Room",
    price: "₹8,999",
    period: "/month",
    description: "Your private sanctuary with all amenities included.",
    features: [
      "Private attached bathroom",
      "Study desk & chair",
      "Wardrobe & storage",
      "Premium mattress & bedding",
      "High-speed WiFi",
      "Housekeeping (weekly)",
      "Cafe discount (15%)",
      "Power backup",
      "24/7 security",
    ],
  },
  {
    name: "Twin Sharing",
    price: "₹5,999",
    period: "/month/person",
    description: "Perfect for friends. Split the cost, double the fun.",
    features: [
      "Shared bathroom",
      "Individual study desks",
      "Shared wardrobe",
      "Premium mattresses",
      "High-speed WiFi",
      "Housekeeping (weekly)",
      "Cafe discount (10%)",
      "Power backup",
      "24/7 security",
    ],
    popular: true,
  },
  {
    name: "Dormitory",
    price: "₹3,499",
    period: "/month/person",
    description: "Budget-friendly without compromising on quality.",
    features: [
      "Personal locker storage",
      "Study table per bed",
      "Reading lamp",
      "Curtain privacy",
      "Blanket & pillow included",
      "High-speed WiFi",
      "Community lounge access",
      "Power backup",
      "24/7 security",
    ],
  },
  {
    name: "Cafe Workspace",
    price: "₹70",
    period: "/2 hours",
    description: "Pay ₹70, get 2 hours of workspace. Fully redeemable on food & drinks.",
    features: [
      "High-speed WiFi",
      "Power outlets at every seat",
      "Ergonomic seating",
      "Quiet study zones",
      "Barista coffee & tea",
      "Fresh snacks & meals",
      "100% redeemable on menu",
      "Printing & scanning",
      "Community events access",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600">
            Pricing
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            No hidden fees. No surprise charges. What you see is what you get.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.popular ? "border-brand-200 bg-brand-50/30 shadow-sm" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-brand-500 px-3 py-0.5 text-[10px] font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-all hover:opacity-90 gap-2"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-4 text-left">
            {[
              { q: "What is the minimum stay period?", a: "Single rooms require a minimum 3-month commitment. Twin sharing and dormitories have a 1-month minimum." },
              { q: "Are meals included in the price?", a: "Room prices do not include meals, but we offer optional meal plans at affordable rates. Our in-house cafe is available daily with resident discounts." },
              { q: "Is there a security deposit?", a: "A refundable security deposit of one month's rent is required at check-in." },
              { q: "Can I switch rooms later?", a: "Yes, subject to availability. A nominal transfer fee applies." },
              { q: "What is the cafe workspace pricing?", a: "₹70 for 2 hours of workspace, fully redeemable on drinks and snacks. Residents get additional discounts." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border bg-background">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-sm">
                  {faq.q}
                  <span className="ml-2 shrink-0 transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="border-t px-4 pb-4 pt-3 text-sm text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
