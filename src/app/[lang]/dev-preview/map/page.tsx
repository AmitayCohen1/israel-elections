import type { Metadata } from "next";
import { loadAxes } from "@/lib/axes";
import { ModeTabs } from "@/components/mode-tabs";
import { MapBand } from "./options";

export const metadata: Metadata = { title: "Dev preview · position map", robots: { index: false } };

/** The map page is the map as the overview shows it: one grey band under the top bar, the view's tabs at its head. */
export default async function PositionMap() {
  // Only questions whose answers form a scale can sit on a line.
  const axes = (await loadAxes()).filter((a) => a.ordered);
  return (
    <>
      <h1 className="sr-only">מפת עמדות</h1>
      {/* The band fills the screen under the top bar (5rem on wide screens, 4rem on narrow ones); the view's tabs open it. */}
      <MapBand
        axes={axes}
        art={false}
        top={
          <div key="tabs" className="mb-10 flex justify-center sm:mb-14">
            <ModeTabs />
          </div>
        }
        className="min-h-[calc(100dvh-4rem)] py-10 sm:py-14 xl:min-h-[calc(100dvh-5rem)]"
      />
    </>
  );
}
