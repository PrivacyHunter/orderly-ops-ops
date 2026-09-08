// Node.js hosting build (cPanel "Setup Node.js App" / VPS / any Node host).
// Usage: npm run build:node   →  .output/server/index.mjs + .output/public
// Boot with: node app.js  (or set app.js as the cPanel startup file)
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {},
  vite: {
    plugins: [mcpPlugin()],
  },
  nitro: {
    preset: "node-server",
    output: {
      dir: ".output",
      publicDir: ".output/public",
      serverDir: ".output/server",
    },
  },
});
