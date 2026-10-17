import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test files are compiled to CommonJS via `tsc` and run with plain `node`
    // (see package.json scripts test:*); `require()` is intentional there.
    "src/tests/**",
    "src/features/millikan/learning/socraticEngine.test.ts",
    "src/features/millikan/learning/outcomes/__tests__/**",
  ]),
  // Compiled test output (never linted).
  globalIgnores([".test-dist/**"]),
]);

export default eslintConfig;
