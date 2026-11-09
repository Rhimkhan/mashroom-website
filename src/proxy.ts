import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // 1. If REQUIRE_LOGIN is not exactly "true", no gate at all
  if (process.env.REQUIRE_LOGIN !== "true") {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  // 2. Strict check: only redirect /shop, /product/*, /cart, /checkout, /account
  const isProtected =
    pathname === "/shop" ||
    pathname.startsWith("/shop/") ||
    pathname === "/product" ||
    pathname.startsWith("/product/") ||
    pathname === "/cart" ||
    pathname.startsWith("/cart/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/");

  // Public routes (/, /our-story, /gallery, /certificates, /privacy-policy,
  // /terms, /shipping-policy, /refund-policy, /faq, /contact, /wholesale,
  // /watch, /track-order, /login, /reset-password, /robots.txt, /sitemap.xml,
  // /manifest.webmanifest, icons, and all /api routes) pass through untouched.
  if (!isProtected) {
    return NextResponse.next();
  }

  const originalPath = pathname + search;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", originalPath);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "https://your-project.supabase.co" ||
    supabaseUrl.trim() === ""
  ) {
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If there is no valid Supabase session, redirect to /login?next=<original path>
    if (!user) {
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch (err) {
    console.warn("Proxy session verification failed:", err);
    return NextResponse.redirect(loginUrl);
  }
}

export default proxy;

export const config = {
  matcher: [
    "/shop",
    "/shop/:path*",
    "/product/:path*",
    "/cart",
    "/cart/:path*",
    "/checkout",
    "/checkout/:path*",
    "/account",
    "/account/:path*",
  ],
};

