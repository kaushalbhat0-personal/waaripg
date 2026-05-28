export type HelpCategory = "getting-started" | "residents" | "rooms" | "payments" | "gate-logs" | "violations" | "settings";

export interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: HelpCategory;
  content: string;
  keywords: string[];
}

export interface HelpSearchResult {
  article: HelpArticle;
  relevance: number;
}
