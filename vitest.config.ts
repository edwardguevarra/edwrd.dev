import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.spec.ts"],
      reporter: ["text", "html", "json", "lcov"],
      thresholds: {
        statements: 65,
        branches: 80,
        functions: 65,
        lines: 65,
      },
    },
  },
});
