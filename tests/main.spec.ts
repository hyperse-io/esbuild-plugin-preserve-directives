import { readFileSync } from 'node:fs';
import { build } from 'tsup';
import { preserveDirectivesPlugin } from '../src/preserve-directives.js';
import { getDirname } from './get-dir-name.js';

describe('Should correct preserve directives', () => {
  beforeAll(async () => {
    await build({
      outDir: getDirname(import.meta.url, 'dist'),
      entry: [getDirname(import.meta.url, './fixtures/src/*/index.ts')],
      tsconfig: getDirname(import.meta.url, './fixtures/tsconfig.build.json'),
      clean: true,
      silent: true,
      format: 'esm',
      splitting: true,
      dts: false,
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
  });

  function readFile(path: string) {
    return readFileSync(path, 'utf-8');
  }

  it('should correct output `use client` directive', async () => {
    const file = readFile(getDirname(import.meta.url, 'dist/module1/index.js'));
    expect(file).toContain('use strict');
  });

  it('should correct output `use strict` directive', async () => {
    const file = readFile(getDirname(import.meta.url, 'dist/module2/index.js'));
    expect(file).not.toContain('use strict');
    expect(file).not.toContain('use client');
  });

  it('should correct output `nothing` directive', async () => {
    const file = readFile(getDirname(import.meta.url, 'dist/module3/index.js'));
    expect(file).not.toContain('use client');
    expect(file).not.toContain('use strict');
  });
});
