import { defineConfig } from "vitest/config";
import path from "node:path";

const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "fixtures/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@ls/schema": r("packages/schema/src/index.ts"),
      "@ls/orchestrator": r("packages/orchestrator/src/index.ts"),
      "@ls/agents": r("packages/agents/src/index.ts"),
      "@ls/models": r("packages/models/src/index.ts"),
      "@ls/media": r("packages/media/src/index.ts"),
      "@ls/fixtures": r("fixtures/seed/index.ts"),
    },
  },
});
