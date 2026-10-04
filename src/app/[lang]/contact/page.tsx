import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getMessages } from "@/i18n";
import { m } from "@/i18n/messages/contact";
import { ContactForm } from "@/components/contact-form";
import { View, ViewHead } from "@/components/view-head";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages(m);
  return pageMeta({ path: "/contact", title: t.title, description: t.hint });
}

export default async function Contact() {
  const t = await getMessages(m);
  return (
    <View width="form">
      <ViewHead title={t.title} hint={t.hint} />
      <ContactForm />
    </View>
  );
}
