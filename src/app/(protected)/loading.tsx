import { HeroSkeleton, MediaRowsSkeleton } from "@/components/page-skeletons";

export default function ProtectedLoading() {
  return (
    <div className="min-h-dvh bg-background text-white">
      <HeroSkeleton />
      <MediaRowsSkeleton />
    </div>
  );
}
