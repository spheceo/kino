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

export function HeroPreview({
  id,
  backdropPath,
  runtime,
  children,
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
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isFallbackReady, setIsFallbackReady] = useState(false);
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

  const previewUrl = `https://kino-api.up.railway.app/movie/${encodeURIComponent(
    contentId,
  )}?mode=preview&start=${previewStart}&duration=${PREVIEW_DURATION_SECONDS}&autoPlay=true&mute=true`;

  const hidePreview = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    gsap.to(previewRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => setIsPreviewVisible(false),
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
        String(event.data.contentId) === contentId
      ) {
        setIsPlayable(true);
      }

      if (event.data?.type === "kino:muted") {
        setMuted(event.data.muted);
      }

      if (
        event.data?.type === "kino:duration" &&
        event.data.mode === "preview" &&
        String(event.data.contentId) === contentId
      ) {
        // Duration is currently advisory; the API preview-ended event or local timer controls the fade-out.
      }

      if (
        event.data?.type === "kino:dimensions" &&
        event.data.mode === "preview" &&
        String(event.data.contentId) === contentId
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
        String(event.data.contentId) === contentId
      ) {
        hidePreview();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [contentId, hidePreview]);

  useEffect(() => {
    const previewTimer = window.setTimeout(
      () => setIsDelayElapsed(true),
      PREVIEW_DELAY_SECONDS * 1000,
    );
    const fallbackTimer = window.setTimeout(
      () => setIsFallbackReady(true),
      3000,
    );

    return () => {
      window.clearTimeout(previewTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (
      !(
        isDelayElapsed &&
        (isPlayable || isFrameLoaded || isFallbackReady) &&
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
  }, [isPlayable, isFrameLoaded, isFallbackReady, isDelayElapsed, hidePreview]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
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
        onLoad={() => setIsFrameLoaded(true)}
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
