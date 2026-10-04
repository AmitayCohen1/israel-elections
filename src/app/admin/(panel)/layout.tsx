import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getAdmin } from "@/lib/admin";

async function Gate({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (admin) return children;
  if (!(await auth()).userId) redirect("/admin/sign-in");
  // Signed in with an account that isn't on the list: say nothing about what lives here.
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-xl font-medium">No access</p>
      <p className="text-ink-2">This account isn&apos;t allowed here.</p>
      <SignOutButton redirectUrl="/admin/sign-in">
        <button className="rounded-full bg-tile px-5 py-2.5 text-base font-medium hover:bg-mist-deep">Sign out</button>
      </SignOutButton>
    </main>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
