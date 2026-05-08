"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { videoProviderConfig } from "@/lib/video-provider";

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
      className={`absolute z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75 ${
        videoProviderConfig.provider === "vidfast" ? "left-24 top-12" : "left-5 top-5"
      }`}
    >
      <IoArrowBack size={24} />
    </button>
  );
}
