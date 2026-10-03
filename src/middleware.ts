import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PAGES = ["/student", "/mentor", "/admin"];
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
  "/api/workshops",
  "/api/exercises",
  "/api/notifications",
];
// Announcements GET is public for isPublic=true; auth enforced inside handler
const PUBLIC_API = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/announcements"];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Skip public API routes
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isProtectedPage = PROTECTED_PAGES.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API.some((p) => pathname.startsWith(p));

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
