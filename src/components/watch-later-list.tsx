"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import MediaCard from "@/components/media-card";
import { api } from "../../convex/_generated/api";

type WatchLaterItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.watchLater.listForCurrentUser>>
>[number];

type TmdbDetails = {
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
};

function WatchLaterCard({ item }: { item: WatchLaterItem }) {
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      const key = process.env.NEXT_PUBLIC_TMDB_KEY;
      if (!key) return;

      const res = await fetch(
        `https://api.themoviedb.org/3/${item.mediaType}/${encodeURIComponent(item.tmdbId)}?api_key=${key}&language=en-US`,
      );

      if (!res.ok) return;

      const details = (await res.json()) as TmdbDetails;

      if (!cancelled) {
        setPosterPath(details.poster_path ?? null);
        setYear(
          details.first_air_date?.slice(0, 4) ??
            details.release_date?.slice(0, 4) ??
            "",
        );
      }
    }

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [item.mediaType, item.tmdbId]);

  return (
    <MediaCard
      id={item.tmdbId}
      mediaType={item.mediaType}
      title={item.title}
      year={year}
      posterPath={posterPath}
      className="w-full"
    />
  );
}

export function WatchLaterList() {
  const items = useQuery(api.watchLater.listForCurrentUser, { limit: 8 });

  if (items === undefined || items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold">Watch Later</h2>
      <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {items.map((item) => (
          <WatchLaterCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
