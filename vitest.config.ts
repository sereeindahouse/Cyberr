import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: [
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
      // Round 4: the atlas/diagram model is framework-free, so the pure
      // client-side graph + layout code is covered by the same runner.
      "client/**/*.test.ts",
      "client/**/*.spec.ts",
      "shared/**/*.test.ts",
    ],
  },
});
