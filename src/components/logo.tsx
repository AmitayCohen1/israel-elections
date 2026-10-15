"use client";

import Link from "@/i18n/link";
import Image from "next/image";
import { useDict } from "@/i18n/provider";

export function Logo() {
  const { ui } = useDict();
  return (
    <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 max-sm:shrink" aria-label={ui.homeAria}>
      <Image src="/media/illustrations/ballot-box.png" alt="" width={96} height={96} priority className="size-8 shrink-0 mix-blend-multiply sm:size-9" />
      <span className="serif truncate py-1 text-[1.4rem] sm:text-[1.6rem]">{ui.brand}</span>
    </Link>
  );
}
