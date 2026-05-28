import type { Metadata } from "next";
import { Header } from "@/features/marketing/components/header";
import { Footer } from "@/features/marketing/components/footer";

export const metadata: Metadata = {
  title: {
    template: "%s | WaaRi PG",
    default: "WaaRi PG — Premium Co-Living & Cafe Workspace",
  },
  description:
    "Premium PG, hostel, and cafe workspace for students, interns, remote workers, and digital nomads. Stay. Study. Work. Chill.",
  openGraph: {
    title: "WaaRi PG — Premium Co-Living & Cafe Workspace",
    description:
      "Premium PG, hostel, and cafe workspace for students, interns, remote workers, and digital nomads.",
    type: "website",
    locale: "en_IN",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
