"use client";

import { ContinueWatchingList } from "@/components/continue-watching-list";
import { WatchLaterList } from "@/components/watch-later-list";
import { useApiQuery } from "@/lib/client-data";

type ContinueWatchingItem = { id: string };
type WatchLaterItem = { id: string };

export function ProfileLists() {
  const continueWatching = useApiQuery<ContinueWatchingItem[]>(
    "/api/continue-watching?limit=1",
    [],
  );
  const watchLater = useApiQuery<WatchLaterItem[]>("/api/watch-later?limit=1", []);
  const isLoading = continueWatching.isLoading || watchLater.isLoading;
  const isEmpty =
    !isLoading &&
    continueWatching.data.length === 0 &&
    watchLater.data.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-center">
        <p className="max-w-md text-sm leading-6 text-white/45">
          Your continue watching and watch later lists are empty for now.
        </p>
      </div>
    );
  }

  return (
    <>
      <ContinueWatchingList />
      <WatchLaterList />
    </>
  );
}
