import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function isAuthenticated() {
  return Boolean(await getSession());
}

export async function getCurrentUserId() {
  const session = await getSession();
  return session?.user.id ?? null;
}
