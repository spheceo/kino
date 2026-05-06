import Link from "next/link";
import { IoPlay } from "react-icons/io5";

export function WatchNow({ id }: { id: string }) {
  return (
    <Link href={`/watch/${id}`}>
      <div className="bg-white text-black font-semibold h-12 w-48 rounded-full flex justify-center items-center gap-2 cursor-pointer">
        <IoPlay size={20} />
        Watch Now
      </div>
    </Link>
  );
}
