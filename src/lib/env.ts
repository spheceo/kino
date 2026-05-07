import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_TMDB_KEY: z.string().min(1, "NEXT_PUBLIC_TMDB_KEY is required"),
    NEXT_PUBLIC_CONVEX_URL: z
      .string()
      .url("NEXT_PUBLIC_CONVEX_URL must be a valid URL"),
    NEXT_PUBLIC_CONVEX_SITE_URL: z
      .string()
      .url("NEXT_PUBLIC_CONVEX_SITE_URL must be a valid URL"),
    NEXT_PUBLIC_SITE_URL: z
      .string()
      .url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TMDB_KEY: process.env.NEXT_PUBLIC_TMDB_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
});
