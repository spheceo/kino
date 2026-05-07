"use client";

import { useEffect, useRef } from "react";

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

function isWatchProgressEvent(value: unknown): value is WatchProgressEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Partial<WatchProgressEvent>;

  return (
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
  );
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
      if (!isWatchProgressEvent(message.data)) {
        return;
      }

      latestEventRef.current = message.data;

      const shouldSaveImmediately = message.data.type !== "kino:progress";
      const shouldSaveThrottled = Date.now() - lastSavedAtRef.current >= 10_000;

      if (shouldSaveImmediately || shouldSaveThrottled) {
        save(message.data);
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
