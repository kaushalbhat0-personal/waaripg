"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { navLinks, siteConfig, socialLinks } from "@/features/marketing/config/navigation";
import type { Session } from "@supabase/supabase-js";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${socialLinks.phone.replace(/\s/g, "")}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {socialLinks.phone}
          </a>
          {authLoaded && (
            <Link
              href={session ? "/dashboard" : "/login"}
              className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all hover:bg-muted/50"
            >
              {session ? (
                <><LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />Dashboard</>
              ) : (
                <><LogIn className="h-3.5 w-3.5 mr-1.5" />Admin Login</>
              )}
            </Link>
          )}
          <Link
            href="/contact"
            className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90"
          >
            Book a Visit
          </Link>
        </div>

        <button
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm border-l bg-background p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold">{siteConfig.name}</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="block rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 }}
                >
                  {authLoaded && (
                    <Link
                      href={session ? "/dashboard" : "/login"}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-muted"
                    >
                      {session ? (
                        <><LayoutDashboard className="h-5 w-5" />Dashboard</>
                      ) : (
                        <><LogIn className="h-5 w-5" />Admin Login</>
                      )}
                    </Link>
                  )}
                </motion.div>
              </nav>
              <div className="mt-8 space-y-4 border-t pt-6">
                <a
                  href={`tel:${socialLinks.phone.replace(/\s/g, "")}`}
                  className="block text-sm text-muted-foreground"
                >
                  {socialLinks.phone}
                </a>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
                >
                  Book a Visit
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
