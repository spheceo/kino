"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ProfileHeroSkeleton } from "@/components/page-skeletons";
import { useApiQuery } from "@/lib/client-data";
import { env } from "@/lib/env";

export function ProfileHero() {
  const session = authClient.useSession();
  const user = session.data?.user;
  const initials = (user?.name?.[0] ?? user?.email?.[0] ?? "K").toUpperCase();

  const { data: recentItems } = useApiQuery<Array<{ mediaType: "movie" | "tv"; tmdbId: string }>>(
    "/api/continue-watching?limit=1",
    [],
  );
  const mostRecent = recentItems[0];

  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = env.NEXT_PUBLIC_TMDB_KEY;

    async function load() {
      if (!mostRecent) {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/day?api_key=${key}&language=en-US`,
        );

        if (!res.ok || cancelled) return;

        const data = (await res.json()) as {
          results?: Array<{ backdrop_path?: string | null }>;
        };
        const backdrops = data.results?.filter((item) => item.backdrop_path) ?? [];
        const random = backdrops[Math.floor(Math.random() * backdrops.length)];
        const path = random?.backdrop_path ?? null;

        if (!cancelled && path) {
          setBackdropUrl(`https://image.tmdb.org/t/p/w1280${path}`);
        }
        return;
      }

      const [detailsRes, imagesRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/${mostRecent.mediaType}/${mostRecent.tmdbId}?api_key=${key}&language=en-US`,
        ),
        fetch(
          `https://api.themoviedb.org/3/${mostRecent.mediaType}/${mostRecent.tmdbId}/images?api_key=${key}`,
        ),
      ]);

      if (!detailsRes.ok || cancelled) return;
      const details = (await detailsRes.json()) as { backdrop_path?: string | null };
      const images = imagesRes.ok
        ? ((await imagesRes.json()) as {
            backdrops?: Array<{ file_path?: string | null; aspect_ratio?: number | null }>;
          })
        : null;

      const backdrop = images?.backdrops
        ?.filter((b) => b.file_path)
        .sort(
          (a, b) =>
            Math.abs((a.aspect_ratio ?? 16 / 9) - 16 / 9) -
            Math.abs((b.aspect_ratio ?? 16 / 9) - 16 / 9),
        )[0];

      const path = backdrop?.file_path ?? details.backdrop_path ?? null;
      if (!cancelled && path) {
        setBackdropUrl(`https://image.tmdb.org/t/p/w1280${path}`);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mostRecent]);

  if (session.isPending) {
    return <ProfileHeroSkeleton />;
  }

  return (
    <div className="relative h-72 overflow-hidden md:h-80">
      {/* Banner background */}
      {backdropUrl ? (
        <>
          <img
            src={backdropUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-background" />
      )}
      {/* Bottom fade to page bg */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

      {/* Profile content — anchored to bottom-left aligned with navbar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end gap-5 px-10 pb-8">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white/10 shadow-2xl md:h-24 md:w-24">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Profile"}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
          )}
        </div>

        <div className="mb-1 min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            Account
          </p>
          <h1 className="truncate text-2xl font-bold leading-tight md:text-3xl">
            {user?.name ?? "Kino user"}
          </h1>
          <p className="truncate text-sm text-white/50">{user?.email}</p>
        </div>

      </div>
    </div>
  );
}
