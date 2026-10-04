import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Its own root layout: the admin is English, left-to-right, and apart from the public site's shell.
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="font-sans bg-paper text-ink">
        <Suspense>
          <ClerkProvider dynamic>{children}</ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
