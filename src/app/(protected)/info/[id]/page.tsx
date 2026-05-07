import { notFound } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { InfoActions } from "@/components/info-actions";
import { InfoBackgroundStage } from "@/components/info-background-stage";
import { env } from "@/lib/env";

type InfoPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    mediaType?: "movie" | "tv";
  }>;
};

type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbDetails = {
  id: number;
  backdrop_path?: string | null;
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  number_of_seasons?: number;
  runtime?: number;
  episode_run_time?: number[];
  overview?: string;
  genres?: TmdbGenre[];
};

type MediaDetails = TmdbDetails & {
  mediaType: "movie" | "tv";
};

async function getDetails(id: string, mediaType: "movie" | "tv") {
  const res = await fetch(
    `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as TmdbDetails;

  return {
    ...data,
    mediaType,
  } satisfies MediaDetails;
}

function isTvMediaType(mediaType?: string): mediaType is "movie" | "tv" {
  return mediaType === "movie" || mediaType === "tv";
}

async function getMediaDetails(id: string, preferredMediaType?: string) {
  const preferred = isTvMediaType(preferredMediaType)
    ? preferredMediaType
    : undefined;

  if (preferred) {
    const preferredDetails = await getDetails(id, preferred);

    if (preferredDetails) {
      return preferredDetails;
    }
  }

  const movie = await getDetails(id, "movie");

  if (movie) {
    return movie;
  }

  return getDetails(id, "tv");
}

export default async function InfoPage({
  params,
  searchParams,
}: InfoPageProps) {
  const { id } = await params;
  const { mediaType: preferredMediaType } = await searchParams;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const film = await getMediaDetails(id, preferredMediaType);

  if (!film) {
    notFound();
  }

  const title = film.title ?? film.name ?? "Untitled";
  const year =
    film.first_air_date?.slice(0, 4) ?? film.release_date?.slice(0, 4) ?? "";
  const rating = film.vote_average ? film.vote_average.toFixed(1) : "";
  const previewRuntime =
    film.mediaType === "tv" ? film.episode_run_time?.[0] : film.runtime;
  const defaultSeason = film.mediaType === "tv" ? 1 : undefined;
  const defaultEpisode = film.mediaType === "tv" ? 1 : undefined;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-white">
      <InfoBackgroundStage
        id={film.id}
        backdropPath={film.backdrop_path}
        runtime={previewRuntime}
        mediaType={film.mediaType}
        season={defaultSeason}
        episode={defaultEpisode}
      />

      <section className="relative z-10 flex min-h-dvh max-w-[760px] flex-col justify-center px-10 py-24 md:px-20">
        <h1 className="text-6xl font-semibold leading-none tracking-normal">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 py-7 text-xl font-semibold text-[#cccccf]">
          {rating ? (
            <div className="flex items-center gap-2">
              <FaStar className="text-[#dfa34b]" />
              <span>{rating}/10</span>
            </div>
          ) : null}
          {rating && year ? <span>•</span> : null}
          {year ? <span>{year}</span> : null}
          {film.mediaType === "tv" && film.number_of_seasons ? (
            <>
              <span>•</span>
              <span>
                {film.number_of_seasons}{" "}
                {film.number_of_seasons === 1 ? "Season" : "Seasons"}
              </span>
            </>
          ) : null}
        </div>

        {film.genres?.length ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-white/50">GENRES</h2>
            <div className="flex flex-wrap gap-3">
              {film.genres.map((genre) => (
                <div
                  className="rounded-full bg-[#25252570] px-4 py-2 backdrop-blur"
                  key={genre.id}
                >
                  <span>{genre.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {film.overview ? (
          <div className="flex flex-col gap-3 pt-10">
            <h2 className="text-xl font-semibold text-white/50">SUMMARY</h2>
            <p className="max-w-[560px] leading-7 text-white/90">
              {film.overview}
            </p>
          </div>
        ) : null}

        <InfoActions
          contentId={film.id}
          mediaType={film.mediaType}
          season={defaultSeason}
          episode={defaultEpisode}
          title={title}
        />
      </section>
    </main>
  );
}
