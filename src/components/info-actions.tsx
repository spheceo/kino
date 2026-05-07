"use client";

import { useMutation, useQuery } from "convex/react";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoAdd, IoCheckmark, IoPlay, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { api } from "../../convex/_generated/api";

const PREVIEW_STATE_EVENT = "kino:info-preview-state";
const PREVIEW_MUTED_EVENT = "kino:info-preview-muted";

type PreviewStateDetail = {
  contentId?: string;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
  isPreviewing?: boolean;
};

type PreviewMutedDetail = {
  contentId?: string;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
  muted?: boolean;
};

type InfoActionsProps = {
  contentId: string | number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  title: string;
};

function postPreviewCommand(command: { type: string; muted?: boolean }) {
  const iframe = document.querySelector<HTMLIFrameElement>(
    'iframe[title="Kino preview player"]',
  );

  iframe?.contentWindow?.postMessage(command, "*");
}

function matchesPreviewIdentity(
  detail: PreviewStateDetail | PreviewMutedDetail | undefined,
  contentId: string,
  mediaType: "movie" | "tv",
  season?: number,
  episode?: number,
) {
  if (String(detail?.contentId) !== contentId) {
    return false;
  }

  if (mediaType === "movie") {
    return detail?.mediaType !== "tv";
  }

  return (
    detail?.mediaType === "tv" &&
    String(detail?.season) === String(season ?? 1) &&
    String(detail?.episode) === String(episode ?? 1)
  );
}

export function InfoActions({
  contentId,
  mediaType,
  season,
  episode,
  title,
}: InfoActionsProps) {
  const iconRef = useRef<HTMLDivElement>(null);
  const toggleWatchLater = useMutation(api.watchLater.toggle);
  const contentIdString = String(contentId);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const saved = useQuery(api.watchLater.isSaved, {
    mediaType,
    tmdbId: contentIdString,
    seasonNumber: season,
    episodeNumber: episode,
  });
  const [optimisticSaved, setOptimisticSaved] = useState(false);
  const isSaved = saved ?? optimisticSaved;

  useEffect(() => {
    if (saved !== undefined) {
      setOptimisticSaved(saved);
    }
  }, [saved]);

  useEffect(() => {
    function handlePreviewState(event: Event) {
      const detail = (event as CustomEvent<PreviewStateDetail>).detail;

      if (
        !matchesPreviewIdentity(
          detail,
          contentIdString,
          mediaType,
          season,
          episode,
        )
      ) {
        return;
      }

      setIsPreviewing(Boolean(detail.isPreviewing));
    }

    function handleMutedState(event: Event) {
      const detail = (event as CustomEvent<PreviewMutedDetail>).detail;

      if (
        !matchesPreviewIdentity(
          detail,
          contentIdString,
          mediaType,
          season,
          episode,
        )
      ) {
        return;
      }

      setIsMuted(Boolean(detail.muted));
    }

    window.addEventListener(PREVIEW_STATE_EVENT, handlePreviewState);
    window.addEventListener(PREVIEW_MUTED_EVENT, handleMutedState);

    return () => {
      window.removeEventListener(PREVIEW_STATE_EVENT, handlePreviewState);
      window.removeEventListener(PREVIEW_MUTED_EVENT, handleMutedState);
    };
  }, [contentIdString, episode, mediaType, season]);

  function toggleMuted() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    postPreviewCommand({ type: "kino:set-muted", muted: nextMuted });
  }

  async function handleWatchLater() {
    const nextSaved = !isSaved;
    setOptimisticSaved(nextSaved);

    gsap.fromTo(
      iconRef.current,
      { rotate: 0, scale: 0.8, opacity: 0.4 },
      { rotate: 360, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" },
    );

    const result = await toggleWatchLater({
      mediaType,
      tmdbId: contentIdString,
      title,
      seasonNumber: season,
      episodeNumber: episode,
    });
    setOptimisticSaved(result);
  }

  const watchHref =
    mediaType === "tv"
      ? `/watch/tv/${encodeURIComponent(contentIdString)}/${encodeURIComponent(String(season ?? 1))}/${encodeURIComponent(String(episode ?? 1))}`
      : `/watch/${encodeURIComponent(contentIdString)}`;

  return (
    <div className="mt-10 flex items-center gap-4">
      <Link
        href={watchHref}
        className="flex h-14 w-60 items-center justify-center gap-3 rounded-full bg-white font-semibold text-black"
      >
        <IoPlay size={22} />
        Watch Now
      </Link>
      <button
        type="button"
        aria-label={isSaved ? "Remove from watch later" : "Add to watch later"}
        onClick={handleWatchLater}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#2c2c2c] text-white transition-colors hover:bg-[#3a3a3a]"
      >
        <div ref={iconRef}>
          {isSaved ? <IoCheckmark size={34} /> : <IoAdd size={34} />}
        </div>
      </button>
      {isPreviewing ? (
        <button
          type="button"
          aria-label={isMuted ? "Unmute preview" : "Mute preview"}
          onClick={toggleMuted}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2c2c2c] text-white transition-colors hover:bg-[#3a3a3a]"
        >
          {isMuted ? <IoVolumeMute size={25} /> : <IoVolumeHigh size={25} />}
        </button>
      ) : null}
    </div>
  );
}
