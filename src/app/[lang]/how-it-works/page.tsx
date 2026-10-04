import type { Metadata } from "next";
import { getMessages } from "@/i18n";
import { m } from "@/i18n/messages/how-it-works";
import Image from "next/image";
import { View, ViewHead } from "@/components/view-head";
import { SectionTitle, Tile, TileFigure } from "@/components/tile";
import { Ballot } from "@/components/ballot";
import { SeatsCalculator } from "@/components/seats-calculator";
import { Timeline } from "@/components/timeline";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return { title: t.metaTitle, description: t.metaDescription };
}

function Painted({ name }: { name: string }) {
  return <Image src={`/media/illustrations/${name}.png`} alt="" width={1000} height={1000} sizes="420px" className="h-[86%] w-auto mix-blend-multiply [mask-image:radial-gradient(closest-side,black_78%,transparent_100%)]" />;
}

/** One step, wide: the object on one side, a plain explanation beside it. */
function Step({ label, title, tile, visual, children }: { label: string; title: string; tile: string; visual: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="grid items-center gap-6 py-10 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-16 lg:py-14">
      <Tile className={tile}>{visual}</Tile>
      <div>
        <p className="text-lg text-ink-2 tabular-nums">{label}</p>
        <h3 className="serif mt-1 text-4xl sm:text-5xl">{title}</h3>
        <div className="mt-5 max-w-xl space-y-3 text-xl leading-relaxed text-ink-2">{children}</div>
      </div>
    </section>
  );
}

export default async function HowItWorks() {
  const t = await getMessages(m);
  return (
    <View>
      <ViewHead title={t.title} hint={t.hint} />

      <SectionTitle compact>{t.electionDay}</SectionTitle>
      <div className="grid gap-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        <TileFigure compact className="bg-cream" lead={t.tray.lead} text={t.tray.text}>
          <Painted name="tray" />
        </TileFigure>
        <TileFigure compact className="bg-[#dcebf3]" lead={t.envelope.lead} text={t.envelope.text}>
          <Painted name="envelope" />
        </TileFigure>
        <TileFigure compact className="bg-tile" lead={t.box.lead} text={t.box.text}>
          <Painted name="ballot-box" />
        </TileFigure>
      </div>

      <SectionTitle compact>{t.fromVotes}</SectionTitle>
      <div className="divide-y divide-line">
        <Step label={t.step("1")} title={t.s1.title} tile="bg-accent" visual={<p className="serif text-[clamp(3.5rem,6vw,6.5rem)] text-white" dir="ltr">3.25%</p>}>
          <p>{t.s1.p1}</p>
          <p>{t.s1.p2}</p>
        </Step>
        <Step label={t.step("2")} title={t.s2.title} tile="bg-tile" visual={
          <div className="grid grid-cols-15 gap-1.5 sm:gap-2 lg:gap-1.5">
            {Array.from({ length: 120 }, (_, i) => (
              <span key={i} className={`size-2.5 rounded-full sm:size-3.5 lg:size-2.5 xl:size-3 ${i < 61 ? "bg-ink" : "bg-ink/15"}`} />
            ))}
          </div>
        }>
          <p>{t.s2.p1}</p>
          <p>{t.s2.p2}</p>
        </Step>
        <Step label={t.step("3")} title={t.s3.title} tile="bg-[#dbe6fa]" visual={
          <div className="w-[72%] rounded-[1.5rem] bg-card p-4 shadow-[0_30px_60px_-30px_rgb(10_12_27/0.4)]">
            <p className="text-center text-sm font-medium">{t.s3.card}</p>
            {[
              [t.s3.first, "115"],
              [t.s3.surplus, "5+"],
              [t.s3.total, "120"],
            ].map(([k, v], i) => (
              <div key={k} className={`flex items-baseline justify-between py-1.5 ${i ? "border-t border-line" : "mt-2"}`}>
                <span className={i === 2 ? "font-medium" : "text-ink-2"}>{k}</span>
                <span className="serif text-2xl tabular-nums" dir="ltr">{v}</span>
              </div>
            ))}
          </div>
        }>
          <p>{t.s3.p1}</p>
          <p>{t.s3.p2}</p>
        </Step>
        <Step label={t.step("4")} title={t.s4.title} tile="bg-cream" visual={
          <div className="flex items-center">
            <Ballot letters="א" color="#0038b8" size="md" className="rotate-6" />
            <Ballot letters="ב" color="#ef6b3a" size="md" className="-ms-6 -rotate-6" />
          </div>
        }>
          <p>{t.s4.p1}</p>
          <p>{t.s4.p2}</p>
        </Step>
      </div>

      <SectionTitle compact>{t.tryIt}</SectionTitle>
      <div className="max-w-6xl">
        <SeatsCalculator />
      </div>

      <div id="timeline" className="scroll-mt-4">
        <SectionTitle compact>{t.timeline}</SectionTitle>
      </div>
      <div className="max-w-6xl">
        <Timeline compact />
      </div>
    </View>
  );
}
