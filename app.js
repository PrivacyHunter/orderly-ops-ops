/**
 * cPanel / Passenger startup file.
 *
 * cPanel's "Setup Node.js App" runs this file. It boots the Nitro node_server
 * bundle produced by `npm run build:cpanel`, which reads PORT from the
 * environment (Passenger sets it automatically).
 *
 * Do not run this before building — the server bundle must exist.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

const candidates = [
  join(root, ".output", "server", "index.mjs"),
  join(root, "dist", "server", "index.mjs"),
];

const entry = candidates.find((file) => existsSync(file));

if (!entry) {
  console.error(
    "[startup] Server bundle not found. Run `npm run build:cpanel` locally and upload the generated `.output` folder next to this file.",
  );
  console.error(`[startup] Looked for:\n  ${candidates.join("\n  ")}`);
  process.exit(1);
}

console.log(`[startup] Booting ${entry}`);
await import(entry);
