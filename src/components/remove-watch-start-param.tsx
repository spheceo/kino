"use client";

import { useEffect } from "react";

export function RemoveWatchStartParam() {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (!url.searchParams.has("start")) {
      return;
    }

    url.searchParams.delete("start");
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, []);

  return null;
}
