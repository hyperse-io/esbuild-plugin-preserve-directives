import type { Loader } from 'esbuild';
import { type Plugin } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { extname, relative } from 'node:path';

export interface DirectivePreservationOptions {
  cwd?: string;
  directives: string[];
  include: RegExp;
  exclude: RegExp;
}
// Not: outputs use POSIX path format e.g. `/dist/index.js`
// But relativePath is using Windows path format e.g. `dist\index.js`
// So we need to convert the relativePath to POSIX format
function getRelativePath(targetPath: string, cwd?: string) {
  const platformPath = relative(cwd || process.cwd(), targetPath);
  return platformPath.replace(/\\/g, '/');
}

/**
 * Note we can not setup rollup treeshake while using this plugin, because rollup treeshake will remove the `use client` directive
 * @example
 * ```ts
 * export default defineConfig({
 *  outDir: 'dist',
 *  entry: ['src/index.ts'],
 *  tsconfig: 'tsconfig.build.json',
 *  clean: true,
 *  silent: true,
 *  format: 'esm',
 *  splitting: true,
 *  dts: true,
 *  treeshake: false,
 *  esbuildOptions(options) {
 *    options.jsx = 'automatic';
 *  },
 *  esbuildPlugins: [
 *    preserveDirectivesPlugin({
 *      directives: ['use client', 'use strict'],
 *      include: /\.(js|ts|jsx|tsx)$/,
 *      exclude: /node_modules/,
 *    }),
 *  ],
 * );
 * ```
 */
export function preserveDirectivesPlugin(
  options: DirectivePreservationOptions
): Plugin {
  const { directives, exclude, include, cwd } = options;

  return {
    name: 'esbuild-plugin-preserve-directives',
    setup(build) {
      // Need to use posix path format map for metafile
      const fileDirectives = new Map<string, string[]>();

      build.onLoad({ filter: include }, async (args) => {
        if (exclude.test(args.path)) {
          return null;
        }
        const contents = await readFile(args.path, 'utf8');
        const lines = contents.split('\n');

        const foundDirectives = lines
          .slice(0, 5)
          .filter((line) =>
            directives.some(
              (directive) =>
                line.trim().startsWith(`"${directive}"`) ||
                line.trim().startsWith(`'${directive}'`) ||
                line.trim().startsWith(`\`${directive}\``)
            )
          );

        if (foundDirectives.length > 0) {
          const relativePath = getRelativePath(args.path, cwd);
          fileDirectives.set(relativePath, foundDirectives);
        }
        return {
          contents,
          loader: extname(args.path).slice(1) as Loader,
        };
      });

      build.onEnd(async (result) => {
        if (result.errors.length > 0) return;

        const outputs = result.outputFiles || [];
        for (const file of outputs) {
          const relevantDirectives = new Set<string>();
          if (!result.metafile) {
            const fileContent = file.text;
            for (const [filePath, directives] of fileDirectives) {
              if (fileContent.includes(filePath)) {
                directives.forEach((d) => relevantDirectives.add(d));
              }
            }
          } else {
            const relativePath = getRelativePath(file.path, cwd);
            const meta = result.metafile.outputs[relativePath];

            if (!meta) {
              continue;
            }
            for (const input of Object.keys(meta.inputs)) {
              const directives = fileDirectives.get(input);
              if (directives) {
                directives.forEach((d) => relevantDirectives.add(d));
              }
            }
          }

          if (relevantDirectives.size > 0) {
            const directiveString =
              Array.from(relevantDirectives).join('\n') + '\n\n';
            file.contents = Buffer.from(directiveString + file.text);
          }
        }
      });
    },
  };
}
