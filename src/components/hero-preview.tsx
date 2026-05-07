"use client";

import gsap from "gsap";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";

type HeroPreviewProps = {
  id: string | number;
  backdropPath: string;
  runtime?: number;
  children: ReactNode;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
};

const PREVIEW_DELAY_SECONDS = 1;
const PREVIEW_DURATION_SECONDS = 45;
const DEFAULT_VIDEO_ASPECT_RATIO = 16 / 9;

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

export function HeroPreview({
  id,
  backdropPath,
  runtime,
  children,
  mediaType,
  season = 1,
  episode = 1,
}: HeroPreviewProps) {
  const contentId = String(id);
  const imageRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const contentHeaderRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const hasStartedPreviewRef = useRef(false);
  const [isPlayable, setIsPlayable] = useState(false);
  const [isDelayElapsed, setIsDelayElapsed] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState(
    DEFAULT_VIDEO_ASPECT_RATIO,
  );
  const contentParts = Children.toArray(children);
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

  const hidePreview = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    stopPreviewPlayer(previewRef.current);
    setMuted(true);

    gsap.to(previewRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        setIsPreviewVisible(false);

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
    gsap.to(descriptionRef.current, {
      autoAlpha: 1,
      height: "auto",
      y: 0,
      marginTop: "",
      duration: 0.9,
      ease: "power2.out",
    });
    gsap.to(contentHeaderRef.current, {
      y: 0,
      duration: 0.9,
      ease: "power2.out",
    });
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data?.type === "kino:playable" &&
        matchesContentId(event.data)
      ) {
        setIsPlayable(true);
      }

      if (event.data?.type === "kino:muted" && matchesContentId(event.data)) {
        setMuted(event.data.muted);
      }

      if (
        event.data?.type === "kino:duration" &&
        event.data.mode === "preview" &&
        matchesContentId(event.data)
      ) {
        // Duration is currently advisory; the API preview-ended event or local timer controls the fade-out.
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
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [hidePreview, matchesContentId]);

  useEffect(() => {
    const previewTimer = window.setTimeout(
      () => setIsDelayElapsed(true),
      PREVIEW_DELAY_SECONDS * 1000,
    );
    return () => {
      window.clearTimeout(previewTimer);
    };
  }, []);

  useEffect(() => {
    if (
      !(
        isDelayElapsed &&
        isPlayable &&
        !hasStartedPreviewRef.current
      )
    ) {
      return;
    }

    hasStartedPreviewRef.current = true;
    setIsPreviewVisible(true);
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
    window.setTimeout(() => {
      gsap.to(descriptionRef.current, {
        autoAlpha: 0,
        height: 0,
        marginTop: 0,
        y: 8,
        duration: 1,
        ease: "power3.inOut",
      });
      gsap.to(contentHeaderRef.current, {
        y: 0,
        duration: 1,
        ease: "power3.inOut",
      });
    }, 2800);

    hideTimerRef.current = window.setTimeout(
      hidePreview,
      PREVIEW_DURATION_SECONDS * 1000,
    );
  }, [isPlayable, isDelayElapsed, hidePreview]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      stopPreviewPlayer(previewRef.current);
      gsap.killTweensOf([imageRef.current, previewRef.current]);
      gsap.killTweensOf([
        contentHeaderRef.current,
        descriptionRef.current,
        heroContentRef.current,
      ]);
    };
  }, []);

  function toggleMuted() {
    const nextMuted = !muted;

    setMuted(nextMuted);
    previewRef.current?.contentWindow?.postMessage(
      { type: "kino:set-muted", muted: nextMuted },
      "*",
    );
  }

  const iframeStyle = {
    height: `max(100%, calc(100vw / ${videoAspectRatio}))`,
    width: `max(100%, calc(100dvh * ${videoAspectRatio}))`,
  };

  return (
    <>
      <div ref={imageRef} className="absolute inset-0 opacity-100">
        <Image
          alt="Banner"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
          src={`https://image.tmdb.org/t/p/original${backdropPath}`}
          priority
        />
      </div>
      <iframe
        ref={previewRef}
        src={previewUrl}
        title="Kino preview player"
        className="absolute left-1/2 top-1/2 border-0 opacity-0 -translate-x-1/2 -translate-y-1/2"
        style={iframeStyle}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
      <div
        ref={heroContentRef}
        className="relative z-10 flex h-full w-full flex-col justify-end p-10"
      >
        <div className="relative w-[600px] space-y-5">
          <div ref={contentHeaderRef} className="space-y-5">
            {contentParts.slice(0, 2)}
          </div>
          <div ref={descriptionRef} className="overflow-hidden">
            {contentParts[2]}
          </div>
          {contentParts[3]}
        </div>
      </div>
      {isPreviewVisible && (
        <button
          type="button"
          aria-label={muted ? "Unmute preview" : "Mute preview"}
          onClick={toggleMuted}
          className="absolute bottom-10 right-10 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#1f1f1f] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-colors hover:bg-[#2c2c2c]"
        >
          {muted ? <IoVolumeMute size={23} /> : <IoVolumeHigh size={23} />}
        </button>
      )}
    </>
  );
}
