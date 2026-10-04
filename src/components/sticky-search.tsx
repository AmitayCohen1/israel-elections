"use client";

import { useEffect, useState } from "react";
import { SearchBox } from "./search-box";

/** The search follows you down the page once the hero is out of view, and steps aside for the footer and for the topic lens. */
export function StickySearch() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const update = () => {
      const footer = document.querySelector("footer");
      const nearEnd = footer ? footer.getBoundingClientRect().top < window.innerHeight + 40 : false;
      const lens = document.querySelector("[data-explorer]")?.getBoundingClientRect();
      const overLens = !!lens && lens.top < window.innerHeight && lens.bottom > 0;
      setShow(window.scrollY > window.innerHeight * 0.9 && !nearEnd && !overLens);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-6 z-30 flex justify-center px-4 transition duration-300 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}
    >
      <div className="w-full max-w-[36rem]">
        <SearchBox openUp />
      </div>
    </div>
  );
}
