#!/usr/bin/env node
/**
 * Builds the app for Vercel (serverless SSR).
 *
 * Uses vite.config.vercel.ts, which pins Nitro's `vercel` preset so the output
 * lands in `.vercel/output` (Build Output API v3) instead of the default
 * Cloudflare Worker bundle — otherwise Vercel serves 404: NOT_FOUND.
 */
import { spawnSync } from "node:child_process";

const env = { ...process.env, NITRO_PRESET: "vercel" };
// Lovable's sandbox pins a Cloudflare preset; drop it so the Vercel build wins.
delete env.LOVABLE_NITRO_PRESET;
delete env.LOVABLE_SANDBOX;
delete env.DEV_SERVER__PROJECT_PATH;

const result = spawnSync(
  "npm",
  ["exec", "--no", "--", "vite", "build", "--config", "vite.config.vercel.ts"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  },
);

process.exit(result.status ?? 1);
