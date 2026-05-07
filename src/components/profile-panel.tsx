"use client";

import Image from "next/image";
import { SignOutButton } from "@/components/sign-out-button";
import { authClient } from "@/lib/auth-client";

export function ProfilePanel() {
  const session = authClient.useSession();
  const user = session.data?.user;

  return (
    <div className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2c2c2c] text-2xl font-semibold">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? user.email ?? "Profile"}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>
            {(user?.name?.[0] ?? user?.email?.[0] ?? "K").toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-2xl font-semibold">
          {user?.name ?? "Kino user"}
        </h2>
        <p className="mt-1 truncate text-white/55">{user?.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
