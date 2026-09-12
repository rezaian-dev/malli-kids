import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { startTestServices } from "./support/services.mjs";
import { startAuthTestServer } from "./support/auth-server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const withUI = process.argv.includes("--ui");
const cache = path.join(root, ".cache");
await mkdir(cache, { recursive: true });
const temporary = await mkdtemp(path.join(cache, "test-run-"));
let services;
let api;
let ui;
let child;
let closing;
function cleanup() {
  return (closing ??= (async () => {
    child?.kill("SIGTERM");
    await ui?.close();
    await api?.close();
    await services?.close();
    await rm(temporary, { recursive: true, force: true });
  })());
}
process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(143);
});
process.on("SIGINT", async () => {
  await cleanup();
  process.exit(130);
});

try {
  services = await startTestServices();
  api = await startAuthTestServer(services.env);
  if (withUI) {
    const { startUITestServer } = await import("./support/ui-server.mjs");
    ui = await startUITestServer(api.env.BETTER_AUTH_URL);
  }
  const envFile = path.join(temporary, "env.json");
  await writeFile(envFile, JSON.stringify(api.env), { mode: 0o600 });
  const files = [
    "tests/auth-api.test.mjs",
    ...(withUI ? ["tests/auth-ui.test.mjs"] : []),
  ];
  child = spawn(
    process.execPath,
    ["--test", "--test-concurrency=1", "--test-reporter=spec", ...files],
    {
      env: {
        ...process.env,
        TEST_ENV_FILE: envFile,
        ...(ui ? { TEST_UI_URL: ui.url } : {}),
      },
      stdio: "inherit",
    },
  );
  process.exitCode = await new Promise((resolve) =>
    child.once("exit", (code) => resolve(code ?? 1)),
  );
} finally {
  await cleanup();
}
