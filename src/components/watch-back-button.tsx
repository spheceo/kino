"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

export function WatchBackButton() {
  const router = useRouter();

  function goHome() {
    router.replace("/");
  }

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={goHome}
      className="absolute left-24 top-12 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75"
    >
      <IoArrowBack size={24} />
    </button>
  );
}
