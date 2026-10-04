import { revalidateTag } from "next/cache";

/** Call after re-seeding: POST /api/revalidate with header `x-revalidate-secret`. */
export async function POST(request: Request) {
  if (!process.env.REVALIDATE_SECRET || request.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag("dataset", "max");
  return Response.json({ ok: true });
}
