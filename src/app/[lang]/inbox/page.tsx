import { getIntl } from "@/i18n";
import type { Metadata } from "next";
import { neon } from "@neondatabase/serverless";

export const metadata: Metadata = { title: "פניות", robots: { index: false, follow: false } };

// Reads the database per request, so it can't be prerendered into a static shell.
export const instant = false;

type Row = { id: number; created_at: string; list_name: string | null; name: string | null; contact: string | null; link: string | null; message: string; status: string };

export default async function Inbox() {
  const intl = await getIntl();
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`
    SELECT s.id, s.created_at::text, l.name AS list_name, s.name, s.contact, s.link, s.message, s.status
    FROM submissions s LEFT JOIN lists l ON l.slug = s.list_slug
    ORDER BY s.id DESC LIMIT 200`) as Row[];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <header className="pt-12 pb-10 text-center">
        <p className="text-sm tracking-wide text-muted">פנימי · לא מפורסם באתר</p>
        <h1 className="serif mt-5 text-5xl sm:text-6xl">פניות</h1>
        <p className="mt-4 text-ink-2">{rows.length} פניות. הודעות מעמוד יצירת הקשר.</p>
      </header>
      <ul className="border-t border-line">
        {rows.map((r) => (
          <li key={r.id} className="border-b border-line py-7">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-muted">
              <span className="title text-xl text-ink" dir="auto">{r.contact ?? r.list_name ?? "ללא מייל"}</span>
              <span>{new Date(r.created_at).toLocaleString(intl)}</span>
              <span className="rounded-full bg-tile px-3 py-0.5">{r.status}</span>
            </div>
            <p className="mt-3 text-lg leading-relaxed whitespace-pre-wrap">{r.message}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-2">
              {r.link && (
                <a href={r.link} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline" dir="ltr">
                  {r.link}
                </a>
              )}
              {r.name && <span>{r.name}</span>}
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="py-12 text-center text-lg text-ink-2">עדיין אין פניות.</li>}
      </ul>
    </div>
  );
}
