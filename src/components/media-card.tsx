import Image from "next/image";
import Link from "next/link";
import { IoImageOutline } from "react-icons/io5";

type MediaCardProps = {
  id: string | number;
  title: string;
  year?: string;
  posterPath?: string | null;
  className?: string;
};

export default function MediaCard({
  id,
  title,
  year,
  posterPath,
  className = "",
}: MediaCardProps) {
  return (
    <Link
      href={`/info/${id}`}
      className={`group relative block aspect-[2/3] overflow-hidden rounded-xl border border-[#090909] bg-[#232323] ${className}`}
    >
      {posterPath ? (
        <Image
          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
          alt={title}
          width={500}
          height={750}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#2a2a2a] px-4 text-center text-[#8a8a8a]">
          <IoImageOutline size={34} />
          <p className="text-sm font-medium">No image found</p>
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/45 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h2 className="truncate text-xl font-semibold leading-tight text-white">
          {title}
        </h2>
        {year ? (
          <p className="mt-2 text-xl font-semibold leading-tight text-[#8a8a8a]">
            {year}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
