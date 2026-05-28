"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url === "your-project-url" || !url.startsWith("http")) {
    return "https://placeholder.supabase.co";
  }
  return url;
}

function getSupabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key === "your-anon-key") {
    return "placeholder-key";
  }
  return key;
}

function getSupabaseClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseKey());
}

let client: ReturnType<typeof getSupabaseClient> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    return getSupabaseClient();
  }
  if (!client) {
    client = getSupabaseClient();
  }
  return client;
}
