"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { InfoPreviewBackground } from "@/components/info-preview-background";

type InfoBackgroundStageProps = {
  id: string | number;
  backdropPath?: string | null;
  runtime?: number;
};

export function InfoBackgroundStage({
  id,
  backdropPath,
  runtime,
}: InfoBackgroundStageProps) {
  const horizontalGradientRef = useRef<HTMLDivElement>(null);
  const verticalGradientRef = useRef<HTMLDivElement>(null);
  const leftBlurRef = useRef<HTMLDivElement>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    gsap.to(horizontalGradientRef.current, {
      opacity: isPreviewing ? 0.08 : 1,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(verticalGradientRef.current, {
      opacity: isPreviewing ? 0.06 : 1,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(leftBlurRef.current, {
      opacity: isPreviewing ? 1 : 0,
      duration: 1,
      ease: "power2.inOut",
    });
  }, [isPreviewing]);

  return (
    <>
      {backdropPath ? (
        <InfoPreviewBackground
          id={id}
          backdropPath={backdropPath}
          runtime={runtime}
          onPreviewChange={setIsPreviewing}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-[#202020]" />
      )}
      <div
        ref={horizontalGradientRef}
        className="absolute inset-0 z-0 bg-gradient-to-r from-black/70 via-black/42 to-black/12"
      />
      <div
        ref={verticalGradientRef}
        className="absolute inset-0 z-0 bg-gradient-to-t from-background/45 via-black/8 to-black/18"
      />
      <div
        ref={leftBlurRef}
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-[72%] bg-gradient-to-r from-black/20 via-black/10 to-transparent opacity-0 backdrop-blur-sm [mask-image:linear-gradient(to_right,black_0%,black_62%,transparent_100%)]"
      />
    </>
  );
}
