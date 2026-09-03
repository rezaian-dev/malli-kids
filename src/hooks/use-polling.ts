"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

/** 🔄 The app's one realtime primitive: refetches `fetcher` immediately and
 *  then every `intervalMs` while the tab is visible (paused while hidden,
 *  refetched once the moment it becomes visible again) — so a change made
 *  by another actor (an admin's reply, a customer's new order/review) shows
 *  up without a manual reload. No websocket/SSE server needed; every "live"
 *  list/count in the app uses this instead of a bespoke fetch loop. Pass
 *  `enabled: false` (e.g. while signed out) to skip fetching entirely.
 *
 *  Returns a `[value, setValue]` pair, same shape as `useState`, so a caller
 *  can apply an optimistic local update (e.g. "mark as read") without
 *  waiting for the next poll tick to reflect it. */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  initial: T,
  enabled = true,
): [T, Dispatch<SetStateAction<T>>] {
  const [data, setData] = useState(initial);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    function run() {
      fetcherRef.current().then((next) => {
        if (active) setData(next);
      });
    }

    run();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, intervalMs);

    function onVisible() {
      if (document.visibilityState === "visible") run();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, enabled]);

  return [data, setData];
}
