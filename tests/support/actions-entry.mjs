import { auth } from "../../src/lib/auth/auth.ts";
import * as actions from "../../src/lib/auth/actions.ts";
import { requestContext } from "./request-context.mjs";

// Test transport only: collect the real auth endpoint's response cookies,
// replacing Next's request-scoped cookie store, NOT the auth implementation.
for (const name of Object.keys(auth.api)) {
  const original = auth.api[name];
  auth.api[name] = async (input) => {
    const result = await original({ ...input, returnHeaders: true });
    const store = requestContext.getStore();
    if (store && result.headers)
      store.cookies.push(...result.headers.getSetCookie());
    return result.response;
  };
}

export { auth, actions, requestContext };
