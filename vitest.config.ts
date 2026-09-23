import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      // lcov es el formato que lee SonarCloud; text lo muestra en la terminal.
      reporter: ['text', 'lcov'],
      // El mismo mínimo que exige la quality gate de SonarCloud para código nuevo.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
