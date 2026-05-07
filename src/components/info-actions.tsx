"use client";

import { useEffect, useState } from "react";
import { IoAdd, IoPlay, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";

const PREVIEW_STATE_EVENT = "kino:info-preview-state";
const PREVIEW_MUTED_EVENT = "kino:info-preview-muted";

type PreviewStateDetail = {
  contentId?: string;
  isPreviewing?: boolean;
};

type PreviewMutedDetail = {
  contentId?: string;
  muted?: boolean;
};

type InfoActionsProps = {
  contentId: string | number;
};

function postPreviewCommand(command: { type: string; muted?: boolean }) {
  const iframe = document.querySelector<HTMLIFrameElement>(
    'iframe[title="Kino preview player"]',
  );

  iframe?.contentWindow?.postMessage(command, "*");
}

export function InfoActions({ contentId }: InfoActionsProps) {
  const contentIdString = String(contentId);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    function handlePreviewState(event: Event) {
      const detail = (event as CustomEvent<PreviewStateDetail>).detail;

      if (String(detail?.contentId) !== contentIdString) {
        return;
      }

      setIsPreviewing(Boolean(detail.isPreviewing));
    }

    function handleMutedState(event: Event) {
      const detail = (event as CustomEvent<PreviewMutedDetail>).detail;

      if (String(detail?.contentId) !== contentIdString) {
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
  }, [contentIdString]);

  function toggleMuted() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    postPreviewCommand({ type: "kino:set-muted", muted: nextMuted });
  }

  return (
    <div className="mt-10 flex items-center gap-4">
      <div className="flex h-14 w-60 items-center justify-center gap-3 rounded-full bg-white font-semibold text-black">
        <IoPlay size={22} />
        Watch Now
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2c2c2c] text-white">
        <IoAdd size={34} />
      </div>
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
