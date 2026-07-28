"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

/** 🔄 The app's one realtime primitive: refetches `fetcher` immediately and
 *  then every `intervalMs` while the tab is visible (paused while hidden,
 *  refetched once the moment it becomes visible again) — so a change made
 *  by another actor (an admin's reply, a customer's new order/review) shows
 *  up without a manual reload. No websocket/SSE server needed; every "live"
 *  list/count in the app uses this instead of a bespoke fetch loop. Pass
 *  `enabled: false` (e.g. while signed out) to skip fetching entirely.
 *
 *  Returns a `[value, setValue, refresh]` triple, same shape as `useState`
 *  plus a refresh: callers can apply an optimistic local update (e.g. "mark
 *  as read") via `setValue`, or re-read the server truth immediately after
 *  their own mutation via `refresh()` instead of waiting for the next poll
 *  tick — that's what makes the admin console feel instant. */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  initial: T,
  enabled = true,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [data, setData] = useState(initial);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // ⚡ Stable by design (only touches refs + setState) — safe to call from
  // event listeners and mutation handlers without re-subscribing.
  const refresh = useCallback(() => {
    fetcherRef.current().then((next) => setData(next));
  }, []);

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

  return [data, setData, refresh];
}
