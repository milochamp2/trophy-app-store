import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"];

// Routes that require admin/staff role
const adminRoutePattern = /^\/admin/;

// Routes that require player membership
const playerRoutePattern = /^\/player/;

export async function middleware(request: NextRequest) {
  try {
    const { supabaseResponse, user, supabase } = await updateSession(request);

    const pathname = request.nextUrl.pathname;

    // TEMPORARY: Allow all routes for preview (remove this block in production)
    const PREVIEW_MODE = true;
    if (PREVIEW_MODE) {
      return supabaseResponse;
    }

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
      // Redirect logged-in users away from auth pages
      if (user && (pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/player", request.url));
      }
      return supabaseResponse;
    }

    // If Supabase is not configured, allow access to see the app (will show errors on pages)
    if (!supabase) {
      return supabaseResponse;
    }

    // Check if user is authenticated for protected routes
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Admin routes: require admin/staff role in tenant
    if (adminRoutePattern.test(pathname)) {
      // Extract tenant slug from URL if present
      const tenantSlugMatch = pathname.match(/^\/admin\/([^\/]+)/);

      if (tenantSlugMatch) {
        const tenantSlug = tenantSlugMatch[1];

        try {
          // Check if user has admin/staff role in this tenant
          const { data: membership } = await supabase
            .from("memberships")
            .select(`
              role,
              tenant:tenants!inner(slug)
            `)
            .eq("user_id", user.id)
            .eq("tenants.slug", tenantSlug)
            .eq("status", "active")
            .in("role", ["owner", "admin", "staff"])
            .single();

          if (!membership) {
            // User doesn't have admin access to this tenant
            return NextResponse.redirect(new URL("/admin", request.url));
          }
        } catch {
          // Database query failed, redirect to admin home
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }

      return supabaseResponse;
    }

    // Player routes: require membership in at least one club
    if (playerRoutePattern.test(pathname)) {
      // For tenant-specific player routes, check membership
      const tenantSlugMatch = pathname.match(/^\/player\/([^\/]+)/);

      if (tenantSlugMatch) {
        const tenantSlug = tenantSlugMatch[1];

        try {
          // Check if user has membership in this tenant
          const { data: membership } = await supabase
            .from("memberships")
            .select(`
              id,
              tenant:tenants!inner(slug)
            `)
            .eq("user_id", user.id)
            .eq("tenants.slug", tenantSlug)
            .eq("status", "active")
            .single();

          if (!membership) {
            // User doesn't have access to this tenant
            return NextResponse.redirect(new URL("/player", request.url));
          }
        } catch {
          // Database query failed, redirect to player home
          return NextResponse.redirect(new URL("/player", request.url));
        }
      }

      return supabaseResponse;
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request to proceed to avoid blocking the site
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
