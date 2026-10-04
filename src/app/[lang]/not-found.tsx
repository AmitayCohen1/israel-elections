"use client";

import Link from "@/i18n/link";
import { Illustration } from "@/components/illustration";
import { useDict } from "@/i18n/provider";

export default function NotFound() {
  const { ui } = useDict();
  return (
    <div className="mx-auto max-w-xl px-4 pt-32 text-center">
      <Illustration name="slips" />
      <h1 className="serif mt-6 text-6xl">{ui.nfTitle}</h1>
      <p className="mt-6 text-xl text-ink-2">{ui.nfBody}</p>
      <Link href="/" className="mt-10 inline-block rounded-full bg-ink px-7 py-3.5 text-lg font-medium text-paper transition hover:bg-accent">
        {ui.nfCta}
      </Link>
    </div>
  );
}
