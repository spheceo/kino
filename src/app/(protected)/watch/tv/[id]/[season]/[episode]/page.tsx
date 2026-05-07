import { notFound } from "next/navigation";
import { WatchBackButton } from "@/components/watch-back-button";

type WatchTvPageProps = {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
};

export default async function WatchTvPage({ params }: WatchTvPageProps) {
  const { id, season, episode } = await params;

  if (!/^\d+$/.test(id) || !/^\d+$/.test(season) || !/^\d+$/.test(episode)) {
    notFound();
  }

  const streamUrl = `https://kino-api.up.railway.app/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`;

  return (
    <main className="relative h-dvh bg-black">
      <WatchBackButton />
      <iframe
        src={streamUrl}
        title="Kino video player"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </main>
  );
}
