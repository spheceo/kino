import Link from "next/link";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HeroPreview } from "@/components/hero-preview";
import { MediaRow } from "@/components/media-row";
import { WatchNow } from "@/components/watch-now";
import { env } from "@/lib/env";
import { fetchTmdbRow } from "@/lib/tmdb-rows";

export const dynamic = "force-dynamic";

type TvDetails = {
  id: number;
  name?: string;
  overview?: string;
  backdrop_path?: string | null;
  first_air_date?: string;
  episode_run_time?: number[];
  number_of_seasons?: number;
};

function formatMinutes(minutes?: number) {
  if (!minutes) {
    return "";
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
}

async function getFeaturedShow() {
  const row = await fetchTmdbRow("Featured Shows", "/tv/popular", "tv");
  const candidate = row.items.find((item) => item.id && item.poster_path);

  if (!candidate) {
    return null;
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${candidate.id}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as TvDetails;
}

export default async function TvPage() {
  const currentYear = new Date().getFullYear();
  const [featured, ...rows] = await Promise.all([
    getFeaturedShow(),
    fetchTmdbRow("Popular TV Shows", "/tv/popular", "tv"),
    fetchTmdbRow("Airing Today", "/tv/airing_today", "tv"),
    fetchTmdbRow("On The Air", "/tv/on_the_air", "tv"),
    fetchTmdbRow("Top Rated TV", "/tv/top_rated", "tv"),
    fetchTmdbRow(
      "Binge-Worthy TV",
      "/discover/tv?sort_by=popularity.desc",
      "tv",
    ),
    fetchTmdbRow(
      "Comedy TV",
      "/discover/tv?with_genres=35&sort_by=popularity.desc",
      "tv",
    ),
    fetchTmdbRow(
      "Drama TV",
      "/discover/tv?with_genres=18&sort_by=popularity.desc",
      "tv",
    ),
  ]);
  const runtime = featured?.episode_run_time?.[0];

  return (
    <div className="min-h-dvh bg-background text-white">
      {featured?.backdrop_path ? (
        <div className="relative h-[85dvh] overflow-hidden">
          <div className="relative h-full w-full overflow-hidden">
            <HeroPreview
              id={String(featured.id)}
              backdropPath={featured.backdrop_path}
              runtime={runtime}
              mediaType="tv"
              season={1}
              episode={1}
            >
              <h1 className="max-w-[820px] text-8xl font-bold leading-none">
                {featured.name ?? "Featured Show"}
              </h1>
              <div className="flex items-center gap-2 text-xl font-semibold">
                <h2>Featured Show</h2>
                {featured.first_air_date ? (
                  <>
                    <p>•</p>
                    <p>{featured.first_air_date.slice(0, 4)}</p>
                  </>
                ) : null}
                {featured.number_of_seasons ? (
                  <>
                    <p>•</p>
                    <p>
                      {featured.number_of_seasons}{" "}
                      {featured.number_of_seasons === 1 ? "Season" : "Seasons"}
                    </p>
                  </>
                ) : null}
                {runtime ? (
                  <>
                    <p>•</p>
                    <p>{formatMinutes(runtime)}</p>
                  </>
                ) : null}
              </div>
              <p className="max-w-[620px]">{featured.overview}</p>
              <div className="flex items-center gap-4">
                <WatchNow
                  id={String(featured.id)}
                  mediaType="tv"
                  season={1}
                  episode={1}
                />
                <Link
                  href={`/info/${featured.id}?mediaType=tv`}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#2c2c2c]"
                >
                  <IoMdInformationCircleOutline size={25} />
                </Link>
              </div>
            </HeroPreview>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-[#14141499] to-[#14141433]" />
          </div>
        </div>
      ) : null}

      <div className="relative space-y-10 px-10">
        {rows.map((row) => (
          <MediaRow key={row.title} row={row} />
        ))}
      </div>

      <footer className="px-10 py-10 text-sm text-white/45">
        &copy; {currentYear} Kino, All Rights Reserved
      </footer>
    </div>
  );
}
