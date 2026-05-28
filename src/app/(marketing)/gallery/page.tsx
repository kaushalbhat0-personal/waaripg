import type { Metadata } from "next";
import { CTASection } from "@/features/marketing/components/cta-section";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore our premium co-living and cafe workspace through photos.",
  openGraph: { title: "Gallery | WaaRi PG" },
};

const galleryCategories = [
  { title: "Rooms", count: 3 },
  { title: "Cafe", count: 2 },
  { title: "Common Areas", count: 2 },
  { title: "Community", count: 2 },
];

export default function GalleryPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600">
            Gallery
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Our Space in Photos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Take a visual tour of our rooms, cafe, common areas, and community life.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-gradient-to-br from-brand-100 via-brand-200/30 to-warm-100"
              >
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    {galleryCategories[Math.floor(i / 3)]?.title || "Space"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
