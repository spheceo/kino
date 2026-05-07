export function HeroSkeleton() {
  return (
    <div className="relative h-[82dvh] overflow-hidden bg-[#181818]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      <div className="absolute bottom-20 left-10 w-full max-w-[620px] space-y-5">
        <div className="h-16 w-3/4 rounded-lg bg-white/10" />
        <div className="h-5 w-1/3 rounded bg-white/10" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-5/6 rounded bg-white/10" />
        </div>
        <div className="h-11 w-36 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function MediaRowSkeleton() {
  return (
    <section className="space-y-5">
      <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] w-[38vw] shrink-0 animate-pulse rounded-xl bg-white/[0.07] sm:w-[24vw] md:w-[14vw] xl:w-[11vw]"
          />
        ))}
      </div>
    </section>
  );
}

export function MediaRowsSkeleton() {
  return (
    <div className="space-y-10 px-10 py-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <MediaRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ContinueWatchingSkeleton() {
  return (
    <section className="space-y-4">
      <div className="h-7 w-52 animate-pulse rounded bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-video animate-pulse rounded-xl bg-white/[0.07]" />
            <div className="mx-auto mt-3 h-1 w-[62%] animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function WatchLaterSkeleton() {
  return (
    <section className="space-y-4">
      <div className="h-7 w-36 animate-pulse rounded bg-white/10" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.07]" />
        ))}
      </div>
    </section>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className="relative h-72 overflow-hidden md:h-80">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.06] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      <div className="absolute bottom-0 left-0 right-0 flex items-end gap-5 px-10 pb-8">
        <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-white/10 md:h-24 md:w-24" />
        <div className="mb-1 flex-1 space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
          <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-56 animate-pulse rounded bg-white/10" />
        </div>
        <div className="mb-1 h-9 w-24 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}
