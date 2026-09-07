#!/usr/bin/env node
/**
 * Builds the app for a Node.js host (cPanel "Setup Node.js App", VPS, Railway...).
 *
 * Uses vite.config.node.ts, which pins Nitro's `node-server` preset and emits a
 * self-contained Node server at `.output/server/index.mjs` plus static assets in
 * `.output/public`. The repo-root `app.js` boots it (cPanel startup file).
 */
import { spawnSync } from "node:child_process";

const env = { ...process.env, NITRO_PRESET: "node-server" };
// Lovable's sandbox pins a Cloudflare preset; drop it so the Node build wins.
delete env.LOVABLE_NITRO_PRESET;

const result = spawnSync(
  "npx",
  ["vite", "build", "--config", "vite.config.node.ts"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  },
);

process.exit(result.status ?? 1);
