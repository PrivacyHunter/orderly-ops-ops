// Vercel hosting build.
// Usage: npm run build:vercel  →  .vercel/output (Vercel Build Output API v3)
// vercel.json points Vercel's build command here.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {},
  vite: {
    plugins: [mcpPlugin()],
  },
  nitro: {
    preset: "vercel",
  },
});
