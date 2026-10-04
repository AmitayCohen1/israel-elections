import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { neon } from "@neondatabase/serverless";
import { getAdmin } from "@/lib/admin";

type Count = { label: string | null; n: number };
type Day = { day: string; views: number; visitors: number };
type Message = { id: number; created_at: string; list_name: string | null; name: string | null; contact: string | null; link: string | null; message: string; status: string };

const fmt = new Intl.NumberFormat("en");
const TZ = "Asia/Jerusalem";

async function load() {
  const sql = neon(process.env.DATABASE_URL!);
  const [totals, days, pages, referrers, countries, devices, langs, messages] = await Promise.all([
    sql`SELECT count(*)::int AS views, count(DISTINCT visitor)::int AS visitors,
        count(*) FILTER (WHERE (created_at AT TIME ZONE ${TZ})::date = (now() AT TIME ZONE ${TZ})::date)::int AS today
        FROM page_views WHERE created_at > now() - interval '30 days'`,
    sql`SELECT to_char(d::date, 'YYYY-MM-DD') AS day, coalesce(v.views, 0)::int AS views, coalesce(v.visitors, 0)::int AS visitors
        FROM generate_series((now() AT TIME ZONE ${TZ})::date - 29, (now() AT TIME ZONE ${TZ})::date, '1 day') d
        LEFT JOIN (SELECT (created_at AT TIME ZONE ${TZ})::date AS day, count(*) AS views, count(DISTINCT visitor) AS visitors
                   FROM page_views WHERE created_at > now() - interval '31 days' GROUP BY 1) v ON v.day = d::date
        ORDER BY d`,
    sql`SELECT path AS label, count(*)::int AS n FROM page_views WHERE created_at > now() - interval '30 days' GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    sql`SELECT referrer AS label, count(*)::int AS n FROM page_views WHERE created_at > now() - interval '30 days' AND referrer IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    sql`SELECT country AS label, count(*)::int AS n FROM page_views WHERE created_at > now() - interval '30 days' AND country IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    sql`SELECT device AS label, count(*)::int AS n FROM page_views WHERE created_at > now() - interval '30 days' GROUP BY 1 ORDER BY 2 DESC`,
    sql`SELECT lang AS label, count(*)::int AS n FROM page_views WHERE created_at > now() - interval '30 days' AND lang IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`,
    sql`SELECT s.id, s.created_at::text, l.name AS list_name, s.name, s.contact, s.link, s.message, s.status
        FROM submissions s LEFT JOIN lists l ON l.slug = s.list_slug ORDER BY s.id DESC LIMIT 200`,
  ]);
  return {
    totals: totals[0] as { views: number; visitors: number; today: number },
    days: days as Day[],
    pages: pages as Count[],
    referrers: referrers as Count[],
    countries: countries as Count[],
    devices: devices as Count[],
    langs: langs as Count[],
    messages: messages as Message[],
  };
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-tile p-5">
      <p className="text-base text-muted">{label}</p>
      <p className="mt-1 text-3xl font-medium tabular-nums">{fmt.format(value)}</p>
    </div>
  );
}

function Chart({ days }: { days: Day[] }) {
  const max = Math.max(1, ...days.map((d) => d.views));
  return (
    <div className="rounded-2xl bg-tile p-5">
      <p className="text-base text-muted">Page views per day · last 30 days</p>
      <div className="mt-4 flex h-40 items-end gap-1" role="img" aria-label="Daily page views">
        {days.map((d) => (
          <div key={d.day} className="group relative flex-1 rounded-t bg-accent/80 hover:bg-accent" style={{ height: `${Math.max(2, (d.views / max) * 100)}%` }}>
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-base text-paper group-hover:block">
              {d.day} · {d.views} views · {d.visitors} visitors
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Top({ title, rows, empty = "No data yet" }: { title: string; rows: Count[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="rounded-2xl bg-tile p-5">
      <p className="text-base text-muted">{title}</p>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="relative overflow-hidden rounded-lg px-3 py-1.5 text-base">
            <span className="absolute inset-y-0 start-0 bg-accent/10" style={{ width: `${(r.n / max) * 100}%` }} />
            <span className="relative flex justify-between gap-4">
              <span className="truncate" dir="auto">{r.label}</span>
              <span className="tabular-nums text-ink-2">{fmt.format(r.n)}</span>
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-base text-ink-2">{empty}</li>}
      </ul>
    </div>
  );
}

async function Dashboard() {
  const d = await load();
  return (
    <>
      <section className="mt-8">
        <h2 className="text-xl font-medium">Analytics</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Views today" value={d.totals.today} />
          <Stat label="Views · 30 days" value={d.totals.views} />
          <Stat label="Visitors · 30 days" value={d.totals.visitors} />
        </div>
        <div className="mt-3"><Chart days={d.days} /></div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Top title="Top pages" rows={d.pages} />
          <Top title="Referrers" rows={d.referrers} empty="No external referrers yet" />
          <Top title="Countries" rows={d.countries} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Top title="Devices" rows={d.devices} />
            <Top title="Languages" rows={d.langs} />
          </div>
        </div>
        <p className="mt-3 text-base text-muted">Cookieless and anonymous. Visitors are counted per day; bots are skipped.</p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Messages <span className="text-ink-2">({d.messages.length})</span></h2>
        <ul className="mt-4 border-t border-line">
          {d.messages.map((m) => (
            <li key={m.id} className="border-b border-line py-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-base text-muted">
                <span className="text-base font-medium text-ink" dir="auto">
                  {m.contact ? <a href={`mailto:${m.contact}`} className="hover:underline">{m.contact}</a> : (m.list_name ?? "No email")}
                </span>
                <span>{new Date(m.created_at).toLocaleString("en-GB", { timeZone: TZ })}</span>
                <span className="rounded-full bg-tile px-3 py-0.5">{m.status}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed" dir="auto">{m.message}</p>
              {(m.link || m.name || m.list_name) && (
                <div className="mt-2 flex flex-wrap gap-x-5 text-base text-ink-2">
                  {m.link && <a href={m.link} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline" dir="ltr">{m.link}</a>}
                  {m.name && <span dir="auto">{m.name}</span>}
                  {m.list_name && m.contact && <span dir="auto">{m.list_name}</span>}
                </div>
              )}
            </li>
          ))}
          {d.messages.length === 0 && <li className="py-10 text-center text-ink-2">No messages yet.</li>}
        </ul>
      </section>
    </>
  );
}

async function Who() {
  const admin = await getAdmin();
  return <span className="text-base text-ink-2">{admin?.email}</span>;
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Admin</h1>
        <div className="flex items-center gap-3">
          <Suspense><Who /></Suspense>
          <UserButton />
        </div>
      </header>
      <Suspense fallback={<p className="mt-10 text-ink-2">Loading…</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
