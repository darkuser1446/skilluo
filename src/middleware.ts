import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PAGES = ["/student", "/mentor", "/admin"];
// NOTE: only prefixes where EVERY method must be authenticated.
// Write-authorization (roles) is enforced inside each route handler.
// /api/workshops and /api/announcements are intentionally NOT listed here:
// their GET endpoints are public (handlers enforce roles on writes).
const PROTECTED_API = [
  "/api/admin",
  "/api/users",
  "/api/mentors",
  "/api/students",
  "/api/assignments",
  "/api/notes",
  "/api/doubts",
  "/api/attendance",
  "/api/assessments",
  "/api/feedback",
  "/api/labs",
  "/api/submissions",
  "/api/exercises",
  "/api/notifications",
  "/api/question-bank",
];
const PUBLIC_API = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/announcements", "/api/auth/forgot-password", "/api/auth/reset-password"];

/* ── Simple in-memory rate limiting (per IP, sliding window) ──
   Applied to credential endpoints to slow brute-force attacks.
   Approximate per-isolate counter — good enough as a first line of defense. */
const RATE_LIMITS: Array<{ prefix: string; limit: number; windowMs: number }> = [
  { prefix: "/api/auth/login", limit: 600, windowMs: 60_000 },
  { prefix: "/api/auth/register", limit: 600, windowMs: 60_000 },
  { prefix: "/api/auth/forgot-password", limit: 60, windowMs: 60_000 },
  { prefix: "/api/auth/reset-password", limit: 60, windowMs: 60_000 },
  { prefix: "/api/auth/change-password", limit: 60, windowMs: 60_000 },
];

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(pathname: string, ip: string): NextResponse | null {
  const rule = RATE_LIMITS.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return null;

  const now = Date.now();
  const key = `${rule.prefix}:${ip}`;
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + rule.windowMs });
    // Opportunistic cleanup so the map can't grow unbounded
    if (hits.size > 1000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    return null;
  }

  entry.count += 1;
  if (entry.count > rule.limit) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
      },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } }
    );
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Rate-limit credential endpoints (even when public), unless running test suite
  const isBypass = request.headers.get("x-load-test") === "skillup-load-test-2026";
  if (request.method === "POST" && !isBypass) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";
    const limited = rateLimit(pathname, ip);
    if (limited) return limited;
  }

  // Skip public API routes
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isProtectedPage = PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isProtectedApi = PROTECTED_API.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if ((isProtectedPage || isProtectedApi) && !token) {
    if (isProtectedApi) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|ico)$).*)"],
};
