# Kino
This is an empty project.

## Auth Setup

Kino uses Better Auth with Google OAuth and Convex for user, account, and session persistence.

Required local `.env.local` values:

```env
NEXT_PUBLIC_TMDB_KEY=...
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://...convex.site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Required Convex environment values:

```bash
bun x convex env set BETTER_AUTH_SECRET "..."
bun x convex env set SITE_URL "http://localhost:3000"
bun x convex env set GOOGLE_CLIENT_ID "..."
bun x convex env set GOOGLE_CLIENT_SECRET "..."
```

Google OAuth redirect URI:

```txt
http://localhost:3000/api/auth/callback/google
```

After connecting Convex, regenerate Convex files:

```bash
bun x convex dev
```

## TODO

- Support an `In Theaters` / `Now Playing` badge using TMDB `movie/now_playing` and regional `movie/{id}/release_dates` theatrical release data.
- Support streaming availability/provider badges using TMDB `/{movie|tv}/{id}/watch/providers`, checking regional `flatrate`, `rent`, `buy`, `ads`, and `free` provider lists for services like Netflix, Disney+, Prime Video, and Apple TV+.

## Recommendation Algorithm Idea

Build recommendations in phases:

1. Start with rule-based personalization from user events: watches, completion rate, preview plays/unmutes, info page opens, Watch Now clicks, genres viewed, searches, skips, and watchlist actions.
2. Score titles using TMDB metadata: genres, keywords, cast, creators/directors, collections/franchises, production companies, language, release year, popularity, and rating.
3. Add rows such as `For You`, `Because You Watched`, `Continue Watching`, `More Like This`, `Top Picks in Your Genres`, `New to Kino`, and `Hidden Gems`.
4. Once enough user activity exists, add collaborative filtering: users who watched X also watched Y, and users with similar taste liked Z.
5. Use a hybrid ranker combining personal history, content similarity, global popularity, freshness, Kino availability, diversity, and product rules.

Potential event shape:

```json
{
  "userId": "123",
  "contentId": "299534",
  "mediaType": "movie",
  "event": "preview_unmuted",
  "progressSeconds": 18,
  "timestamp": "..."
}
```
