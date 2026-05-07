import Link from "next/link";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HeroPreview } from "@/components/hero-preview";
import MediaCard from "@/components/media-card";
import { WatchNow } from "@/components/watch-now";
import { env } from "@/lib/env";
import { getRecommended } from "@/lib/get-recommended";

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

  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/week?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
  );
  const data2 = await res.json();
  const films = data2.results;
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
              <p>•</p>
              {data.nextEpisode !== "false" &&
              data.nextEpisode !== "undefined" ? (
                <h1 className="text-xl font-semibold">
                  New Episode {data.nextEpisode}
                </h1>
              ) : (
                <>
                  <p>{data.year}</p>
                  <p>•</p>
                  <p>{data.duration}</p>
                </>
              )}
            </div>
            <p>{data.description}</p>
            <div className="flex items-center gap-4">
              <WatchNow id={data.id} />

              <Link
                href={`/info/${data.id}`}
                className="bg-[#2c2c2c] w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
              >
                <IoMdInformationCircleOutline size={25} />
              </Link>
            </div>
          </HeroPreview>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-[#14141499] to-[#14141433]" />
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-10 space-y-5 relative">
        <h1 className="text-3xl font-bold">Trending</h1>
        <div className="flex gap-3 relative flex-wrap md:flex-nowrap">
          {Array.isArray(films) &&
            films
              .slice(0, 9)
              .map((film) => (
                <MediaCard
                  key={film.id}
                  id={film.id}
                  title={film.title ? film.title : film.name}
                  year={
                    film?.first_air_date
                      ? film.first_air_date.slice(0, 4)
                      : film?.release_date
                        ? film.release_date.slice(0, 4)
                        : "N/A"
                  }
                  posterPath={film?.poster_path}
                  className="w-[25vw] md:w-[11vw]"
                />
              ))}
        </div>
      </div>

      <footer className="px-10 py-10 text-sm text-white/45">
        &copy; {currentYear} Kino, All Rights Reserved
      </footer>
    </div>
  );
}
