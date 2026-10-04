"use client";

import { useEffect, useState } from "react";

/** One thing at a time: a segmented control that swaps panels. The URL hash selects a tab. */
export function Tabs({ tabs, panels }: { tabs: { id: string; label: string }[]; panels: React.ReactNode[] }) {
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

  return (
    <>
      <div role="tablist" className="scrollbar-none mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-tile p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            onClick={() => {
              setActive(t.id);
              window.history.replaceState(null, "", `#${t.id}`);
            }}
            className={`shrink-0 rounded-full px-5 py-2.5 text-base font-medium transition ${active === t.id ? "bg-card text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div key={tabs[i].id} role="tabpanel" hidden={tabs[i].id !== active} className="pt-14">
          {panel}
        </div>
      ))}
    </>
  );
}
