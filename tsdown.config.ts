import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  // Solo ESM: api, mobile y web lo cargan de forma nativa (ver "Decisiones" en el README).
  format: ['esm'],
  // El paquete corre en Node (api), en Hermes (mobile) y en el navegador (web): no asume Node.
  platform: 'neutral',
  dts: true,
  sourcemap: true,
});
