#!/usr/bin/env node
/**
 * Builds the app for a cPanel / Passenger (Node.js Selector) host.
 *
 * Nitro's `node_server` preset emits a self-contained Node server at
 * `.output/server/index.mjs` plus static assets in `.output/public`.
 * The repo-root `app.js` is the Passenger startup file that boots it.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["vite", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, NITRO_PRESET: "node_server" },
});

process.exit(result.status ?? 1);
