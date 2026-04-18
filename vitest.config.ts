import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/api/src/**/*.test.ts"],
    passWithNoTests: false
  }
});
