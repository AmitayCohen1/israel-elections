import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { getLocale, getMessages } from "@/i18n";
import { m } from "@/i18n/messages/games";
import { loadMatchData } from "@/lib/games";
import type { QAxis, QParty } from "@/lib/match";
import { View, ViewHead } from "@/components/view-head";
import { CoalitionBuilder } from "@/components/coalition-builder";

type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getMessages(m)).coalition;
  return pageMeta({ path: "/coalition", title: t.title, description: t.hint });
}

/** A shared link's coalition, read from the address: streamed in, so the empty builder can be prerendered. */
async function FromLink({ searchParams, axes, parties }: { searchParams: Search; axes: QAxis[]; parties: QParty[] }) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  return <CoalitionBuilder axes={axes} parties={parties} query={{ s: one(q.s), c: one(q.c) }} />;
}

export default async function Coalition({ searchParams }: { searchParams: Search }) {
  const t = (await getMessages(m)).coalition;
  const { axes, parties } = await loadMatchData(await getLocale());
  return (
    <View width="wide">
      <ViewHead title={t.title} hint={t.hint} />
      <Suspense fallback={<CoalitionBuilder axes={axes} parties={parties} query={{}} />}>
        <FromLink searchParams={searchParams} axes={axes} parties={parties} />
      </Suspense>
    </View>
  );
}
