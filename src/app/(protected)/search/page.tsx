import Link from "next/link";
import MediaCard from "@/components/media-card";
import { env } from "@/lib/env";
import { correctSearchQuery } from "@/lib/spellcheck";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type TmdbSearchResult = {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
};

type SearchMediaResult = TmdbSearchResult & {
  media_type: "movie" | "tv";
};

async function searchTmdb(query: string) {
  if (!query.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    api_key: env.NEXT_PUBLIC_TMDB_KEY,
    language: "en-US",
    query,
    include_adult: "false",
  });

  const res = await fetch(
    `https://api.themoviedb.org/3/search/multi?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as { results?: TmdbSearchResult[] };

  return (data.results ?? []).filter(
    (result): result is SearchMediaResult =>
      result.media_type === "movie" || result.media_type === "tv",
  );
}

async function searchTmdbWithFallback(query: string) {
  const results = await searchTmdb(query);
  const correctedQuery = correctSearchQuery(query);

  if (results.length > 0) {
    return {
      correctedQuery,
      results,
      searchedQuery: query,
    };
  }

  if (correctedQuery.toLowerCase() === query.toLowerCase()) {
    return {
      correctedQuery,
      results,
      searchedQuery: query,
    };
  }

  return {
    correctedQuery,
    results: await searchTmdb(correctedQuery),
    searchedQuery: correctedQuery,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { correctedQuery, results, searchedQuery } =
    await searchTmdbWithFallback(query);
  const hasCorrection =
    query.length > 0 && correctedQuery.toLowerCase() !== query.toLowerCase();

  return (
    <main className="min-h-dvh bg-background px-10 pb-16 pt-24 text-white">
      {hasCorrection ? (
        <p className="mb-5 text-sm text-white/55">
          Did you mean{" "}
          <Link
            href={`/search?q=${encodeURIComponent(correctedQuery)}`}
            className="font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-white/75"
          >
            {correctedQuery}
          </Link>
          ?
        </p>
      ) : null}

      {query && results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {results.map((result) => {
            const title = result.title ?? result.name ?? "Untitled";
            const year =
              result.release_date?.slice(0, 4) ??
              result.first_air_date?.slice(0, 4);

            return (
              <MediaCard
                key={`${result.media_type}-${result.id}`}
                id={result.id}
                mediaType={result.media_type}
                title={title}
                year={year}
                posterPath={result.poster_path}
              />
            );
          })}
        </div>
      ) : query ? (
        <p className="text-white/60">
          No results found
          {searchedQuery !== query ? ` for ${searchedQuery}` : ""}.
        </p>
      ) : (
        <div className="h-px bg-white/10" />
      )}
    </main>
  );
}
