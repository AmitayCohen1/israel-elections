import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";

// An address without a language is always Hebrew, whatever the browser prefers; the other languages are a choice made in the switcher.
function localize(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocale(pathname.split("/")[1])) return NextResponse.next();
  request.nextUrl.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

// Clerk only runs for /admin; the public site never touches it. The allowlist itself is enforced in the admin layout.
const admin = clerkMiddleware(async (auth, request) => {
  if (!request.nextUrl.pathname.startsWith("/admin/sign-in")) await auth.protect({ unauthenticatedUrl: new URL("/admin/sign-in", request.url).toString() });
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return admin(request, event);
  return localize(request);
}

export const config = {
  // Everything except the API, Next's internals, and files with an extension (images, icon.svg, ...).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
