import type { Metadata } from "next";
import { loadAxes } from "@/lib/axes";
import { View, ViewHead } from "@/components/view-head";
import { AxisStacks } from "./options";

export const metadata: Metadata = { title: "Dev preview · position map", robots: { index: false } };

export default async function PositionMap() {
  // Only questions whose answers form a scale can sit on a line.
  const axes = (await loadAxes()).filter((a) => a.ordered);
  return (
    <View>
      <ViewHead title="מפת עמדות" hint="בחרו נושא, וראו איפה כל מפלגה עומדת. לחצו על מפלגה כדי לקרוא את מה שכתבה, עם המקור." />
      <AxisStacks axes={axes} />
    </View>
  );
}
