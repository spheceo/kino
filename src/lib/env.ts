import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_TMDB_KEY: z.string().min(1, "NEXT_PUBLIC_TMDB_KEY is required"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TMDB_KEY: process.env.NEXT_PUBLIC_TMDB_KEY,
  },
});
