"use client";

import clsx from "clsx";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const input = inputRef.current;

    if (!container || !input) return;

    gsap.to(container, {
      width: isOpen ? 288 : 44,
      duration: 0.35,
      ease: "power3.out",
      onComplete: () => {
        if (isOpen) input.focus();
      },
    });

    gsap.to(input, {
      autoAlpha: isOpen ? 1 : 0,
      duration: isOpen ? 0.2 : 0.12,
      ease: "power2.out",
    });

    return () => {
      gsap.killTweensOf([container, input]);
    };
  }, [isOpen]);

  return (
    <div className="ml-auto flex items-center">
      <div
        ref={containerRef}
        className={clsx(
          "flex h-11 w-11 items-center overflow-hidden rounded-full transition-colors duration-200",
          isOpen
            ? "cursor-text border border-white/30 bg-black/40 backdrop-blur-sm"
            : "cursor-pointer bg-transparent",
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
          aria-label="Open search"
          aria-expanded={isOpen}
        >
          <IoSearch size={isOpen ? 24 : 30} />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Titles, people, genres"
          value={query}
          className="min-w-0 flex-1 bg-transparent pr-4 text-sm text-white opacity-0 outline-none placeholder:text-white/50"
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            router.push(
              value.trim()
                ? `/search?q=${encodeURIComponent(value)}`
                : "/search",
            );
          }}
          onBlur={() => setIsOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          tabIndex={isOpen ? 0 : -1}
        />
      </div>
    </div>
  );
}
