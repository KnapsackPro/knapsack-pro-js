/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/excludedTest.spec.ts"],
    coverage: {
      enabled: true
    },
    reporters: ["blob"],
    retry: 1,
    projects: [
      { test: { name: 'project 1' } },
      { test: { name: 'project 2' } },
    ],
  },
});
