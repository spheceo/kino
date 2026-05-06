type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  return (
    <main className="min-h-dvh bg-background px-10 pt-32 text-white">
      <h1 className="text-3xl font-bold">Search</h1>
      {q ? (
        <p className="mt-4 text-white/70">Showing results for {q}</p>
      ) : (
        <p className="mt-4 text-white/70">Start typing to search.</p>
      )}
    </main>
  );
}
