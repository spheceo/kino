export default function InfoLoading() {
  return (
    <main className="relative h-dvh overflow-hidden bg-background text-white">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#111] via-[#1c1c1c] to-[#111]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

      <section className="relative z-10 flex h-dvh max-w-[760px] flex-col justify-center px-10 py-24 md:px-20">
        <div className="h-16 w-[72%] rounded-lg bg-white/10" />
        <div className="mt-7 flex items-center gap-3">
          <div className="h-6 w-24 rounded bg-white/10" />
          <div className="h-6 w-16 rounded bg-white/10" />
          <div className="h-6 w-28 rounded bg-white/10" />
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-6 w-28 rounded bg-white/10" />
          <div className="flex gap-3">
            <div className="h-10 w-24 rounded-full bg-white/10" />
            <div className="h-10 w-28 rounded-full bg-white/10" />
            <div className="h-10 w-20 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="mt-10 space-y-3">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="h-4 w-[72%] rounded bg-white/10" />
          <div className="h-4 w-[66%] rounded bg-white/10" />
          <div className="h-4 w-[58%] rounded bg-white/10" />
        </div>
        <div className="mt-10 flex items-center gap-4">
          <div className="h-14 w-60 rounded-full bg-white/10" />
          <div className="h-14 w-14 rounded-full bg-white/10" />
        </div>
      </section>
    </main>
  );
}
