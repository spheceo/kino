import { env } from "@/lib/env";

export type Recommended = {
  title: string;
  ranking: string;
  description: string;
  backdrop_path: string;
  media_type: "movie" | "tv";
  year: string;
  duration: string;
  runtime?: number;
  number_of_seasons?: number;
  id: string;
  type: "movie" | "tv";
  nextEpisode: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
};

type TmdbResult = {
  id: number;
  media_type: string;
};

type TmdbMovieDetails = {
  id: number;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  runtime: number;
  number_of_seasons?: number;
  media_type: "movie";
};

type TmdbTvDetails = {
  id: number;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  backdrop_path: string;
  media_type: "tv";
  release_date?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  episode_run_time?: number[];
  next_episode_to_air?: {
    air_date?: string;
    episode_number?: number;
    season_number?: number;
  };
  runtime?: number;
};

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
}

export async function getRecommended(index: number) {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const data = (await res.json()) as {
    results: TmdbResult[];
  };
  const candidates = data.results.filter(
    (result): result is TmdbResult & { media_type: "movie" | "tv" } =>
      result.media_type === "movie" || result.media_type === "tv",
  );
  const selected = candidates[index] ?? candidates[0];
  const mediaType = selected.media_type;
  const detailRes = await fetch(
    `https://api.themoviedb.org/3/${mediaType}/${selected.id}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const details = (await detailRes.json()) as TmdbTvDetails | TmdbMovieDetails;

  const title =
    details.name ||
    details.original_name ||
    details.title ||
    details.original_title ||
    "";
  const year =
    details.release_date?.split("-")[0] ||
    details.first_air_date?.split("-")[0] ||
    "";
  const runtimeMinutes =
    details.media_type === "tv"
      ? (details.episode_run_time?.[0] ?? 0)
      : (details.runtime ?? 0);
  const duration =
    runtimeMinutes > 0
      ? formatMinutes(runtimeMinutes)
      : details.media_type === "tv" && details.number_of_seasons
        ? `${details.number_of_seasons} ${
            details.number_of_seasons === 1 ? "Season" : "Seasons"
          }`
        : "";
  const nextEpisode =
    details.media_type === "tv"
      ? `${details.next_episode_to_air?.episode_number ?? "false"}`
      : "false";

  return {
    ...details,
    id: String(details.id),
    title,
    ranking: `#${index + 1} in ${mediaType === "tv" ? "TV Shows" : "Movies"} Today`,
    description: details.overview,
    year,
    duration,
    runtime: runtimeMinutes || undefined,
    type: mediaType,
    mediaType,
    nextEpisode,
    season: mediaType === "tv" ? 1 : undefined,
    episode: mediaType === "tv" ? 1 : undefined,
  } as Recommended;
}
