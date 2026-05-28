import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/features/marketing/components/cta-section";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about WaaRi PG — a modern co-living and cafe workspace built for students, professionals, and creators.",
  openGraph: { title: "About | WaaRi PG" },
};

const values = [
  {
    title: "Community First",
    description: "We believe the best experiences are shared. Our spaces are designed to foster genuine connections.",
  },
  {
    title: "Premium, Not Pricey",
    description: "Quality living shouldn't break the bank. We offer premium amenities at accessible prices.",
  },
  {
    title: "Work-Life Balance",
    description: "Stay. Study. Work. Chill. Our spaces support every aspect of your lifestyle.",
  },
  {
    title: "Safety & Comfort",
    description: "24/7 security, CCTV, and a supportive team ensure you always feel at home.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600">
                About Us
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                More Than a Roof. A Lifestyle.
              </h1>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  WaaRi PG was born from a simple idea: why settle for a boring hostel
                  when you can have a premium co-living experience? We combine the best
                  of PG accommodation with a modern cafe workspace and a vibrant
                  community.
                </p>
                <p>
                  Whether you&apos;re a student preparing for exams, a freelancer building
                  your portfolio, or a remote worker seeking a change of scenery —
                  WaaRi is designed for you.
                </p>
                <p>
                  Our ground-floor cafe serves as the social hub, with ₹70 workspace passes
                  that are fully redeemable on drinks and snacks. It&apos;s where ideas
                  flow, friendships form, and productivity thrives.
                </p>
              </div>
            </div>
            <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-brand-200 via-brand-300/50 to-warm-200" />
          </div>
        </div>
      </section>

      <section className="px-4 py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            What We Stand For
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border bg-background p-6 text-center">
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Make WaaRi Your Home?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Come visit us, meet the community, and experience the difference.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-all hover:opacity-90"
            >
              Schedule a Visit
            </Link>
            <Link
              href="/rooms"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border px-8 text-sm font-medium transition-colors hover:bg-muted"
            >
              View Rooms
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
