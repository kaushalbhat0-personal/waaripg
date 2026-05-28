import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(ip, recent);
  return recent.length >= RATE_LIMIT_MAX_REQUESTS;
}

function setSecurityHeaders(headers: Headers, pathname: string) {
  if (pathname.startsWith("/dashboard")) {
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-XSS-Protection", "1; mode=block");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health endpoint — no session needed
  if (pathname === "/api/health") {
    const response = new Response(null, { status: 204 });
    setSecurityHeaders(response.headers, pathname);
    return response;
  }

  // API routes — CORS only
  if (pathname.startsWith("/api/")) {
    return await updateSession(request);
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // Session refresh via existing Supabase middleware
  const response = await updateSession(request);

  // Security headers for dashboard routes
  setSecurityHeaders(response.headers, pathname);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
