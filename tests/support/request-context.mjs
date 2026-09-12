import { AsyncLocalStorage } from "node:async_hooks";

export const requestContext = new AsyncLocalStorage();
export async function headers() {
  return requestContext.getStore()?.headers ?? new Headers();
}
export async function cookies() {
  return { set() {} };
}
