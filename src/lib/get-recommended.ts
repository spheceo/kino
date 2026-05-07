import { env } from "@/lib/env";

export type Recommended = {
  title: string;
  ranking: string;
  description: string;
  backdrop_path: string;
  media_type: string;
  year: string;
  duration: string;
  runtime?: number;
  id: string;
  type: string;
  nextEpisode: string;
};

type TmdbResult = {
  id: string;
  media_type: string;
};

type TmdbDetails = {
  id: string;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  backdrop_path: string;
  media_type: string;
  release_date?: string;
  first_air_date?: string;
  runtime: number;
  number_of_seasons: number;
  next_episode_to_air?: {
    air_date?: string;
  };
};

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
}

export async function getRecommended(index: number) {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/day?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const data = (await res.json()) as { results: TmdbResult[] };
  const id = data.results[index].id;
  const res2 = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const data2 = (await res2.json()) as TmdbDetails;

  const item = data2;

  return {
    ...item,
    title:
      item.name ||
      item.original_name ||
      item.title ||
      item.original_title ||
      "",
    ranking: `#${index + 1} in Movies Today`,
    description: item.overview,
    year:
      item.release_date?.split("-")[0] ||
      item.first_air_date?.split("-")[0] ||
      "",
    duration: formatMinutes(item.runtime),
    type: "movie",
    nextEpisode: "false",
  } as Recommended;
}
