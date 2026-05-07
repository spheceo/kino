# Kino

## Database/Auth Setup

Kino now uses Better Auth with the Drizzle adapter and Neon Postgres.

Required environment values:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_TMDB_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, set `NEXT_PUBLIC_SITE_URL` to your deployed domain and add both redirect URIs in Google Cloud OAuth:

```txt
http://localhost:3000/api/auth/callback/google
https://your-domain.com/api/auth/callback/google
```

Database schema sync:

```bash
bun run db:push
```

We do not use Drizzle migrations in this project. Schema changes are pushed directly with `drizzle-kit push`.

## TODO

- Support an `In Theaters` / `Now Playing` badge using TMDB `movie/now_playing` and regional `movie/{id}/release_dates` theatrical release data.
- Support streaming availability/provider badges using TMDB `/{movie|tv}/{id}/watch/providers`, checking regional `flatrate`, `rent`, `buy`, `ads`, and `free` provider lists for services like Netflix, Disney+, Prime Video, and Apple TV+.

## Recommendation Algorithm Idea

Build recommendations in phases:

1. Start with rule-based personalization from user events: watches, completion rate, preview plays/unmutes, info page opens, Watch Now clicks, genres viewed, searches, skips, and watchlist actions.
2. Score titles using TMDB metadata: genres, keywords, cast, creators/directors, collections/franchises, production companies, language, release year, popularity, and rating.
3. Add rows such as `For You`, `Because You Watched`, `More Like This`, `Top Picks in Your Genres`, `New to Kino`, and `Hidden Gems`.
