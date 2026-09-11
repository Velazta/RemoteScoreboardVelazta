import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js Middleware for Auth & Protected Route Routing
 * Wrapped safely to prevent MIDDLEWARE_INVOCATION_FAILED crashes on edge.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Safe fallback if env vars are missing during deployment initialization
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[Middleware] Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing."
    );
    return response;
  }

  const pathname = request.nextUrl.pathname;

  // Redirect /custom to /dashboard
  if (pathname === "/custom" || pathname === "/custom/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Registration route is disabled — redirect directly to /auth/login
  if (pathname.startsWith("/auth/register")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const isRememberMe = request.cookies.get("remember_me")?.value === "true";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);

            const cookieOptions = { ...options };
            if (!isRememberMe && cookieOptions.maxAge && cookieOptions.maxAge > 0) {
              // User did NOT choose remember-me: strip maxAge & expires so refreshed token stays a Session Cookie
              delete cookieOptions.maxAge;
              delete cookieOptions.expires;
            } else if (isRememberMe && cookieOptions.maxAge && cookieOptions.maxAge > 0) {
              // User chose remember-me: enforce 30-day lifetime
              cookieOptions.maxAge = 60 * 60 * 24 * 30;
            }

            response.cookies.set(name, value, cookieOptions);
          });
        },
      },
    });

    // Refresh user session if present
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Define protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/panel", "/overlay-editor"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // If user tries to access protected custom panel without logging in -> redirect to login
    if (isProtectedRoute && !user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If user is already authenticated and tries to visit login -> redirect to dashboard
    if (user && pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Middleware Exception]:", msg);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, Next internals, and media assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
