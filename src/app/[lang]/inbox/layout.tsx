import { notFound } from "next/navigation";

/** Messages from lists: read on a developer's machine, or straight in the database. */
export default function InboxLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
