"use client";

import { LOCALE_INFO } from "@/i18n/config";
import { useLocale, useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/seats";
import { useState } from "react";
import { allocate, THRESHOLD } from "@/lib/seats";
import { Chevron } from "@/components/chevron";

// Deliberately fictional lists: the mechanics, not any real party.
const START = [
  { id: "א", color: "#2f5fe0", votes: 1_050_000 },
  { id: "ב", color: "#ef6b3a", votes: 640_000 },
  { id: "ג", color: "#1fa37a", votes: 520_000 },
  { id: "ד", color: "#e8b100", votes: 410_000 },
  { id: "ה", color: "#2b8fe0", votes: 300_000 },
  { id: "ו", color: "#c2447a", votes: 150_000 },
];

export function SeatsCalculator() {
  const t = useMessages(m);
  const intl = LOCALE_INFO[useLocale()].intl;
  const fmt = (n: number) => Math.round(n).toLocaleString(intl);
  const [state, setParties] = useState(START);
  const parties = state.map((p, i) => ({ ...p, name: t.names[i] }));
  const [pact, setPact] = useState(true);

  const total = parties.reduce((n, p) => n + p.votes, 0);
  const result = allocate(parties, pact ? [["ב", "ג"]] : []);
  const noPact = allocate(parties);
  const seatsGrid = parties.flatMap((p) => Array.from({ length: result.final[p.id] }, () => p));
  const gain = result.final["ב"] + result.final["ג"] - (noPact.final["ב"] + noPact.final["ג"]);

  return (
    <div>
      <p className="text-xl text-ink-2">{t.intro}</p>

      <div className="mt-6 grid gap-x-12 gap-y-6 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="grid grid-cols-20 gap-1.5 rounded-[2rem] bg-tile p-5 sm:gap-2 sm:p-7" role="img" aria-label={t.gridLabel}>
            {seatsGrid.map((p, i) => (
              <span key={i} className="aspect-square rounded-full transition-colors duration-300" style={{ background: p.color }} title={p.name} />
            ))}
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-4 rounded-3xl bg-tile p-5">
            <input type="checkbox" checked={pact} onChange={(e) => setPact(e.target.checked)} className="size-5 accent-[#0e0d12]" />
            <span>
              <span className="block text-lg font-medium">{t.pact}</span>
              <span className="block text-ink-2">
                {!pact ? t.pactOff : gain > 0 ? t.pactGain(gain) : t.pactNone}
              </span>
            </span>
          </label>
        </div>

        <ul className="space-y-4">
          {parties.map((p, i) => {
            const out = !result.passed.includes(p.id);
            return (
              <li key={p.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={`v-${p.id}`} className="flex items-center gap-3 text-xl font-medium">
                    <span className="size-4 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </label>
                  <span className="text-lg tabular-nums">{out ? <span className="text-muted">{t.below}</span> : <span className="font-medium">{t.seats(result.final[p.id])}</span>}</span>
                </div>
                <input
                  id={`v-${p.id}`}
                  type="range"
                  min={20_000}
                  max={1_500_000}
                  step={5_000}
                  value={p.votes}
                  onChange={(e) => setParties((ps) => ps.map((x, j) => (j === i ? { ...x, votes: Number(e.target.value) } : x)))}
                  className="mt-2 w-full"
                  style={{ accentColor: p.color }}
                  aria-valuetext={t.valueText(p.votes, fmt(p.votes), ((p.votes / total) * 100).toFixed(1))}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <details className="group mt-4 border-b border-line">
        <summary className="flex cursor-pointer items-center justify-between py-4 text-lg font-medium">
          {t.details}
          <Chevron className="size-10 bg-tile" />
        </summary>
        <dl className="grid grid-cols-3 gap-4 pb-8 text-center">
          <Mini label={t.valid} value={fmt(total)} />
          <Mini label={t.threshold((THRESHOLD * 100).toFixed(2))} value={fmt(result.threshold)} />
          <Mini label={t.quota} value={fmt(result.quota)} />
        </dl>
        <table className="mb-10 w-full text-lg">
          <thead>
            <tr className="text-start text-sm text-muted">
              <th className="pb-3 font-normal">{t.party}</th>
              <th className="pb-3 font-normal">{t.first}</th>
              <th className="pb-3 font-normal">{t.surplus}</th>
              <th className="pb-3 font-normal">{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => {
              const passed = result.passed.includes(p.id);
              return (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-3">{p.name}</td>
                  <td className="tabular-nums">{passed ? result.initial[p.id] : "—"}</td>
                  <td className="tabular-nums">{passed ? `+${result.final[p.id] - result.initial[p.id]}` : "—"}</td>
                  <td className="font-medium tabular-nums">{result.final[p.id]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="serif text-3xl tabular-nums sm:text-4xl">{value}</dd>
      <dt className="mt-1 text-sm text-muted">{label}</dt>
    </div>
  );
}
