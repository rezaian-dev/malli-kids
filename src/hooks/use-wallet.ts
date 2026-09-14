"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getWalletAction } from "@/lib/shop/wallet-actions";
import { requestErrorMessage } from "@/lib/action-result";
import type { WalletOverview } from "@/types";

const WALLET_CHANGED = "wallet:changed";

export function refreshWallet() {
  window.dispatchEvent(new Event(WALLET_CHANGED));
}

export function useWallet(page = 1) {
  const { user } = useAuth();
  const scope = user ? (user.id ? `id:${user.id}` : `email:${user.email}`) : "";
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const request = useRef(0);
  const [state, setState] = useState<{
    scope: string;
    data: WalletOverview | null;
    error: string;
    loading: boolean;
  }>({ scope: "", data: null, error: "", loading: false });

  const reload = useCallback(async () => {
    if (!scope) return;
    const sequence = ++request.current;
    setState((previous) => ({
      scope,
      data: previous.scope === scope ? previous.data : null,
      error: "",
      loading: true,
    }));
    try {
      const result = await getWalletAction(page);
      if (sequence !== request.current || currentScope.current !== scope) return;
      if (!result.ok) {
        setState({ scope, data: null, error: result.error, loading: false });
      } else if (
        user?.id
          ? result.data.ownerId !== user.id
          : result.data.ownerEmail?.toLowerCase() !== user?.email.toLowerCase()
      ) {
        setState({
          scope,
          data: null,
          error: "حساب تغییر کرده است؛ دوباره وارد شوید.",
          loading: false,
        });
      } else {
        setState({ scope, data: result.data, error: "", loading: false });
      }
    } catch {
      if (sequence === request.current && currentScope.current === scope) {
        setState({ scope, data: null, error: requestErrorMessage(), loading: false });
      }
    }
  }, [scope, page, user?.id]);

  useEffect(() => {
    if (!scope) return;
    void reload();
    const update = () => {
      if (document.visibilityState === "visible") void reload();
    };
    const interval = window.setInterval(update, 45_000);
    window.addEventListener(WALLET_CHANGED, update);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      request.current++;
      clearInterval(interval);
      window.removeEventListener(WALLET_CHANGED, update);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [reload, scope]);

  // Never show a previous account's balance while the new request is loading.
  return state.scope === scope
    ? { ...state, reload }
    : { data: null, error: "", loading: Boolean(scope), reload };
}
