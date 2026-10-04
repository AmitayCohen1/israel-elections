import { redirect } from "next/navigation";

/** The old topic index. Topics are a dashboard view now. */
export default async function PositionsIndex({ params }: PageProps<"/[lang]/positions">) {
  const { lang } = await params;
  redirect(`/${lang}/topics`);
}
