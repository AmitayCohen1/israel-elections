"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The ballot slip sliding into the box, in the painted style: three seconds, silent, played once as it scrolls into view,
 * and again if you tap it (or on a loop, for a clip that lives on a dashboard). `autoplay` is for a clip that is on screen at load, like the hero. With reduced motion it stays on the still illustration. Multiply blending lets the white
 * ground disappear into whatever surface it sits on.
 */
export function VoteClip({ className = "", autoplay = false, loop = false }: { className?: string; autoplay?: boolean; loop?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStill(true);
      return;
    }
    if (autoplay) return; // the browser starts it as the page loads
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          void v.play().catch(() => {});
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [autoplay]);

  if (still) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/media/illustrations/ballot-box.png" alt="" className={`mix-blend-multiply ${className}`} />;
  }

  return (
    <video
      ref={video}
      src="/media/video/vote.mp4"
      poster="/media/video/vote-poster.jpg"
      muted
      loop={loop}
      autoPlay={autoplay}
      playsInline
      preload="auto"
      aria-hidden
      onClick={(e) => {
        e.currentTarget.currentTime = 0;
        void e.currentTarget.play();
      }}
      className={`cursor-pointer mix-blend-multiply ${className}`}
    />
  );
}
