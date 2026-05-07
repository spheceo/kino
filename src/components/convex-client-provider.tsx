"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

function getConvexUrl() {
  const value = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!value) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  }

  return value;
}

const convex = new ConvexReactClient(getConvexUrl());

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
