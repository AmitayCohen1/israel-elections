import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { neon } from "@neondatabase/serverless";
import { getAdmin } from "@/lib/admin";

type Count = { label: string | null; n: number };
type Day = { day: string; views: number; visitors: number };
type Engagement = { live: number; sessions: number; pages_per: number; bounce: number; session_s: number; view_s: number; scroll: number };
type PageRow = { path: string; views: number; avg_s: number; scroll: number };
type Journey = { session: string; started: string; device: string | null; country: string | null; steps: { path: string; s: number }[] };
type Message = { id: number; created_at: string; list_name: string | null; name: string | null; contact: string | null; link: string | null; message: string; status: string };

const fmt = new Intl.NumberFormat("en");
const TZ = "Asia/Jerusalem";

async function load() {
  const sql = neon(process.env.DATABASE_URL!);
  const [totals, days, pages, referrers, countries, devices, langs, messages, engagement, pageRows, entries, exits, tabs, buttons, outbound, searches, journeys] = await Promise.all([
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
    // Engagement only exists for views recorded with a session (the newer tracker).
    sql`WITH s AS (SELECT session, count(*) AS views, sum(engaged_ms) AS ms FROM page_views
                   WHERE created_at > now() - interval '30 days' AND session IS NOT NULL GROUP BY 1)
        SELECT (SELECT count(DISTINCT session) FROM page_views WHERE coalesce(last_seen, created_at) > now() - interval '5 minutes')::int AS live,
          count(*)::int AS sessions,
          coalesce(round(avg(views), 1), 0)::float AS pages_per,
          coalesce(round(100.0 * count(*) FILTER (WHERE views = 1) / nullif(count(*), 0)), 0)::int AS bounce,
          coalesce(round(avg(ms) / 1000), 0)::int AS session_s,
          (SELECT coalesce(round(avg(engaged_ms) / 1000), 0) FROM page_views WHERE created_at > now() - interval '30 days' AND session IS NOT NULL)::int AS view_s,
          (SELECT coalesce(round(avg(scroll_pct)), 0) FROM page_views WHERE created_at > now() - interval '30 days' AND session IS NOT NULL)::int AS scroll
        FROM s`,
    sql`SELECT path, count(*)::int AS views, round(avg(engaged_ms) / 1000)::int AS avg_s, round(avg(scroll_pct))::int AS scroll
        FROM page_views WHERE created_at > now() - interval '30 days' AND session IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
    sql`SELECT path AS label, count(*)::int AS n FROM (SELECT DISTINCT ON (session) path FROM page_views
        WHERE created_at > now() - interval '30 days' AND session IS NOT NULL ORDER BY session, created_at) f GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    sql`SELECT path AS label, count(*)::int AS n FROM (SELECT DISTINCT ON (session) path FROM page_views
        WHERE created_at > now() - interval '30 days' AND session IS NOT NULL ORDER BY session, created_at DESC) f GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    ...(["tab", "button", "outbound", "search"] as const).map(
      (kind) => sql`SELECT label, count(*)::int AS n FROM events WHERE created_at > now() - interval '30 days' AND kind = ${kind} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    ),
    sql`SELECT session, min(created_at)::text AS started, min(device) AS device, min(country) AS country,
          json_agg(json_build_object('path', path, 's', round(engaged_ms / 1000)) ORDER BY created_at) AS steps
        FROM page_views WHERE created_at > now() - interval '2 days' AND session IS NOT NULL
        GROUP BY 1 ORDER BY max(created_at) DESC LIMIT 15`,
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
    engagement: engagement[0] as Engagement,
    pageRows: pageRows as PageRow[],
    entries: entries as Count[],
    exits: exits as Count[],
    tabs: tabs as Count[],
    buttons: buttons as Count[],
    outbound: outbound as Count[],
    searches: searches as Count[],
    journeys: journeys as Journey[],
  };
}

const dur = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`);

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-tile p-5">
      <p className="text-base text-muted">{label}</p>
      <p className="mt-1 text-3xl font-medium tabular-nums">{typeof value === "number" ? fmt.format(value) : value}</p>
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
        <h2 className="text-xl font-medium">Engagement</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Live now" value={d.engagement.live} />
          <Stat label="Sessions · 30 days" value={d.engagement.sessions} />
          <Stat label="Pages per session" value={d.engagement.pages_per} />
          <Stat label="Single-page sessions" value={`${d.engagement.bounce}%`} />
          <Stat label="Time per session" value={dur(d.engagement.session_s)} />
          <Stat label="Time per page" value={dur(d.engagement.view_s)} />
          <Stat label="Scroll depth" value={`${d.engagement.scroll}%`} />
        </div>

        <div className="mt-3 rounded-2xl bg-tile p-5">
          <p className="text-base text-muted">Pages · views, engaged time, how far down people read</p>
          <table className="mt-3 w-full text-base">
            <thead className="text-start text-muted">
              <tr><th className="py-1.5 text-start font-normal">Page</th><th className="font-normal">Views</th><th className="font-normal">Time</th><th className="font-normal">Scroll</th></tr>
            </thead>
            <tbody className="tabular-nums">
              {d.pageRows.map((r) => (
                <tr key={r.path} className="border-t border-line">
                  <td className="max-w-0 truncate py-1.5" dir="auto">{r.path}</td>
                  <td className="w-20 text-center">{fmt.format(r.views)}</td>
                  <td className="w-24 text-center">{dur(r.avg_s)}</td>
                  <td className="w-20 text-center">{r.scroll}%</td>
                </tr>
              ))}
              {d.pageRows.length === 0 && <tr><td className="py-2 text-ink-2">No data yet</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Top title="Entry pages" rows={d.entries} />
          <Top title="Exit pages" rows={d.exits} />
          <Top title="Tabs opened" rows={d.tabs} />
          <Top title="Buttons pressed" rows={d.buttons} />
          <Top title="Outbound links" rows={d.outbound} />
          <Top title="Searches" rows={d.searches} />
        </div>

        <div className="mt-3 rounded-2xl bg-tile p-5">
          <p className="text-base text-muted">Recent sessions · the path each visitor took, with time on each page</p>
          <ul className="mt-3 space-y-3">
            {d.journeys.map((j) => (
              <li key={j.session} className="border-t border-line pt-3 text-base">
                <p className="text-muted">
                  {new Date(j.started).toLocaleString("en-GB", { timeZone: TZ })} · {j.device ?? "?"} · {j.country ?? "?"}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                  {j.steps.map((st, i) => (
                    <span key={i} dir="auto">
                      {i > 0 && <span className="text-muted">→ </span>}
                      {st.path} <span className="text-ink-2 tabular-nums">({dur(st.s)})</span>
                    </span>
                  ))}
                </p>
              </li>
            ))}
            {d.journeys.length === 0 && <li className="text-base text-ink-2">No sessions yet</li>}
          </ul>
        </div>
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
