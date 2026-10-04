"use client";

import { useState } from "react";
import { useMessages } from "@/i18n/link";
import { m } from "@/i18n/messages/contact";

const field = "mt-2 w-full rounded-2xl bg-tile px-5 py-3.5 text-lg outline-none ring-1 ring-transparent transition focus:bg-paper focus:ring-ink/30";

/** Email and a message. It posts to /api/contact and lands in the inbox. */
export function ContactForm() {
  const t = useMessages(m);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) return setState("done");
      setError(out.error === "short" ? t.short : out.error === "email" ? t.email : out.error === "rate" ? t.rate : t.error);
      setState("error");
    } catch {
      setError(t.error);
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div className="rounded-[2.5rem] bg-tile p-10 text-center">
        <p className="title text-3xl">{t.thanks}</p>
        <p className="mx-auto mt-3 max-w-md text-lg text-ink-2">{t.thanksBody}</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-6">
      <label className="block text-lg font-medium">
        {t.emailLabel}
        <input name="email" type="email" required maxLength={200} autoComplete="email" dir="ltr" className={`${field} text-start`} />
      </label>

      <label className="block text-lg font-medium">
        {t.messageLabel}
        <textarea name="message" required minLength={10} maxLength={2000} rows={7} className={field} />
      </label>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />

      {state === "error" && <p className="text-lg text-[#b3261e]">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="inline-flex h-14 items-center rounded-full bg-ink px-8 font-bold text-white transition hover:bg-accent disabled:opacity-60">
        {state === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}
