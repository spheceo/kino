export default function ProfileLoading() {
  return (
    <main className="min-h-dvh overflow-hidden bg-background px-10 pb-16 pt-32 text-white md:px-20">
      <section className="flex max-w-none flex-col gap-8">
        <div>
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="mt-3 h-14 w-48 rounded-lg bg-white/10" />
        </div>

        <div className="flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <div className="h-20 w-20 shrink-0 rounded-full bg-white/10" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-7 w-48 rounded bg-white/10" />
            <div className="h-4 w-64 rounded bg-white/10" />
          </div>
          <div className="h-10 w-24 rounded-full bg-white/10" />
        </div>

        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <section key={sectionIndex} className="mt-8">
            <div className="h-8 w-64 rounded bg-white/10" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <div className="aspect-video animate-pulse rounded-xl bg-white/[0.07]" />
                  {sectionIndex === 0 ? (
                    <div className="mx-auto mt-3 h-1 w-[62%] rounded-full bg-white/10" />
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
