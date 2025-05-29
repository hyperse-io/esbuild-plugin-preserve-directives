# @hyperse/esbuild-plugin-preserve-directives

<p align="left">
  <a aria-label="Build" href="https://github.com/hyperse-io/esbuild-plugin-preserve-directives/actions?query=workflow%3ACI">
    <img alt="build" src="https://img.shields.io/github/actions/workflow/status/hyperse-io/esbuild-plugin-preserve-directives/ci-integrity.yml?branch=main&label=ci&logo=github&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="stable version" href="https://www.npmjs.com/package/@hyperse/esbuild-plugin-preserve-directives">
    <img alt="stable version" src="https://img.shields.io/npm/v/%40hyperse%2Fesbuild-plugin-preserve-directives?branch=main&label=version&logo=npm&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="Top language" href="https://github.com/hyperse-io/esbuild-plugin-preserve-directives/search?l=typescript">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/hyperse-io/esbuild-plugin-preserve-directives?style=flat-square&labelColor=000&color=blue">
  </a>
  <a aria-label="Licence" href="https://github.com/hyperse-io/esbuild-plugin-preserve-directives/blob/main/LICENSE">
    <img alt="Licence" src="https://img.shields.io/github/license/hyperse-io/esbuild-plugin-preserve-directives?style=flat-quare&labelColor=000000" />
  </a>
</p>

This plugin for esbuild that preserves important directives (e.g., 'use client') at the top of output files

**_ support `windows`, `mac`, `linux`._**

## Installation

```sh
npm install --save @hyperse/esbuild-plugin-preserve-directives
```

## Usage

### With esbuild

```ts
import { build } from 'esbuild';
import { preserveDirectivesPlugin } from '@hyperse/esbuild-plugin-preserve-directives';

build({
  // ... other esbuild options
  metafile: true, // improving the accuracy
  plugins: [
    preserveDirectivesPlugin({
      cwd: process.cwd(),
      directives: ['use client', 'use strict'],
      include: /\.(js|ts|jsx|tsx)$/,
      exclude: /node_modules/,
    }),
  ],
});

build();
```

### With tsup

You must use the esbuildPlugin field & setup `treeshake:false`

```ts
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
  // NOTE we must disable treeshake, because it will treeshake by rollup again.
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
```

## Options

### `options.directives`

List of directives to preserve

### `options.include`

File pattern to apply the plugin (regex)

### `options.exclude`

File pattern to ignore (regex)

### `options.cwd`

The workspace root directory
