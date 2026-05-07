"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export function WatchPlayerFrame({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copyUrl, setCopyUrl] = useState("");
  const iframeSrc = useMemo(() => {
    if (!copyUrl) {
      return src;
    }

    const url = new URL(src);
    url.searchParams.set("copyUrl", copyUrl);
    return url.toString();
  }, [copyUrl, src]);

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

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
        }}
      />
    </div>
  );
}
