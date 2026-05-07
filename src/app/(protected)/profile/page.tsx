import { ContinueWatchingList } from "@/components/continue-watching-list";
import { ProfilePanel } from "@/components/profile-panel";
import { WatchLaterList } from "@/components/watch-later-list";

export default function ProfilePage() {
  return (
    <main className="min-h-dvh bg-background px-10 pb-16 pt-32 text-white md:px-20">
      <section className="flex max-w-none flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
            Account
          </p>
          <h1 className="mt-3 text-5xl font-semibold">Profile</h1>
        </div>
        <ProfilePanel />
        <ContinueWatchingList />
        <WatchLaterList />
      </section>
    </main>
  );
}
