import type { Metadata } from "next";
import { Phone, MessageCircle, MapPin, Mail, Clock } from "lucide-react";
import { CTASection } from "@/features/marketing/components/cta-section";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with WaaRi PG — book a visit, ask a question, or start your stay.",
  openGraph: { title: "Contact | WaaRi PG" },
};

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with us instantly",
    href: "https://wa.me/919876543210",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@waaripg.com",
    href: "mailto:hello@waaripg.com",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "Your City, India",
    href: "https://maps.google.com",
  },
  {
    icon: Clock,
    title: "Office Hours",
    value: "Mon-Sat: 9 AM - 8 PM",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border bg-brand-50/50 px-3.5 py-1 text-xs font-medium text-brand-600">
                Contact
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Let&apos;s Talk
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
                Ready to book, have a question, or just want to say hi? We&apos;d love to
                hear from you. Reach out and we&apos;ll get back to you within a few hours.
              </p>

              <div className="mt-8 space-y-4">
                {contactMethods.map((method) => {
                  const content = (
                    <div className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/20">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background text-brand-600">
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{method.title}</p>
                        <p className="text-sm text-muted-foreground">{method.value}</p>
                      </div>
                    </div>
                  );

                  if (method.href) {
                    return (
                      <a
                        key={method.title}
                        href={method.href}
                        target={method.href.startsWith("http") ? "_blank" : undefined}
                        rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {content}
                      </a>
                    );
                  }
                  return <div key={method.title}>{content}</div>;
                })}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Send Us a Message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We typically respond within 2-3 hours.
              </p>
              <form className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us about your requirements..."
                    className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
