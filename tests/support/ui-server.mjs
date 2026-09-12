import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/** Real auth/form components and production CSS. Only Next Image/navigation and
 * the Server Action transport are adapted; auth and actions execute unchanged. */
export async function startUITestServer(apiBase, port = 0) {
  const cache = path.join(root, ".cache", "ui-tests");
  await mkdir(cache, { recursive: true });
  await build({
    entryPoints: [path.join(root, "tests/ui/entry.tsx")],
    outfile: path.join(cache, "app.js"),
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    alias: {
      "@/lib/auth/actions": path.join(root, "tests/ui/client-actions.ts"),
      "next/navigation": path.join(root, "tests/ui/next-stubs.tsx"),
      "next/image": path.join(root, "tests/ui/next-stubs.tsx"),
    },
    tsconfig: path.join(root, "tsconfig.json"),
    logLevel: "silent",
  });
  const stylesheet = path.join(root, "src/app/storefront.css");
  const css = await postcss([tailwind({ base: root })]).process(
    await readFile(stylesheet, "utf8"),
    { from: stylesheet },
  );
  await writeFile(path.join(cache, "app.css"), css.css);
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"><style>@font-face{font-family:Vazirmatn;src:url('/fonts/Vazirmatn-Variable.woff2')}body{font-family:Vazirmatn,sans-serif;margin:0}</style><title>آزمون فرم‌ها</title></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>`;
  const upstream = new URL(apiBase);
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith("/__actions/")) {
      const target = http.request(
        {
          hostname: upstream.hostname,
          port: upstream.port,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (reply) => {
          res.writeHead(reply.statusCode, reply.headers);
          reply.pipe(res);
        },
      );
      target.on("error", () => {
        res.writeHead(502).end();
      });
      req.pipe(target);
      return;
    }
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/") {
      res
        .writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
        .end(html);
      return;
    }
    const relative =
      pathname === "/app.js" || pathname === "/app.css"
        ? path.join(".cache/ui-tests", pathname.slice(1))
        : pathname.startsWith("/fonts/")
          ? path.join("src", pathname)
          : path.join("public", pathname);
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const ext = path.extname(file);
      const mime =
        {
          ".js": "application/javascript",
          ".css": "text/css",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".woff2": "font/woff2",
        }[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime }).end(await readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(port, "0.0.0.0", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    async close() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
