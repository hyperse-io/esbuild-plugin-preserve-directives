import { defineConfig } from 'tsup';
import { preserveDirectivesPlugin } from './src/preserve-directives.js';

export default defineConfig({
  outDir: 'dist',
  entry: ['src/*/index.ts'],
  tsconfig: 'tsconfig.build.json',
  clean: true,
  silent: true,
  format: 'esm',
  splitting: true,
  dts: true,
  treeshake: false,
  sourcemap: true,
  external: [],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  esbuildPlugins: [
    preserveDirectivesPlugin({
      directives: ['use client', 'use strict'],
      include: /\.(js|ts|jsx|tsx)$/,
      exclude: /node_modules/,
    }),
  ],
});
