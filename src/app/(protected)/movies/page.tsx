import Link from "next/link";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HeroPreview } from "@/components/hero-preview";
import { MediaRow } from "@/components/media-row";
import { WatchNow } from "@/components/watch-now";
import { env } from "@/lib/env";
import { fetchTmdbRow } from "@/lib/tmdb-rows";

export const dynamic = "force-dynamic";

type MovieDetails = {
  id: number;
  title?: string;
  overview?: string;
  backdrop_path?: string | null;
  release_date?: string;
  runtime?: number;
};

function formatMinutes(minutes?: number) {
  if (!minutes) {
    return "";
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
}

async function getFeaturedMovie() {
  const row = await fetchTmdbRow("Featured Movies", "/movie/popular", "movie");
  const candidate = row.items.find((item) => item.id && item.poster_path);

  if (!candidate) {
    return null;
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${candidate.id}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as MovieDetails;
}

export default async function MoviesPage() {
  const currentYear = new Date().getFullYear();
  const [featured, ...rows] = await Promise.all([
    getFeaturedMovie(),
    fetchTmdbRow("Popular Movies", "/movie/popular", "movie"),
    fetchTmdbRow("Now Playing", "/movie/now_playing", "movie"),
    fetchTmdbRow("Top Rated", "/movie/top_rated", "movie"),
    fetchTmdbRow("Upcoming", "/movie/upcoming", "movie"),
    fetchTmdbRow(
      "Action",
      "/discover/movie?with_genres=28&sort_by=popularity.desc",
      "movie",
    ),
    fetchTmdbRow(
      "Comedy",
      "/discover/movie?with_genres=35&sort_by=popularity.desc",
      "movie",
    ),
    fetchTmdbRow(
      "New This Year",
      `/discover/movie?primary_release_year=${currentYear}&sort_by=popularity.desc`,
      "movie",
    ),
  ]);

  return (
    <div className="min-h-dvh bg-background text-white">
      {featured?.backdrop_path ? (
        <div className="relative h-[85dvh] overflow-hidden">
          <div className="relative h-full w-full overflow-hidden">
            <HeroPreview
              id={String(featured.id)}
              backdropPath={featured.backdrop_path}
              runtime={featured.runtime}
              mediaType="movie"
            >
              <h1 className="max-w-[820px] text-8xl font-bold leading-none">
                {featured.title ?? "Featured Movie"}
              </h1>
              <div className="flex items-center gap-2 text-xl font-semibold">
                <h2>Featured Movie</h2>
                {featured.release_date ? (
                  <>
                    <p>•</p>
                    <p>{featured.release_date.slice(0, 4)}</p>
                  </>
                ) : null}
                {featured.runtime ? (
                  <>
                    <p>•</p>
                    <p>{formatMinutes(featured.runtime)}</p>
                  </>
                ) : null}
              </div>
              <p className="max-w-[620px]">{featured.overview}</p>
              <div className="flex items-center gap-4">
                <WatchNow id={String(featured.id)} mediaType="movie" />
                <Link
                  href={`/info/${featured.id}?mediaType=movie`}
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
