import "server-only";
import { currentUser } from "@clerk/nextjs/server";

const allowed = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/** The signed-in admin, or null. Only a *verified* email on the ADMIN_EMAILS list counts. */
export async function getAdmin() {
  const user = await currentUser();
  if (!user) return null;
  const list = allowed();
  const email = user.emailAddresses.find((e) => e.verification?.status === "verified" && list.includes(e.emailAddress.toLowerCase()));
  return email ? { id: user.id, email: email.emailAddress } : null;
}
