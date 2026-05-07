import type { MediaRowData, MediaRowItem } from "@/components/media-row";
import { env } from "@/lib/env";

export async function fetchTmdbRow(
  title: string,
  path: string,
  mediaType: "movie" | "tv",
) {
  const res = await fetch(
    `https://api.themoviedb.org/3${path}${path.includes("?") ? "&" : "?"}api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return {
      title,
      items: [],
      mediaType,
    } satisfies MediaRowData;
  }

  const data = (await res.json()) as { results?: MediaRowItem[] };

  return {
    title,
    items: data.results ?? [],
    mediaType,
  } satisfies MediaRowData;
}
