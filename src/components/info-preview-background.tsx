"use client";

import gsap from "gsap";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type InfoPreviewBackgroundProps = {
  id: string | number;
  backdropPath: string;
  runtime?: number;
  onPreviewChange?: (isPreviewing: boolean) => void;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
};

const PREVIEW_DELAY_SECONDS = 1;
const PREVIEW_DURATION_SECONDS = 45;
const DEFAULT_VIDEO_ASPECT_RATIO = 16 / 9;
const PREVIEW_STATE_EVENT = "kino:info-preview-state";
const PREVIEW_MUTED_EVENT = "kino:info-preview-muted";

function hashId(id: string) {
  let hash = 0;

  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function getPreviewStart(id: string, runtime?: number) {
  const runtimeSeconds = runtime ? runtime * 60 : 0;
  const maxStart = Math.max(60, runtimeSeconds - PREVIEW_DURATION_SECONDS - 60);

  if (maxStart <= 60) {
    return 60;
  }

  return 60 + (hashId(id) % (maxStart - 60));
}

function stopPreviewPlayer(iframe: HTMLIFrameElement | null) {
  iframe?.contentWindow?.postMessage({ type: "kino:mute" }, "*");
  iframe?.contentWindow?.postMessage(
    { type: "kino:set-muted", muted: true },
    "*",
  );
}

export function InfoPreviewBackground({
  id,
  backdropPath,
  runtime,
  onPreviewChange,
  mediaType,
  season = 1,
  episode = 1,
}: InfoPreviewBackgroundProps) {
  const contentId = String(id);
  const imageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const hasStartedPreviewRef = useRef(false);
  const [isPlayable, setIsPlayable] = useState(false);
  const [isDelayElapsed, setIsDelayElapsed] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState(
    DEFAULT_VIDEO_ASPECT_RATIO,
  );
  const previewStart = useMemo(
    () => getPreviewStart(contentId, runtime),
    [contentId, runtime],
  );

  const previewPath =
    mediaType === "tv"
      ? `/tv/${encodeURIComponent(contentId)}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}`
      : `/movie/${encodeURIComponent(contentId)}`;

  const previewUrl = `https://kino-api.up.railway.app${previewPath}?mode=preview&start=${previewStart}&duration=${PREVIEW_DURATION_SECONDS}&autoPlay=true&mute=true`;

  const matchesContentId = useCallback(
    (eventData: MessageEvent["data"]) => {
      if (mediaType === "tv") {
        const showMatch = eventData?.showId ?? eventData?.contentId;
        const seasonMatch = eventData?.season;
        const episodeMatch = eventData?.episode;

        return (
          String(showMatch) === contentId &&
          String(seasonMatch) === String(season) &&
          String(episodeMatch) === String(episode)
        );
      }

      return String(eventData?.contentId) === contentId;
    },
    [contentId, episode, mediaType, season],
  );

  const setPreviewing = useCallback(
    (nextPreviewing: boolean) => {
      onPreviewChange?.(nextPreviewing);
      window.dispatchEvent(
        new CustomEvent(PREVIEW_STATE_EVENT, {
          detail: {
            contentId,
            mediaType,
            season,
            episode,
            isPreviewing: nextPreviewing,
          },
        }),
      );
    },
    [contentId, episode, mediaType, onPreviewChange, season],
  );

  const hidePreview = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    stopPreviewPlayer(previewRef.current);

    gsap.to(previewRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        if (previewRef.current) {
          previewRef.current.src = "about:blank";
        }
      },
    });
    gsap.to(imageRef.current, {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut",
    });
    setPreviewing(false);
  }, [setPreviewing]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data?.type === "kino:playable" &&
        matchesContentId(event.data)
      ) {
        setIsPlayable(true);
      }

      if (
        event.data?.type === "kino:dimensions" &&
        event.data.mode === "preview" &&
        matchesContentId(event.data)
      ) {
        const width = Number(event.data.width);
        const height = Number(event.data.height);

        if (Number.isFinite(width) && Number.isFinite(height) && height > 0) {
          setVideoAspectRatio(width / height);
        }
      }

      if (
        event.data?.type === "kino:preview-ended" &&
        event.data.mode === "preview" &&
        matchesContentId(event.data)
      ) {
        hidePreview();
      }

      if (event.data?.type === "kino:muted" && matchesContentId(event.data)) {
        window.dispatchEvent(
          new CustomEvent(PREVIEW_MUTED_EVENT, {
            detail: {
              contentId,
              mediaType,
              season,
              episode,
              muted: Boolean(event.data.muted),
            },
          }),
        );
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [contentId, episode, hidePreview, matchesContentId, mediaType, season]);

  useEffect(() => {
    if (!isImageLoaded) {
      return;
    }

    const previewTimer = window.setTimeout(
      () => setIsDelayElapsed(true),
      PREVIEW_DELAY_SECONDS * 1000,
    );
    return () => {
      window.clearTimeout(previewTimer);
    };
  }, [isImageLoaded]);

  useEffect(() => {
    if (
      !(
        isImageLoaded &&
        isDelayElapsed &&
        isPlayable &&
        !hasStartedPreviewRef.current
      )
    ) {
      return;
    }

    hasStartedPreviewRef.current = true;
    setPreviewing(true);
    gsap.to(imageRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
    });
    gsap.to(previewRef.current, {
      opacity: 1,
      duration: 1.2,
      ease: "power2.out",
    });

    hideTimerRef.current = window.setTimeout(
      hidePreview,
      PREVIEW_DURATION_SECONDS * 1000,
    );
  }, [
    isImageLoaded,
    isPlayable,
    isDelayElapsed,
    hidePreview,
    setPreviewing,
  ]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      stopPreviewPlayer(previewRef.current);
      gsap.killTweensOf([imageRef.current, previewRef.current]);
    };
  }, []);

  const iframeStyle = {
    height: `max(100%, calc(100vw / ${videoAspectRatio}))`,
    width: `max(100%, calc(100dvh * ${videoAspectRatio}))`,
  };

  return (
    <>
      <div ref={imageRef} className="absolute inset-0 z-0 opacity-100">
        <Image
          src={`https://image.tmdb.org/t/p/original${backdropPath}`}
          alt=""
          width={1920}
          height={1080}
          priority
          className="h-full w-full object-cover opacity-65"
          onLoad={() => setIsImageLoaded(true)}
        />
      </div>
      <iframe
        ref={previewRef}
        src={previewUrl}
        title="Kino preview player"
        className="absolute left-1/2 top-1/2 z-0 border-0 opacity-0 -translate-x-1/2 -translate-y-1/2"
        style={iframeStyle}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </>
  );
}
