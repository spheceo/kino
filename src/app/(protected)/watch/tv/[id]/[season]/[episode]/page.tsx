import { notFound } from "next/navigation";
import { RemoveWatchStartParam } from "@/components/remove-watch-start-param";
import { WatchBackButton } from "@/components/watch-back-button";
import { WatchPlayerFrame } from "@/components/watch-player-frame";
import { WatchProgressListener } from "@/components/watch-progress-listener";
import { api } from "../../../../../../../../convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { env } from "@/lib/env";

type WatchTvPageProps = {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
  searchParams: Promise<{
    start?: string;
  }>;
};

async function getTvTitle(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${encodeURIComponent(id)}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return `Show ${id}`;
  }

  const data = (await res.json()) as { name?: string };
  return data.name ?? `Show ${id}`;
}

export default async function WatchTvPage({
  params,
  searchParams,
}: WatchTvPageProps) {
  const { id, season, episode } = await params;
  const { start } = await searchParams;

  if (!/^\d+$/.test(id) || !/^\d+$/.test(season) || !/^\d+$/.test(episode)) {
    notFound();
  }

  const [title, progress] = await Promise.all([
    getTvTitle(id),
    fetchAuthQuery(api.continueWatching.getForCurrentUser, {
      mediaType: "tv",
      tmdbId: id,
      seasonNumber: Number(season),
      episodeNumber: Number(episode),
    }),
  ]);
  const incomingStartSeconds = start && /^\d+$/.test(start) ? Number(start) : null;
  const startSeconds = Math.floor(incomingStartSeconds ?? progress?.progressSeconds ?? 0);
  const startParam = startSeconds > 0 ? `?start=${encodeURIComponent(String(startSeconds))}` : "";
  const streamUrl = `https://kino-api.up.railway.app/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}${startParam}`;

  return (
    <main className="relative h-dvh bg-black">
      <WatchBackButton />
      <RemoveWatchStartParam />
      <WatchProgressListener title={title} />
      <WatchPlayerFrame src={streamUrl} />
    </main>
  );
}
