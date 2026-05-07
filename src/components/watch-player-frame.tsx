"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export function WatchPlayerFrame({
  src,
  title,
  mediaType,
  tmdbId,
}: {
  src: string;
  title: string;
  mediaType: "movie" | "tv";
  tmdbId: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copyUrl, setCopyUrl] = useState("");
  const iframeSrc = useMemo(() => {
    const url = new URL(src);
    if (copyUrl) {
      url.searchParams.set("copyUrl", copyUrl);
    }
    url.searchParams.set("title", title);
    return url.toString();
  }, [copyUrl, src, title]);

  useEffect(() => {
    setCopyUrl(window.location.href);
    shellRef.current?.focus();

    function togglePlayback() {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "kino:toggle-play" },
        "*",
      );
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      togglePlayback();
    }

    function syncPlayerShareMetadata(nextCopyUrl = window.location.href) {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "kino:set-share-metadata",
          title,
          copyUrl: nextCopyUrl,
        },
        "*",
      );
      iframeRef.current?.contentWindow?.postMessage(
        { type: "kino:set-title", title },
        "*",
      );
      iframeRef.current?.contentWindow?.postMessage(
        { type: "kino:set-copy-url", copyUrl: nextCopyUrl },
        "*",
      );
    }

    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "kino:episode-changed" || mediaType !== "tv") {
        return;
      }

      const seasonNumber = Number(event.data.seasonNumber);
      const episodeNumber = Number(event.data.episodeNumber);

      if (!Number.isFinite(seasonNumber) || !Number.isFinite(episodeNumber)) {
        return;
      }

      const nextUrl = `/watch/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(String(seasonNumber))}/${encodeURIComponent(String(episodeNumber))}`;
      window.history.replaceState(window.history.state, "", nextUrl);
      syncPlayerShareMetadata(window.location.href);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("message", handleMessage);
    syncPlayerShareMetadata();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div ref={shellRef} className="h-full w-full outline-none" tabIndex={-1}>
      {!isLoaded ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Image
            src="/Logo.svg"
            alt="Kino"
            width={154}
            height={60}
            priority
            className="h-10 w-auto animate-pulse"
          />
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        title="Kino video player"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        onLoad={() => {
          setIsLoaded(true);
          shellRef.current?.focus();
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: "kino:set-share-metadata",
              title,
              copyUrl: window.location.href,
            },
            "*",
          );
        }}
      />
    </div>
  );
}
