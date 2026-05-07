"use client";

import { usePathname } from "next/navigation";
import Banner from "@/components/banner";
import Navbar from "@/components/navbar";

export default function AppChrome() {
  const pathname = usePathname();

  if (pathname.startsWith("/watch/")) {
    return null;
  }

  return (
    <div className="absolute top-0 z-50 w-full">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-[#141414e6] via-[#14141499] to-transparent [mask-image:linear-gradient(to_bottom,black_0%,black_70%,transparent_100%)]" />
      <div className="relative z-10">
        <Banner />
        <Navbar />
      </div>
    </div>
  );
}
