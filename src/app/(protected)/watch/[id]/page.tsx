import { notFound } from "next/navigation";
import { WatchBackButton } from "@/components/watch-back-button";

type WatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const streamUrl = `https://kino-api.up.railway.app/movie/${encodeURIComponent(id)}`;

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
