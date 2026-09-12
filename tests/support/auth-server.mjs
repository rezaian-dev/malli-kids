import http from "node:http";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/** Mount the REAL Better Auth configuration without the memory cost of compiling
 * the whole storefront. The only substituted module is the server-only marker. */
export async function startAuthTestServer(env, port = 0) {
  let auth;
  let actions;
  let requestContext;
  const server = http.createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (req.url.startsWith("/__actions/")) {
        const name = req.url.slice("/__actions/".length);
        if (typeof actions[name] !== "function") {
          res.writeHead(404).end();
          return;
        }
        const store = { headers: new Headers(req.headers), cookies: [] };
        const result = await requestContext.run(store, () =>
          actions[name](JSON.parse(Buffer.concat(chunks).toString() || "{}")),
        );
        res.writeHead(200, {
          "Content-Type": "application/json",
          ...(store.cookies.length ? { "Set-Cookie": store.cookies } : {}),
        });
        res.end(JSON.stringify(result));
        return;
      }
      const response = await auth.handler(
        new Request(`${env.BETTER_AUTH_URL}${req.url}`, {
          method: req.method,
          headers: req.headers,
          body:
            req.method === "GET" || req.method === "HEAD"
              ? undefined
              : Buffer.concat(chunks),
        }),
      );
      const headers = Object.fromEntries(response.headers);
      const cookies = response.headers.getSetCookie();
      if (cookies.length) headers["set-cookie"] = cookies;
      res.writeHead(response.status, headers);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res
        .writeHead(500, { "Content-Type": "application/json" })
        .end(JSON.stringify({ code: "TEST_SERVER_ERROR" }));
    }
  });
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  env.BETTER_AUTH_URL = `http://127.0.0.1:${server.address().port}`;
  Object.assign(process.env, env);
  const cache = path.join(root, ".cache", "auth-tests");
  await mkdir(cache, { recursive: true });
  const marker = path.join(cache, "server-only.mjs");
  await writeFile(marker, "export {};\n");
  const outfile = path.join(cache, "auth.mjs");
  await build({
    entryPoints: [path.join(root, "tests/support/actions-entry.mjs")],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    packages: "external",
    alias: {
      "server-only": marker,
      "next/headers": path.join(root, "tests/support/request-context.mjs"),
      mongoose: path.join(root, "tests/support/mongoose-interop.mjs"),
    },
    tsconfig: path.join(root, "tsconfig.json"),
    logLevel: "silent",
  });
  ({ auth, actions, requestContext } = await import(
    pathToFileURL(outfile).href
  ));
  return {
    auth,
    env,
    async close() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      // The application's global singleton owns this connection.
      const connection = globalThis._mongoClient;
      if (connection) await (await connection).close();
      if (globalThis._mongoose) await (await globalThis._mongoose).disconnect();
    },
  };
}
