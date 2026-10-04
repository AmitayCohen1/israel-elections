import { createHash } from "node:crypto";
import { after } from "next/server";
import { neon } from "@neondatabase/serverless";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** A message from the contact page: an email and a message, stored in the inbox. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Bots fill the hidden field; pretend it worked and store nothing.
  if (clip(body.website, 50)) return Response.json({ ok: true });

  const message = clip(body.message, 2000);
  const email = clip(body.email, 200);
  if (message.length < 10) return Response.json({ ok: false, error: "short" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ ok: false, error: "email" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  // A salted hash, never the address itself, to keep one visitor from flooding the inbox.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ip_hash = createHash("sha256")
    .update(ip + (process.env.REVALIDATE_SECRET ?? ""))
    .digest("hex")
    .slice(0, 24);
  const recent = await sql`SELECT count(*)::int AS n FROM submissions WHERE ip_hash = ${ip_hash} AND created_at > now() - interval '1 hour'`;
  if ((recent[0]?.n as number) >= 5) return Response.json({ ok: false, error: "rate" }, { status: 429 });

  await sql`INSERT INTO submissions (contact, message, ip_hash) VALUES (${email}, ${message}, ${ip_hash})`;

  // Ping the owner's phone after the response is sent; a failed push must never fail the visitor's message.
  after(() => notify(email, message));
  return Response.json({ ok: true });
}

async function notify(email: string, message: string) {
  const { PUSHOVER_TOKEN, PUSHOVER_USER } = process.env;
  if (!PUSHOVER_TOKEN || !PUSHOVER_USER) return;
  try {
    await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      body: new URLSearchParams({ token: PUSHOVER_TOKEN, user: PUSHOVER_USER, title: `New message from ${email}`, message: message.slice(0, 500), url: "/admin" }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {}
}
