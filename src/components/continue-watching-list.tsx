"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { ContinueWatchingSkeleton } from "@/components/page-skeletons";
import { useApiQuery } from "@/lib/client-data";
import { env } from "@/lib/env";

type ContinueWatchingItem = {
  id: string;
  mediaType: "movie" | "tv";
  tmdbId: string;
  title?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  progressSeconds: number;
  durationSeconds: number;
};

type TmdbDetails = {
  backdrop_path?: string | null;
};

type TmdbImages = {
  backdrops?: Array<{
    file_path?: string | null;
    aspect_ratio?: number | null;
  }>;
  logos?: Array<{
    file_path?: string | null;
    iso_639_1?: string | null;
  }>;
};

function ContinueWatchingCard({
  item,
  onRemove,
}: {
  item: ContinueWatchingItem;
  onRemove: (item: ContinueWatchingItem) => void;
}) {
  const [backdropPath, setBackdropPath] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBackdrop() {
      const key = env.NEXT_PUBLIC_TMDB_KEY;

      const [detailsRes, imagesRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/${item.mediaType}/${encodeURIComponent(item.tmdbId)}?api_key=${key}&language=en-US`,
        ),
        fetch(
          `https://api.themoviedb.org/3/${item.mediaType}/${encodeURIComponent(item.tmdbId)}/images?api_key=${key}`,
        ),
      ]);

      if (!detailsRes.ok) return;

      const details = (await detailsRes.json()) as TmdbDetails;
      const images = imagesRes.ok ? ((await imagesRes.json()) as TmdbImages) : null;
      const logo =
        images?.logos?.find((item) => item.iso_639_1 === "en" && item.file_path) ??
        images?.logos?.find((item) => item.file_path);
      const backdrop = images?.backdrops
        ?.filter((item) => item.file_path)
        .sort(
          (a, b) =>
            Math.abs((a.aspect_ratio ?? 16 / 9) - 16 / 9) -
            Math.abs((b.aspect_ratio ?? 16 / 9) - 16 / 9),
        )[0];

      if (!cancelled) {
        setBackdropPath(backdrop?.file_path ?? details.backdrop_path ?? null);
        setLogoPath(logo?.file_path ?? null);
      }
    }

    void loadBackdrop();

    return () => {
      cancelled = true;
    };
  }, [item.mediaType, item.tmdbId]);

  const href =
    item.mediaType === "tv"
      ? `/watch/tv/${item.tmdbId}/${item.seasonNumber ?? 1}/${item.episodeNumber ?? 1}`
      : `/watch/${item.tmdbId}`;
  const percent =
    item.durationSeconds > 0
      ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
      : 0;
  const title =
    item.mediaType === "tv"
      ? `${item.title ?? `Show ${item.tmdbId}`} · S${item.seasonNumber ?? 1} E${item.episodeNumber ?? 1}`
      : (item.title ?? `Movie ${item.tmdbId}`);

  function removeFromList() {
    setIsConfirmingRemove(false);
    onRemove(item);
  }

  return (
    <>
      <div className="group">
        <Link
          href={href}
          prefetch
          className="relative block aspect-video overflow-hidden rounded-xl bg-white/[0.06] shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
        >
          {backdropPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w780${backdropPath}`}
              alt=""
              className={`h-full w-full object-cover transition-transform duration-300 ${item.mediaType === "tv" ? "scale-110 group-hover:scale-[1.15]" : "group-hover:scale-105"}`}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            type="button"
            aria-label="Remove from Continue Watching"
            onClick={(event) => {
              event.preventDefault();
              setIsConfirmingRemove(true);
            }}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:bg-black/80 group-hover:opacity-100"
          >
            <IoClose size={20} />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-4">
            {logoPath ? (
              <img
                src={`https://image.tmdb.org/t/p/w342${logoPath}`}
                alt={title}
                className="max-h-20 max-w-[72%] object-contain object-left-bottom"
              />
            ) : (
              <h3 className="line-clamp-2 max-w-[62%] text-xl font-semibold leading-tight text-white">
                {title}
              </h3>
            )}
          </div>
        </Link>
        <div className="mx-auto mt-3 h-1 w-[62%] overflow-hidden rounded-full bg-[#4f4f4f]">
          <div
            className="h-full rounded-full bg-[#e50914]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {isConfirmingRemove ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#181818] p-6 text-white shadow-2xl">
            <h3 className="text-xl font-semibold">Remove from Continue Watching?</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Are you sure you want to remove {title} from your continue watching list?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmingRemove(false)}
                className="cursor-pointer rounded-full bg-white/10 px-5 py-2 font-semibold transition-colors hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={removeFromList}
                className="cursor-pointer rounded-full bg-white px-5 py-2 font-semibold text-black transition-colors hover:bg-white/85"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ContinueWatchingList({
  mediaType,
  className = "mt-8",
}: {
  mediaType?: "movie" | "tv";
  className?: string;
}) {
  const params = new URLSearchParams({ limit: "8" });
  if (mediaType) params.set("mediaType", mediaType);
  const { data: items, isLoading, setData: setItems } = useApiQuery<
    ContinueWatchingItem[]
  >(`/api/continue-watching?${params.toString()}`, []);

  async function removeItem(item: ContinueWatchingItem) {
    const previousItems = items;
    setItems(items.filter((current) => current.id !== item.id));

    const res = await fetch("/api/continue-watching", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });

    if (!res.ok) {
      setItems(previousItems);
    }
  }

  if (isLoading) {
    return <ContinueWatchingSkeleton />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="text-2xl font-semibold">Continue Watching</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ContinueWatchingCard key={item.id} item={item} onRemove={removeItem} />
        ))}
      </div>
    </section>
  );
}
