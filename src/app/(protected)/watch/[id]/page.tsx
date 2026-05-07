import { notFound } from "next/navigation";
import { RemoveWatchStartParam } from "@/components/remove-watch-start-param";
import { WatchBackButton } from "@/components/watch-back-button";
import { WatchPlayerFrame } from "@/components/watch-player-frame";
import { WatchProgressListener } from "@/components/watch-progress-listener";
import { getCurrentUserId } from "@/lib/auth-server";
import { getContinueWatching } from "@/lib/media-store";
import { env } from "@/lib/env";

type WatchPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    start?: string;
  }>;
};

async function getMovieTitle(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return `Movie ${id}`;
  }

  const data = (await res.json()) as { title?: string };
  return data.title ?? `Movie ${id}`;
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const { start } = await searchParams;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const userId = await getCurrentUserId();
  const [title, progress] = await Promise.all([
    getMovieTitle(id),
    userId
      ? getContinueWatching(userId, {
          mediaType: "movie",
          tmdbId: id,
        })
      : null,
  ]);
  const incomingStartSeconds = start && /^\d+$/.test(start) ? Number(start) : null;
  const startSeconds = Math.floor(incomingStartSeconds ?? progress?.progressSeconds ?? 0);
  const startParam = startSeconds > 0 ? `?start=${encodeURIComponent(String(startSeconds))}` : "";
  const streamUrl = `https://kino-api.up.railway.app/movie/${encodeURIComponent(id)}${startParam}`;

  return (
    <main className="relative h-dvh bg-black">
      <WatchBackButton />
      <RemoveWatchStartParam />
      <WatchProgressListener title={title} />
      <WatchPlayerFrame
        src={streamUrl}
        title={title}
        mediaType="movie"
        tmdbId={id}
      />
    </main>
  );
}
