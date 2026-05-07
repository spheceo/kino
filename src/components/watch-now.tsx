import Link from "next/link";
import { IoPlay } from "react-icons/io5";

type WatchNowProps = {
  id: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
};

export function WatchNow({ id, mediaType, season, episode }: WatchNowProps) {
  const href =
    mediaType === "tv"
      ? `/watch/tv/${encodeURIComponent(id)}/${encodeURIComponent(
          String(season ?? 1),
        )}/${encodeURIComponent(String(episode ?? 1))}`
      : `/watch/${encodeURIComponent(id)}`;

  return (
    <Link href={href}>
      <div className="bg-white text-black font-semibold h-12 w-48 rounded-full flex justify-center items-center gap-2 cursor-pointer">
        <IoPlay size={20} />
        Watch Now
      </div>
    </Link>
  );
}
