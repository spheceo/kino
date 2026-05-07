import { ProfilePanel } from "@/components/profile-panel";

export default function ProfilePage() {
  return (
    <main className="min-h-dvh bg-background px-10 pb-16 pt-32 text-white md:px-20">
      <section className="flex max-w-[620px] flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
            Account
          </p>
          <h1 className="mt-3 text-5xl font-semibold">Profile</h1>
        </div>
        <ProfilePanel />
      </section>
    </main>
  );
}
