import Link from "next/link";
import { Suspense } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { ContinueWatchingList } from "@/components/continue-watching-list";
import { HeroPreview } from "@/components/hero-preview";
import { MediaRow } from "@/components/media-row";
import { WatchLaterButton } from "@/components/watch-later-button";
import { WatchNow } from "@/components/watch-now";
import { HeroSkeleton, MediaRowSkeleton } from "@/components/page-skeletons";
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

async function HomeHero() {
  const data = await getRecommended(getHeroIndex(10));
  const heroDetails =
    data.nextEpisode !== "false" && data.nextEpisode !== "undefined"
      ? [`New Episode ${data.nextEpisode}`]
      : [data.year, data.duration].filter(Boolean);

  return (
    <div className="relative h-[82dvh] overflow-hidden">
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
                <div className="flex-col font-bold">
                  <h3 className="text-3xl">{main} :</h3>
                  <h1 className="text-8xl">{sub.trim()}</h1>
                </div>
              );
            })()
          ) : (
            <h1 className="text-8xl font-bold">{data.title}</h1>
          )}
          <div className="flex items-center gap-2">
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
            <WatchLaterButton
              id={data.id}
              mediaType={data.mediaType}
              title={data.title}
              season={data.season}
              episode={data.episode}
            />
            <Link
              href={`/info/${data.id}?mediaType=${data.mediaType}`}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#2c2c2c]"
            >
              <IoMdInformationCircleOutline size={25} />
            </Link>
          </div>
        </HeroPreview>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-[#14141499] to-[#14141433]" />
      </div>
    </div>
  );
}

async function HomeMediaRow({
  title,
  endpoint,
  mediaType,
}: {
  title: string;
  endpoint: string;
  mediaType: "movie" | "tv";
}) {
  const row = await fetchTmdbRow(title, endpoint, mediaType);
  return <MediaRow row={row} />;
}

const currentYear = new Date().getFullYear();

const rowConfigs: { title: string; endpoint: string; mediaType: "movie" | "tv" }[] = [
  { title: "Trending", endpoint: "/trending/all/week", mediaType: "movie" },
  { title: "Animation", endpoint: "/discover/movie?with_genres=16&sort_by=popularity.desc", mediaType: "movie" },
  { title: "Binge-Worthy TV", endpoint: "/discover/tv?sort_by=popularity.desc", mediaType: "tv" },
];

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-white">
      <Suspense fallback={<HeroSkeleton />}>
        <HomeHero />
      </Suspense>

      <div className="relative space-y-10 px-10">
        <ContinueWatchingList className="pt-2" />
        {rowConfigs.map((config) => (
          <Suspense key={config.title} fallback={<MediaRowSkeleton />}>
            <HomeMediaRow {...config} />
          </Suspense>
        ))}
      </div>

      <footer className="flex items-center gap-6 px-10 py-10 text-sm text-white/35">
        <span>&copy; {currentYear} Kino</span>
        <Link href="/legal" className="cursor-pointer transition-colors hover:text-white/60">Legal</Link>
      </footer>
    </div>
  );
}
