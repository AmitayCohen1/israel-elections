"use client";

import { useEffect, useState } from "react";

/**
 * Real tabs: they swap the content in place and never leave the page. The address's hash remembers the tab, so a link
 * or a refresh opens the same one. Wide screens get a row of tabs; a phone gets one select, so no tab hides off the edge.
 */
export function PageTabs({ label, tabs, panels }: { label: string; tabs: { id: string; label: string }[]; panels: React.ReactNode[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const ids = tabs.map((t) => t.id).join(",");

  useEffect(() => {
    const fromHash = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (ids.split(",").includes(h)) setActive(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [ids]);

  const pick = (id: string) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      <label className="block sm:hidden">
        <span className="sr-only">{label}</span>
        <select value={active} onChange={(e) => pick(e.target.value)} className="h-12 w-full rounded-xl border border-line-strong bg-paper px-3 text-lg font-semibold">
          {tabs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <div role="tablist" aria-label={label} className="hidden flex-wrap gap-x-1 border-b border-line-strong sm:flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            onClick={() => pick(t.id)}
            className={`-mb-px border-b-[3px] px-3 py-2.5 text-lg transition ${active === t.id ? "border-ink font-semibold text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div key={tabs[i].id} role="tabpanel" hidden={tabs[i].id !== active} className="pt-6">
          {panel}
        </div>
      ))}
    </>
  );
}
