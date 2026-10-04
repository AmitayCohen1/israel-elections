import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { hasLocale } from "@/i18n/config";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python|monitor/i;
const KINDS = new Set(["tab", "button", "link", "outbound", "search"]);
const ID = /^[a-z0-9]{8,32}$/i;

/**
 * Cookieless analytics. Three shapes:
 * view: a page view. engage: engaged time and scroll depth for one view, sent again as they grow. event: a click or search.
 * The visitor is a hash of address + browser + day, so it can't follow anyone across days; the session is per tab.
 */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const sql = neon(process.env.DATABASE_URL!);
  const type = body.type ?? "view";
  const session = ID.test(clip(body.session, 32)) ? clip(body.session, 32) : null;

  if (type === "engage") {
    const view = clip(body.view, 32);
    if (!ID.test(view)) return new Response(null, { status: 400 });
    // Only ever grows, so a late or repeated beacon can't shrink it. Capped at an hour of reading.
    await sql`UPDATE page_views SET engaged_ms = GREATEST(engaged_ms, ${int(body.ms, 3_600_000)}),
      scroll_pct = GREATEST(scroll_pct, ${int(body.scroll, 100)}), last_seen = now()
      WHERE view_id = ${view} AND created_at > now() - interval '1 day'`;
    return new Response(null, { status: 204 });
  }

  const path = clip(body.path, 200);
  if (!path.startsWith("/") || path.startsWith("/admin")) return new Response(null, { status: 204 });
  const first = path.split("/")[1];
  const lang = hasLocale(first) ? first : null;
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.REVALIDATE_SECRET ?? ""}`).digest("hex").slice(0, 20);

  if (type === "event") {
    const kind = clip(body.kind, 20);
    const label = clip(body.label, 120);
    if (!KINDS.has(kind) || !label) return new Response(null, { status: 204 });
    await sql`INSERT INTO events (kind, label, path, lang, session, visitor) VALUES (${kind}, ${label}, ${path}, ${lang}, ${session}, ${visitor})`;
    return new Response(null, { status: 204 });
  }

  let referrer = "";
  try {
    const host = new URL(clip(body.referrer, 300)).hostname.replace(/^www\./, "");
    if (host && host !== new URL(request.url).hostname) referrer = host;
  } catch {}

  const device = /mobile|iphone|android/i.test(ua) ? "mobile" : /ipad|tablet/i.test(ua) ? "tablet" : "desktop";
  const view = clip(body.view, 32);

  await sql`INSERT INTO page_views (path, lang, referrer, country, device, visitor, view_id, session)
    VALUES (${path}, ${lang}, ${referrer || null}, ${request.headers.get("x-vercel-ip-country")}, ${device}, ${visitor}, ${ID.test(view) ? view : null}, ${session})`;
  return new Response(null, { status: 204 });
}
