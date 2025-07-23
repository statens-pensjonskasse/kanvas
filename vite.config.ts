import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: [".*"],
      future: {
        unstable_optimizeDeps: true,
      },
    }),
    tsconfigPaths()],
  server: {
    port: Number(process.env.PORT) || 3000,
  },
});

