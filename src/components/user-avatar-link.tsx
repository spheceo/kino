"use client";

import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

function getInitial(name?: string | null, email?: string | null) {
  return (name?.[0] ?? email?.[0] ?? "K").toUpperCase();
}

export function UserAvatarLink() {
  const { data } = authClient.useSession();
  const user = data?.user;

  return (
    <Link
      href="/profile"
      aria-label="Open profile"
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#2c2c2c] text-sm font-semibold text-white ring-1 ring-white/10 transition-opacity hover:opacity-85"
    >
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name ?? user.email ?? "Profile"}
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitial(user?.name, user?.email)}</span>
      )}
    </Link>
  );
}
