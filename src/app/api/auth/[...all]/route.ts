import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";
import {
  isServiceUnavailable,
  SERVICE_RETRY_SECONDS,
  SERVICE_UNAVAILABLE_MESSAGE,
} from "@/lib/action-result";

async function handleAuth(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error) {
    // Better Auth's HTTP rate limiter runs before its endpoint error handler.
    if (isServiceUnavailable(error)) {
      return Response.json(
        { code: "SERVICE_UNAVAILABLE", message: SERVICE_UNAVAILABLE_MESSAGE },
        {
          status: 503,
          headers: {
            "Retry-After": String(SERVICE_RETRY_SECONDS),
            "Cache-Control": "no-store",
          },
        },
      );
    }
    throw error;
  }
}

export const { GET, POST } = toNextJsHandler(handleAuth);
