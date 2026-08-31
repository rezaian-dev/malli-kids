import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/** Next forbids distDir outside the repo, so on a slow Windows drive we
 *  junction `.next` to %LOCALAPPDATA% (usually C:) — the official advice
 *  for "Slow filesystem detected … .next/dev". No-op on C: and non-Windows. */
if (process.platform !== "win32") process.exit(0);
if (/^c:/i.test(process.cwd())) process.exit(0);

const projectNext = join(process.cwd(), ".next");
const target = join(process.env.LOCALAPPDATA || tmpdir(), "malli-kids-next");
const same = (a, b) => resolve(a).toLowerCase() === resolve(b).toLowerCase();

mkdirSync(target, { recursive: true });

try {
  if (existsSync(projectNext)) {
    const st = lstatSync(projectNext);
    if (st.isSymbolicLink() && same(readlinkSync(projectNext), target)) {
      process.exit(0);
    }
    rmSync(projectNext, { recursive: true, force: true });
  }
  symlinkSync(target, projectNext, "junction");
} catch (err) {
  console.warn(
    `[malli-kids] could not point .next at a local disk (${target}). Dev may stay slow.\n${err instanceof Error ? err.message : err}`,
  );
}
