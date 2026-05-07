import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: requiredEnv("NEXT_PUBLIC_CONVEX_URL"),
  convexSiteUrl: requiredEnv("NEXT_PUBLIC_CONVEX_SITE_URL"),
});
