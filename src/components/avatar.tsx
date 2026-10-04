import Image from "next/image";
import { listColor, onColor } from "@/lib/color";

function initials(name: string) {
  const parts = name.replace(/["'׳״]/g, "").split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
}

export function Avatar({
  name,
  src,
  color,
  size = 48,
  className = "",
  priority = false,
}: {
  name: string;
  src: string | null;
  color: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className={`shrink-0 rounded-full bg-line object-cover object-top ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-bold ${className}`}
      style={{ width: size, height: size, background: listColor(color), color: onColor(color), fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}
