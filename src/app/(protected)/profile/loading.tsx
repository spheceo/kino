import {
  ProfileHeroSkeleton,
  ContinueWatchingSkeleton,
  WatchLaterSkeleton,
} from "@/components/page-skeletons";

export default function ProfileLoading() {
  return (
    <main className="min-h-dvh bg-background text-white">
      <ProfileHeroSkeleton />
      <div className="flex flex-col gap-10 px-10 pb-16 pt-10">
        <ContinueWatchingSkeleton />
        <WatchLaterSkeleton />
      </div>
    </main>
  );
}
