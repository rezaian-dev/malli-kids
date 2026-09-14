"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  initial: T,
  enabled = true,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [data, setData] = useState(initial);
  const fetcherRef = useRef(fetcher);
  const version = useRef(0);
  fetcherRef.current = fetcher;

  const refresh = useCallback(() => {
    const request = ++version.current;
    fetcherRef
      .current()
      .then((next) => {
        if (request === version.current) setData(next);
      })
      .catch(() => {});
  }, []);

  // A completed mutation invalidates older polling responses.
  const update = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    version.current++;
    setData(next);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = setInterval(onVisible, intervalMs);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      version.current++;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, enabled, refresh]);

  return [data, update, refresh];
}
