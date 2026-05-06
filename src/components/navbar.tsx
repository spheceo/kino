import Image from "next/image";
import Link from "next/link";
import Navlinks from "@/components/navlinks";
import Search from "@/components/search";

const nav = [
  { name: "Home", link: "/" },
  { name: "Movies", link: "/movies" },
  { name: "TV Shows", link: "/tv" },
];

export default function Navbar() {
  return (
    <nav className="relative z-10 flex h-16 items-center gap-8 px-10 bg-gradient-to-b from-[#141414e6] via-[#14141499] to-transparent backdrop-blur-sm">
      <Link href="/" aria-label="Kino home" className="shrink-0">
        <Image
          src="/Logo.svg"
          alt="Kino"
          width={154}
          height={60}
          className="h-8 w-auto"
          priority
        />
      </Link>
      <Navlinks nav={nav} />
      <Search />
    </nav>
  );
}
