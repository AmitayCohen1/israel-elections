import Image from "next/image";
import type { TopicKey } from "@/lib/topics";

export type IllustrationName = "ballot-box" | "envelope" | "slips" | "tray" | "knesset" | "microphone" | "magnifier" | "booklets";

/** A hand-painted object from the site's illustration set (public/media/illustrations). */
export function Illustration({ name, className = "" }: { name: IllustrationName; className?: string }) {
  return <Image src={`/media/illustrations/${name}.png`} alt="" width={1000} height={1000} sizes="240px" priority className={`mx-auto w-40 mix-blend-multiply sm:w-52 ${className}`} />;
}

/** The painted object for one of the eight topics — same set, one per topic, shared by every list. */
export function TopicIllustration({ topic, className = "" }: { topic: TopicKey; className?: string }) {
  return <Image src={`/media/illustrations/topics/${topic}.png`} alt="" width={1000} height={1000} sizes="240px" className={`mx-auto w-40 mix-blend-multiply sm:w-52 ${className}`} />;
}
