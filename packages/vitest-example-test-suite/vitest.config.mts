/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    exclude: ["**/excludedTest.spec.ts"],
    coverage: {
      enabled: true,
    },
    reporters: ["blob"],
  },
});
