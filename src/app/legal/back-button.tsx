"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-10 flex cursor-pointer items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
    >
      <IoArrowBack size={16} />
      Back
    </button>
  );
}
