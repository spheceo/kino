import Link from "next/link";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { ContinueWatchingList } from "@/components/continue-watching-list";
import { HeroPreview } from "@/components/hero-preview";
import { MediaRow } from "@/components/media-row";
import { WatchNow } from "@/components/watch-now";
import { getRecommended } from "@/lib/get-recommended";
import { fetchTmdbRow } from "@/lib/tmdb-rows";

export const dynamic = "force-dynamic";

function getHeroIndex(limit = 10) {
  const now = new Date();
  const bucketHour = Math.floor(now.getUTCHours() / 6);
  const seed = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${bucketHour}`;
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash % limit;
}

export default async function Home() {
  const index = getHeroIndex(10);
  const currentYear = new Date().getFullYear();

  const data = await getRecommended(index);
  const heroDetails =
    data.nextEpisode !== "false" && data.nextEpisode !== "undefined"
      ? [`New Episode ${data.nextEpisode}`]
      : [data.year, data.duration].filter(Boolean);

  const rows = await Promise.all([
    fetchTmdbRow("Trending", "/trending/all/week", "movie"),
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
      "Animation",
      "/discover/movie?with_genres=16&sort_by=popularity.desc",
      "movie",
    ),
    fetchTmdbRow(
      "Binge-Worthy TV",
      "/discover/tv?sort_by=popularity.desc",
      "tv",
    ),
    fetchTmdbRow(
      "New This Year",
      `/discover/movie?primary_release_year=${currentYear}&sort_by=popularity.desc`,
      "movie",
    ),
  ]);
  // console.log("FILMS: ", films);

  // console.log(data.nextEpisode, typeof data.nextEpisode);

  return (
    <div className="min-h-dvh bg-background text-white">
      {/* Recommended Section */}
      <div className="relative h-[85dvh] overflow-hidden">
        <div className="relative h-full w-full overflow-hidden">
          <HeroPreview
            id={data.id}
            backdropPath={data.backdrop_path}
            runtime={data.runtime}
            mediaType={data.mediaType}
            season={data.season}
            episode={data.episode}
          >
            {data.title.includes(":") ? (
              (() => {
                const [main, sub] = data.title.split(":");
                return (
                  <div className="font-bold flex-col">
                    <h3 className="text-3xl">{main} :</h3>
                    <h1 className="text-8xl">{sub.trim()}</h1>
                  </div>
                );
              })()
            ) : (
              <h1 className="text-8xl font-bold">{data.title}</h1>
            )}
            <div className="flex gap-2 items-center">
              <h1 className="text-xl font-semibold">{data.ranking}</h1>
              {heroDetails.map((detail) => (
                <div key={detail} className="flex items-center gap-2">
                  <p>•</p>
                  <p>{detail}</p>
                </div>
              ))}
            </div>
            <p>{data.description}</p>
            <div className="flex items-center gap-4">
              <WatchNow
                id={data.id}
                mediaType={data.mediaType}
                season={data.season}
                episode={data.episode}
              />

              <Link
                href={`/info/${data.id}?mediaType=${data.mediaType}`}
                className="bg-[#2c2c2c] w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
              >
                <IoMdInformationCircleOutline size={25} />
              </Link>
            </div>
          </HeroPreview>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-[#14141499] to-[#14141433]" />
        </div>
      </div>

      <div className="relative space-y-10 px-10">
        <ContinueWatchingList className="pt-2" />
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
