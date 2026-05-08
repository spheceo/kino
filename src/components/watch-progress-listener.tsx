"use client";

import { useEffect, useRef } from "react";
import { vidfastOrigins } from "@/lib/video-provider";

type WatchProgressEvent = {
  type:
    | "kino:progress"
    | "kino:pause"
    | "kino:ended"
    | "kino:episode-changed"
    | "kino:player-close";
  mediaType: "movie" | "tv";
  tmdbId: string | number;
  currentTime: number;
  duration?: number;
  paused?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
};

function optionalFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizePlayerEvent(message: MessageEvent): WatchProgressEvent | null {
  const value = message.data;

  if (value?.type === "PLAYER_EVENT" && vidfastOrigins.includes(message.origin)) {
    const data = value.data;
    const eventMap: Record<string, WatchProgressEvent["type"]> = {
      play: "kino:progress",
      timeupdate: "kino:progress",
      pause: "kino:pause",
      seeked: "kino:progress",
      ended: "kino:ended",
      playerstatus: "kino:progress",
    };
    const type = eventMap[data?.event];

    if (!type || (data?.mediaType !== "movie" && data?.mediaType !== "tv")) {
      return null;
    }

    return {
      type,
      mediaType: data.mediaType,
      tmdbId: data.tmdbId,
      currentTime: Number(data.currentTime ?? 0),
      duration: optionalFiniteNumber(data.duration),
      paused: typeof data.playing === "boolean" ? !data.playing : undefined,
      seasonNumber: optionalFiniteNumber(data.season),
      episodeNumber: optionalFiniteNumber(data.episode),
    };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const event = value as Partial<WatchProgressEvent>;

  if (
    typeof event.type === "string" &&
    [
      "kino:progress",
      "kino:pause",
      "kino:ended",
      "kino:episode-changed",
      "kino:player-close",
    ].includes(event.type) &&
    (event.mediaType === "movie" || event.mediaType === "tv") &&
    (typeof event.tmdbId === "string" || typeof event.tmdbId === "number") &&
    typeof event.currentTime === "number"
  ) {
    return event as WatchProgressEvent;
  }

  return null;
}

export function WatchProgressListener({ title }: { title: string }) {
  const lastSavedAtRef = useRef(0);
  const latestEventRef = useRef<WatchProgressEvent | null>(null);

  useEffect(() => {
    function save(event: WatchProgressEvent) {
      latestEventRef.current = event;

      void fetch("/api/continue-watching", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mediaType: event.mediaType,
          tmdbId: String(event.tmdbId),
          title,
          seasonNumber: optionalFiniteNumber(event.seasonNumber),
          episodeNumber: optionalFiniteNumber(event.episodeNumber),
          currentTime: optionalFiniteNumber(event.currentTime) ?? 0,
          duration: optionalFiniteNumber(event.duration),
          paused: event.paused,
          completed: event.type === "kino:ended",
          eventType: event.type.replace("kino:", ""),
        }),
      });

      lastSavedAtRef.current = Date.now();
    }

    function onMessage(message: MessageEvent) {
      const event = normalizePlayerEvent(message);

      if (!event) {
        return;
      }

      latestEventRef.current = event;

      const shouldSaveImmediately = event.type !== "kino:progress";
      const shouldSaveThrottled = Date.now() - lastSavedAtRef.current >= 10_000;

      if (shouldSaveImmediately || shouldSaveThrottled) {
        save(event);
      }
    }

    function saveLatest() {
      if (latestEventRef.current) {
        save(latestEventRef.current);
      }
    }

    window.addEventListener("message", onMessage);
    window.addEventListener("pagehide", saveLatest);

    return () => {
      saveLatest();
      window.removeEventListener("message", onMessage);
      window.removeEventListener("pagehide", saveLatest);
    };
  }, [title]);

  return null;
}
