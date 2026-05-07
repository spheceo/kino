# Agent Instructions

- Use `bun` for package management and project commands.
- After major changes or fixes, push the changes to git/GitHub. Do not push for minor tweaks unless requested.
- When changing the database schema, use Drizzle schema push rather than migrations:

```bash
bun run db:push
```

- Handle database schema push conflicts carefully.
- If resolving a schema conflict would require deleting rows/data, ask for confirmation before proceeding.
