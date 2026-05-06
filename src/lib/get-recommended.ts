import {
  addWeeks,
  format,
  isSameDay,
  isThisWeek,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import { env } from "@/lib/env";

export type Recommended = {
  title: string;
  ranking: string;
  description: string;
  backdrop_path: string;
  media_type: string;
  year: string;
  duration: string;
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

function describeDate(dateString: string) {
  const date = parseISO(dateString);
  const today = new Date();

  if (isSameDay(date, today)) return "today";

  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
  const startOfNextWeek = addWeeks(startOfThisWeek, 1);
  const endOfNextWeek = addWeeks(startOfThisWeek, 2);

  if (isThisWeek(date, { weekStartsOn: 1 }))
    return `this ${format(date, "EEEE")}`;
  if (isWithinInterval(date, { start: startOfNextWeek, end: endOfNextWeek }))
    return `next ${format(date, "EEEE")}`;

  return format(date, "MMMM do, yyyy");
}

export async function getRecommended(index: number) {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const data = (await res.json()) as { results: TmdbResult[] };
  const id = data.results[index].id;
  const res2 = await fetch(
    `https://api.themoviedb.org/3/${data.results[index].media_type}/${id}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const data2 = (await res2.json()) as TmdbDetails;

  const item = data2;
  const item2 = data.results[index];

  const mediaTypeCount = data.results
    .slice(0, index)
    .filter(
      (item: { media_type: string }) => item.media_type === item2.media_type,
    ).length;
  const index2 = mediaTypeCount + 1;

  return {
    ...item,
    title:
      item.name ||
      item.original_name ||
      item.title ||
      item.original_title ||
      "",
    ranking: `#${index2} in ${
      item2.media_type === "tv" ? "TV Show" : "Movie"
    }s Today`,
    description: item.overview,
    year:
      item.release_date?.split("-")[0] ||
      item.first_air_date?.split("-")[0] ||
      "",
    duration:
      item2.media_type === "movie"
        ? formatMinutes(item.runtime)
        : item.number_of_seasons +
          (item.number_of_seasons === 1 ? " Season" : " Seasons"),
    type: item2.media_type,
    nextEpisode: `${
      item2.media_type === "tv" &&
      item.next_episode_to_air?.air_date &&
      describeDate(item.next_episode_to_air.air_date)
    }`,
  } as Recommended;
}
