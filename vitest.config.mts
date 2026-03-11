import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.spec.ts"],
  },
  resolve: {
    alias: {
      "@application": path.resolve(__dirname, "src/application"),
      "@kernel": path.resolve(__dirname, "src/kernel"),
      "@main": path.resolve(__dirname, "src/main"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@infra": path.resolve(__dirname, "src/infra"),
    },
  },
});
