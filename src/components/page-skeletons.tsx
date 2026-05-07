export function HeroSkeleton() {
  return (
    <div className="relative h-[85dvh] overflow-hidden bg-[#181818]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent" />
      <div className="absolute bottom-16 left-10 w-full max-w-[620px] space-y-5">
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

export function MediaRowsSkeleton() {
  return (
    <div className="space-y-10 px-10 py-4">
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <section key={rowIndex} className="space-y-5">
          <div className="h-8 w-56 rounded bg-white/10" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 8 }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="aspect-[2/3] w-[38vw] shrink-0 animate-pulse rounded-xl bg-white/[0.07] sm:w-[24vw] md:w-[14vw] xl:w-[11vw]"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
