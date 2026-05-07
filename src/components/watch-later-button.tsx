"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { IoAdd, IoCheckmark } from "react-icons/io5";


export function WatchLaterButton({
  id,
  mediaType,
  title,
  season,
  episode,
  size = "md",
}: {
  id: string | number;
  mediaType: "movie" | "tv";
  title?: string;
  season?: number;
  episode?: number;
  size?: "md" | "lg";
}) {
  const contentId = String(id);
  const iconRef = useRef<HTMLDivElement>(null);
  const [optimisticSaved, setOptimisticSaved] = useState(false);
  const isSaved = optimisticSaved;
  const buttonSize = size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const iconSize = size === "lg" ? 34 : 29;

  useEffect(() => {
    const params = new URLSearchParams({ mediaType, tmdbId: contentId });
    if (season) params.set("seasonNumber", String(season));
    if (episode) params.set("episodeNumber", String(episode));
    fetch(`/api/watch-later?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { saved: false }))
      .then((data: { saved?: boolean }) => setOptimisticSaved(Boolean(data.saved)));
  }, [contentId, episode, mediaType, season]);

  async function handleClick() {
    const nextSaved = !isSaved;
    setOptimisticSaved(nextSaved);

    gsap.fromTo(
      iconRef.current,
      { rotate: 0, scale: 0.8, opacity: 0.4 },
      {
        rotate: 360,
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: "back.out(1.8)",
      },
    );

    const res = await fetch("/api/watch-later", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
      mediaType,
      tmdbId: contentId,
      title: title ?? `${mediaType === "tv" ? "Show" : "Movie"} ${contentId}`,
      seasonNumber: season,
      episodeNumber: episode,
      }),
    });
    const result = (await res.json()) as { saved?: boolean };
    setOptimisticSaved(Boolean(result.saved));
  }

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove from watch later" : "Add to watch later"}
      onClick={handleClick}
      className={`flex ${buttonSize} cursor-pointer items-center justify-center rounded-full bg-[#2c2c2c] text-white transition-colors hover:bg-[#3a3a3a]`}
    >
      <div ref={iconRef}>
        {isSaved ? <IoCheckmark size={iconSize} /> : <IoAdd size={iconSize} />}
      </div>
    </button>
  );
}
