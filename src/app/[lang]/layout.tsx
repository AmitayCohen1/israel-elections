import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { Frank_Ruhl_Libre, Heebo, Noto_Sans_Arabic, Noto_Sans_Ethiopic } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header, Rail } from "@/components/shell";
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
          {/* A fixed app. The sidebar is the card: grey, rounded, floating. The content is simply the page, and scrolls on its own. */}
          <div className="flex h-dvh flex-col">
            <Suspense fallback={<div className="h-16 shrink-0 lg:hidden" />}>
              <Header />
            </Suspense>
            <div className="flex min-h-0 flex-1">
              <Rail />
              <div data-scroll-root className="flex min-w-0 flex-1 flex-col overflow-y-auto">
                <main className="flex-1 lg:min-h-0">{children}</main>
                <div className="lg:hidden">
                  <Footer dict={dict} />
                </div>
              </div>
            </div>
          </div>
        </DictionaryProvider>
        <Analytics />
      </body>
    </html>
  );
}
