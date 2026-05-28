"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, Lightbulb, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/tracking";
import type { HelpArticle, HelpCategory } from "../types";

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "getting-started-overview",
    title: "Getting Started",
    description: "Learn the basics of WaaRi PG — navigation, dashboard, and your first actions",
    category: "getting-started",
    keywords: ["start", "begin", "basics", "overview", "navigation", "dashboard"],
    content: "WaaRi PG is organized into modules: Dashboard, Residents, Rooms, Payments, and Gate Logs. Use the sidebar to navigate. The dashboard gives you a real-time overview of your operations.",
  },
  {
    id: "adding-residents",
    title: "Adding New Residents",
    description: "Step-by-step guide to add, document, and allocate residents",
    category: "residents",
    keywords: ["add", "create", "new", "resident", "register", "onboard"],
    content: "Click 'Add Resident' from the Residents page or use the Quick Actions floating button. Fill in personal details, upload documents, and assign a room/bed.",
  },
  {
    id: "managing-rooms",
    title: "Managing Rooms & Beds",
    description: "Create rooms, assign beds, and manage allocations",
    category: "rooms",
    keywords: ["room", "bed", "floor", "property", "allocate", "transfer"],
    content: "Use the Rooms page to manage your properties, floors, rooms, and beds. Drag and drop residents to transfer them between rooms.",
  },
  {
    id: "creating-invoices",
    title: "Creating Invoices",
    description: "Generate rent invoices, add charges, and manage billing cycles",
    category: "payments",
    keywords: ["invoice", "bill", "rent", "charge", "payment", "due"],
    content: "Go to Payments to create invoices. You can generate individual or bulk invoices. Set due dates, add line items, and apply discounts.",
  },
  {
    id: "recording-payments",
    title: "Recording Payments",
    description: "Record cash, UPI, card, and bank transfer payments",
    category: "payments",
    keywords: ["payment", "pay", "cash", "upi", "card", "receipt", "transaction"],
    content: "From the Payments page, click 'Record Payment'. Select the resident, invoice, payment method, and amount. Receipts are auto-generated.",
  },
  {
    id: "gate-logs-basics",
    title: "Gate Logs Overview",
    description: "Track resident entry and exit with automated logging",
    category: "gate-logs",
    keywords: ["gate", "entry", "exit", "log", "track", "security"],
    content: "Gate logs record when residents enter and exit. Late entries are automatically flagged. Security guards can log entries from the gate-logs page.",
  },
  {
    id: "managing-violations",
    title: "Managing Violations",
    description: "Review and resolve late entries, curfew breaches, and rule violations",
    category: "violations",
    keywords: ["violation", "late", "curfew", "breach", "rule", "resolve", "penalty"],
    content: "Violations are auto-created from late gate entries. Review them in the Gate Logs page. Mark as resolved with notes explaining the resolution.",
  },
  {
    id: "role-management",
    title: "Roles & Permissions",
    description: "Configure staff roles and access permissions",
    category: "settings",
    keywords: ["role", "permission", "staff", "access", "security", "admin", "manager", "guard", "accountant"],
    content: "Go to Settings > Roles to manage permissions. Pre-defined roles: Admin, Manager, Accountant, and Guard. You can customize permissions per role.",
  },
  {
    id: "bulk-operations",
    title: "Bulk Operations",
    description: "Perform actions on multiple residents, invoices, or rooms at once",
    category: "residents",
    keywords: ["bulk", "batch", "multiple", "mass", "import"],
    content: "Select multiple items using checkboxes, then use the bulk action bar at the bottom. You can assign rooms, generate invoices, or send notifications in bulk.",
  },
  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    description: "Speed up your workflow with keyboard shortcuts",
    category: "getting-started",
    keywords: ["shortcut", "keyboard", "quick", "cmd", "ctrl", "k", "navigation"],
    content: "Press Cmd+K (Mac) or Ctrl+K (Windows) to open the Command Palette. Navigate between pages and trigger actions without lifting your hands off the keyboard.",
  },
];

const CATEGORY_LABELS: Record<HelpCategory, string> = {
  "getting-started": "Getting Started",
  residents: "Residents",
  rooms: "Rooms",
  payments: "Payments",
  "gate-logs": "Gate Logs",
  violations: "Violations",
  settings: "Settings",
};

type HelpCenterProps = {
  open: boolean;
  onClose: () => void;
};

export function HelpCenter({ open, onClose }: HelpCenterProps) {
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);

  const filteredArticles = useMemo(() => {
    let articles = HELP_ARTICLES;

    if (selectedCategory) {
      articles = articles.filter((a) => a.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.keywords.some((k) => k.includes(q)),
      );
    }

    return articles;
  }, [search, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(HELP_ARTICLES.map((a) => a.category));
    return Array.from(cats);
  }, []);

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
    trackEvent("help_article_viewed", { article_id: article.id });
  };

  const handleBack = () => {
    setSelectedArticle(null);
    setSearch("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg mx-4"
          >
            <Card className="overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Help Center</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search help articles..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedCategory(null);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {selectedArticle ? (
                  <div className="space-y-4">
                    <button
                      onClick={handleBack}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      &larr; Back to articles
                    </button>
                    <div>
                      <span className="inline-block text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 mb-2">
                        {CATEGORY_LABELS[selectedArticle.category]}
                      </span>
                      <h3 className="font-semibold">{selectedArticle.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedArticle.description}</p>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p>{selectedArticle.content}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedArticle.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!search && !selectedCategory && (
                      <>
                        {/* Categories */}
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Categories</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className="flex items-center gap-2 rounded-lg border p-3 text-left text-sm hover:bg-muted/50 transition-colors"
                              >
                                <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-medium">{CATEGORY_LABELS[cat]}</span>
                                <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick tips */}
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Quick Tips</h4>
                          <div className="space-y-2">
                            {[
                              "Press Cmd+K to open Command Palette",
                              "Use Quick Actions (bottom-right) for common tasks",
                              "Select multiple items for bulk operations",
                            ].map((tip) => (
                              <div key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Category label */}
                    {selectedCategory && (
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{CATEGORY_LABELS[selectedCategory]}</h3>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear filter
                        </button>
                      </div>
                    )}

                    {/* Search results / filtered list */}
                    {search && (
                      <p className="text-xs text-muted-foreground">
                        {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
                      </p>
                    )}

                    <div className="space-y-1">
                      {filteredArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleClick(article)}
                          className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-1.5 py-0.5 shrink-0">
                              {CATEGORY_LABELS[article.category].slice(0, 3)}
                            </span>
                            <span className="text-sm font-medium truncate">{article.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {article.description}
                          </p>
                        </button>
                      ))}

                      {filteredArticles.length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No articles found. Try different keywords.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
