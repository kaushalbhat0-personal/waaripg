import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  "/",
  "/rooms",
  "/cafe",
  "/gallery",
  "/pricing",
  "/community",
  "/about",
  "/contact",
  "/login",
  "/register",
];

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

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          /* read-only — session refresh handled by updateSession */
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user !== null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health endpoint — no session needed
  if (pathname === "/api/health") {
    const response = new Response(null, { status: 204 });
    setSecurityHeaders(response.headers, pathname);
    return response;
  }

  // API routes — session refresh only
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

  // Auth enforcement — protect dashboard routes
  if (!isPublicRoute(pathname) && pathname.startsWith("/dashboard")) {
    const authed = await isAuthenticated(request);
    if (!authed) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Security headers for dashboard routes
  setSecurityHeaders(response.headers, pathname);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
