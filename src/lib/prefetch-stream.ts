import { videoProviderConfig } from "@/lib/video-provider";

const prefetchedStreams = new Set<string>();

export function prefetchStream(
  mediaType: "movie" | "tv" | undefined,
  id: string | number,
  season = 1,
  episode = 1,
) {
  if (!mediaType || !videoProviderConfig.prefetchEnabled) return;

  const key = `${mediaType}:${id}:${season}:${episode}`;
  if (prefetchedStreams.has(key)) return;

  prefetchedStreams.add(key);

  const path =
    mediaType === "tv"
      ? `/resolve/vidfast/tv/${encodeURIComponent(String(id))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}`
      : `/resolve/vidfast/movie/${encodeURIComponent(String(id))}`;

  void fetch(`https://kino-api.up.railway.app${path}`, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
  }).catch(() => {
    prefetchedStreams.delete(key);
  });
}
