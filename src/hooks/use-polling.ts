"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

// 🔄 The app's one realtime primitive: poll while the tab is visible, pause
// hidden, refetch on return — no websocket needed.
// Returns [value, setValue, refresh]: optimistic local updates via setValue,
// immediate server truth via refresh()
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  initial: T,
  enabled = true,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [data, setData] = useState(initial);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // ⚡ Stable by design — safe from listeners without re-subscribing
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
