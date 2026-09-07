/**
 * cPanel / Passenger startup file.
 *
 * cPanel's "Setup Node.js App" runs this file. It simply boots the Nitro
 * node_server bundle produced by `npm run build:cpanel`, which reads PORT
 * from the environment (Passenger sets it automatically).
 *
 * Do not run this before building — `.output/server/index.mjs` must exist.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const entry = join(root, ".output", "server", "index.mjs");

if (!existsSync(entry)) {
  console.error(
    "[startup] .output/server/index.mjs not found. Run `npm run build:cpanel` and upload the .output folder.",
  );
  process.exit(1);
}

await import(entry);
