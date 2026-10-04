import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { Frank_Ruhl_Libre, Heebo, Noto_Sans_Arabic, Noto_Sans_Ethiopic } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header, TopBar } from "@/components/shell";
import { LOCALES, LOCALE_INFO, getDictionary, hasLocale } from "@/i18n";
import { Track } from "@/components/track";
import { DictionaryProvider } from "@/i18n/provider";
import { SITE_URL, pageMeta } from "@/lib/seo";
import "../globals.css";

const heebo = Heebo({ variable: "--font-heebo", subsets: ["hebrew", "latin"] });
const frank = Frank_Ruhl_Libre({ variable: "--font-frank", subsets: ["hebrew", "latin"], weight: ["400", "500", "700", "900"] });
// Only fetched when a page actually shows these scripts.
const arabic = Noto_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"], preload: false });
const ethiopic = Noto_Sans_Ethiopic({ variable: "--font-ethiopic", subsets: ["ethiopic"], preload: false });

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta, ui } = await getDictionary(lang);
  // Pages override the title, canonical and share card with pageMeta(); this is the frame they inherit.
  const base = await pageMeta({});
  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    title: { default: meta.title, template: meta.titleTemplate },
    applicationName: ui.brand,
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <html lang={lang} dir={LOCALE_INFO[lang].dir} className={`${heebo.variable} ${frank.variable} ${arabic.variable} ${ethiopic.variable} h-full antialiased`}>
      <body className="font-sans">
        {/* The pieces that read the address sit behind Suspense, so pages that are not prerendered still get the frame at once. */}
        <Suspense>
          <Track />
        </Suspense>
        <DictionaryProvider lang={lang} dict={dict}>
          {/* A classic page: the bar stays at the top, the page scrolls under it, the footer closes it. */}
          <div className="flex min-h-dvh flex-col">
            <Suspense fallback={<div className="h-16 shrink-0 xl:h-20" />}>
              <Header />
              <TopBar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer dict={dict} />
          </div>
        </DictionaryProvider>
        <Analytics />
      </body>
    </html>
  );
}
