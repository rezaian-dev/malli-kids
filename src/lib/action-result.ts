/** 🎯 The shared shape every `'use server'` action returns: `{ok:true}`
 *  (plus `data` when `T` isn't `undefined`) or `{ok:false, error}` with a
 *  Farsi message ready to show as-is — never raw internals. */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };
