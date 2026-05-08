export type VideoProvider = "kino-api" | "vidfast";

export const VIDEO_PROVIDER = "kino-api" as VideoProvider;

const KINO_API_BASE = "https://kino-api.up.railway.app";
const VIDFAST_BASE = "https://vidfast.pro";

export const videoProviderConfig = {
  provider: VIDEO_PROVIDER,
  supportsPreview: VIDEO_PROVIDER === "kino-api",
  prefetchEnabled: VIDEO_PROVIDER === "kino-api",
};

export function getMovieWatchUrl({
  id,
  startSeconds = 0,
}: {
  id: string | number;
  startSeconds?: number;
}) {
  if (VIDEO_PROVIDER === "vidfast") {
    const url = new URL(`/movie/${encodeURIComponent(String(id))}`, VIDFAST_BASE);
    url.searchParams.set("autoPlay", "true");
    url.searchParams.set("title", "false");
    url.searchParams.set("poster", "false");
    url.searchParams.set("theme", "e50914");
    if (startSeconds > 0) url.searchParams.set("startAt", String(startSeconds));
    return url.toString();
  }

  const url = new URL(`/movie/${encodeURIComponent(String(id))}`, KINO_API_BASE);
  if (startSeconds > 0) url.searchParams.set("start", String(startSeconds));
  return url.toString();
}

export function getTvWatchUrl({
  id,
  season,
  episode,
  startSeconds = 0,
}: {
  id: string | number;
  season: string | number;
  episode: string | number;
  startSeconds?: number;
}) {
  if (VIDEO_PROVIDER === "vidfast") {
    const url = new URL(
      `/tv/${encodeURIComponent(String(id))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}`,
      VIDFAST_BASE,
    );
    url.searchParams.set("autoPlay", "true");
    url.searchParams.set("title", "false");
    url.searchParams.set("poster", "false");
    url.searchParams.set("nextButton", "true");
    url.searchParams.set("autoNext", "true");
    url.searchParams.set("theme", "e50914");
    if (startSeconds > 0) url.searchParams.set("startAt", String(startSeconds));
    return url.toString();
  }

  const url = new URL(
    `/tv/${encodeURIComponent(String(id))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}`,
    KINO_API_BASE,
  );
  if (startSeconds > 0) url.searchParams.set("start", String(startSeconds));
  return url.toString();
}

export function getMoviePreviewUrl({
  id,
  startSeconds,
  durationSeconds,
  muted,
}: {
  id: string | number;
  startSeconds: number;
  durationSeconds: number;
  muted: boolean;
}) {
  const url = new URL(`/movie/${encodeURIComponent(String(id))}`, KINO_API_BASE);
  url.searchParams.set("mode", "preview");
  url.searchParams.set("start", String(startSeconds));
  url.searchParams.set("duration", String(durationSeconds));
  url.searchParams.set("autoPlay", "true");
  url.searchParams.set("mute", String(muted));
  return url.toString();
}

export function getTvPreviewUrl({
  id,
  season,
  episode,
  startSeconds,
  durationSeconds,
  muted,
}: {
  id: string | number;
  season: string | number;
  episode: string | number;
  startSeconds: number;
  durationSeconds: number;
  muted: boolean;
}) {
  const url = new URL(
    `/tv/${encodeURIComponent(String(id))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}`,
    KINO_API_BASE,
  );
  url.searchParams.set("mode", "preview");
  url.searchParams.set("start", String(startSeconds));
  url.searchParams.set("duration", String(durationSeconds));
  url.searchParams.set("autoPlay", "true");
  url.searchParams.set("mute", String(muted));
  return url.toString();
}

export const vidfastOrigins = [
  "https://vidfast.pro",
  "https://vidfast.in",
  "https://vidfast.io",
  "https://vidfast.me",
  "https://vidfast.net",
  "https://vidfast.pm",
  "https://vidfast.xyz",
];
