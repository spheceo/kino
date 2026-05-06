"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  link: string;
}

export default function Navlinks({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {nav.map((item) => (
        <Link
          key={item.link}
          href={item.link}
          className={clsx(
            pathname === item.link && "text-white cursor-default",
            "text-[#c6c6c6] font-semibold hover:text-white",
          )}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}
