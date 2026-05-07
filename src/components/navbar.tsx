import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Navlinks from "@/components/navlinks";
import Search from "@/components/search";
import { UserAvatarLink } from "@/components/user-avatar-link";

const nav = [
  { name: "Home", link: "/" },
  { name: "Movies", link: "/movies" },
  { name: "TV Shows", link: "/tv" },
];

export default function Navbar() {
  return (
    <nav className="relative z-10 flex h-16 items-center gap-8 px-10">
      <Link href="/" aria-label="Kino home" className="shrink-0">
        <Image
          src="/Logo.svg"
          alt="Kino"
          width={154}
          height={60}
          className="h-7 w-auto"
          priority
        />
      </Link>
      <Navlinks nav={nav} />
      <div className="ml-auto flex items-center gap-5">
        <Suspense>
          <Search />
        </Suspense>
        <UserAvatarLink />
      </div>
    </nav>
  );
}
