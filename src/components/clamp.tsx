"use client";

import { useState } from "react";

/** A tall block cut to a fixed height with a soft fade, and one button under it that opens the rest. */
export function Clamp({ children, label, height = "44rem" }: { children: React.ReactNode; label: string; height?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className={open ? "" : "relative overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"} style={open ? undefined : { maxHeight: height }}>
        {children}
      </div>
      {!open && (
        <p className="mt-6 text-center">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex h-14 items-center rounded-full bg-ink px-7 text-lg font-medium text-paper transition hover:bg-accent">
            {label}
          </button>
        </p>
      )}
    </div>
  );
}
