import type { Metadata } from "next";

export const metadata: Metadata = { title: "מפת עמדות" };

// The map lives with its options in dev-preview/map while it is being worked on; this is its public route.
export { default } from "../dev-preview/map/page";
