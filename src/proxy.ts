import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { DEFAULT_LOCALE, LOCALES, hasLocale } from "@/i18n/config";

function pickLocale(request: NextRequest) {
  const saved = request.cookies.get("lang")?.value;
  if (saved && hasLocale(saved)) return saved;
  const languages = new Negotiator({ headers: { "accept-language": request.headers.get("accept-language") ?? "" } }).languages();
  try {
    return match(languages, LOCALES, DEFAULT_LOCALE);
  } catch {
    return DEFAULT_LOCALE;
  }
}

function localize(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (hasLocale(first)) {
    const res = NextResponse.next();
    res.cookies.set("lang", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }
  request.nextUrl.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
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
