"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export function MediaRowScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  function scrollBy(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <div className="group/row relative">
      {/* Left arrow */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy("left")}
        className={`absolute -left-4 top-0 z-10 hidden h-full w-28 items-center justify-start pl-1 transition-opacity duration-200 md:flex ${canScrollLeft ? "opacity-0 group-hover/row:opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "linear-gradient(to right, var(--color-background) 30%, transparent)" }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-sm transition-colors hover:bg-white/[0.14]">
          <IoChevronBack size={18} />
        </span>
      </button>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy("right")}
        className={`absolute -right-4 top-0 z-10 hidden h-full w-28 items-center justify-end pr-1 transition-opacity duration-200 md:flex ${canScrollRight ? "opacity-0 group-hover/row:opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "linear-gradient(to left, var(--color-background) 30%, transparent)" }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-sm transition-colors hover:bg-white/[0.14]">
          <IoChevronForward size={18} />
        </span>
      </button>
    </div>
  );
}
