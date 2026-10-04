import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { hasLocale } from "@/i18n/config";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python|monitor/i;

/** A cookieless page view. The visitor is a hash of address + browser + day, so it can't follow anyone across days. */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const path = clip(body.path, 200);
  if (!path.startsWith("/") || path.startsWith("/admin")) return new Response(null, { status: 204 });

  let referrer = "";
  try {
    const host = new URL(clip(body.referrer, 300)).hostname.replace(/^www\./, "");
    if (host && host !== new URL(request.url).hostname) referrer = host;
  } catch {}

  const first = path.split("/")[1];
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.REVALIDATE_SECRET ?? ""}`).digest("hex").slice(0, 20);
  const device = /mobile|iphone|android/i.test(ua) ? "mobile" : /ipad|tablet/i.test(ua) ? "tablet" : "desktop";

  const sql = neon(process.env.DATABASE_URL!);
  await sql`INSERT INTO page_views (path, lang, referrer, country, device, visitor)
    VALUES (${path}, ${hasLocale(first) ? first : null}, ${referrer || null}, ${request.headers.get("x-vercel-ip-country")}, ${device}, ${visitor})`;
  return new Response(null, { status: 204 });
}
