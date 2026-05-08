"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoPlay, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { WatchLaterButton } from "@/components/watch-later-button";

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
  const contentIdString = String(contentId);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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
    void fetch("/api/user-preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ muted: nextMuted }),
    });
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
      <WatchLaterButton
        id={contentIdString}
        mediaType={mediaType}
        title={title}
        season={season}
        episode={episode}
        size="lg"
      />
      {isPreviewing ? (
        <button
          type="button"
          aria-label={isMuted ? "Unmute preview" : "Mute preview"}
          onClick={toggleMuted}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#2c2c2c] text-white transition-colors hover:bg-[#3a3a3a]"
        >
          {isMuted ? <IoVolumeMute size={25} /> : <IoVolumeHigh size={25} />}
        </button>
      ) : null}
    </div>
  );
}
