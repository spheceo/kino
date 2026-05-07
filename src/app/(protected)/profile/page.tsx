import { ContinueWatchingList } from "@/components/continue-watching-list";
import { ProfileHero } from "@/components/profile-hero";
import { SignOutButton } from "@/components/sign-out-button";
import { WatchLaterList } from "@/components/watch-later-list";

export default function ProfilePage() {
  return (
    <main className="min-h-dvh bg-background text-white">
      <ProfileHero />
      <div className="flex flex-col gap-10 px-10 pb-16 pt-10">
        <ContinueWatchingList />
        <WatchLaterList />

        <section className="mt-4 border-t border-white/[0.07] pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
            Account
          </h2>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="font-medium">Sign out of Kino</p>
              <p className="mt-1 text-sm text-white/45">
                You can sign back in at any time.
              </p>
            </div>
            <SignOutButton />
          </div>
        </section>
      </div>
    </main>
  );
}
