import type { Metadata } from "next";
import { CommunitySection } from "@/features/marketing/components/community-section";
import { CTASection } from "@/features/marketing/components/cta-section";
import { Users, Gamepad2, Coffee,Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Community",
  description: "Join a thriving community of students, creators, freelancers, and remote workers.",
  openGraph: { title: "Community | WaaRi PG" },
};

const communityHighlights = [
  {
    icon: Users,
    title: "Study Groups",
    description: "Connect with fellow students and professionals. Form study groups, collaborate on projects, and grow together.",
  },
  {
    icon: Gamepad2,
    title: "Game Nights",
    description: "Weekly gaming sessions, movie screenings, and board game nights in our common lounge.",
  },
  {
    icon: Coffee,
    title: "Cafe Hangouts",
    description: "The cafe is the heart of our community. Meet people, work together, or just chill with a coffee.",
  },
  {
    icon: Sparkles,
    title: "Events & Workshops",
    description: "From career talks to skill workshops, we regularly host events that add value to your stay.",
  },
];

export default function CommunityPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600">
            Community
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Built Around People
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            WaaRi isn&apos;t just a place to sleep — it&apos;s a community of driven,
            like-minded individuals who live, work, and grow together.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {communityHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border p-6 transition-all hover:border-brand-200 hover:shadow-sm"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-brand-50 text-brand-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="aspect-[2/1] w-full bg-gradient-to-br from-brand-100 via-brand-200/30 to-warm-100 border-y" />

      <div className="px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Live the WaaRi Experience
          </h2>
          <p className="mt-4 text-muted-foreground">
            From morning coffee runs to late-night study sessions — every day at WaaRi
            is an experience. Be part of a community that values connection, growth,
            and good vibes.
          </p>
        </div>
      </div>

      <CommunitySection />
      <CTASection />
    </>
  );
}
