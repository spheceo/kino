import MediaCard from "@/components/media-card";
import { MediaRowScroll } from "@/components/media-row-scroll";

export type MediaRowItem = {
  id: number | string;
  media_type?: "movie" | "tv";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
};

export type MediaRowData = {
  title: string;
  items: MediaRowItem[];
  mediaType: "movie" | "tv";
};

function getYear(item: MediaRowItem) {
  return (
    item.first_air_date?.slice(0, 4) ?? item.release_date?.slice(0, 4) ?? "N/A"
  );
}

function getTitle(item: MediaRowItem) {
  return item.title ?? item.name ?? "Untitled";
}

export function MediaRow({ row }: { row: MediaRowData }) {
  if (row.items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <h2 className="text-3xl font-bold">{row.title}</h2>
      <MediaRowScroll>
        {row.items.slice(0, 12).map((film) => (
          <MediaCard
            key={`${row.title}-${film.id}`}
            id={film.id}
            mediaType={film.media_type ?? row.mediaType}
            title={getTitle(film)}
            year={getYear(film)}
            posterPath={film.poster_path}
            className="w-[38vw] shrink-0 sm:w-[24vw] md:w-[14vw] xl:w-[11vw]"
          />
        ))}
      </MediaRowScroll>
    </section>
  );
}
