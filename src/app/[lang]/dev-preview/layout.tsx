import { notFound } from "next/navigation";

/** Internal pages (unreviewed drafts, design options): they exist on a developer's machine only. */
export default function InternalLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
