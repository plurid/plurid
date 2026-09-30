import { defineConfig } from 'tsup';
import { cp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';


// Modern build (2026-06-17): tsup (esbuild) replacing the bespoke esbuild script.
// Node CLI scaffolder → CJS + ESM, Node platform. commander/inquirer/ora are
// auto-externalized. The `templates/` tree is copied into distribution afterwards
// (the CLI reads templates relative to its dist).
export default defineConfig({
    entry: ['source/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    outDir: 'distribution',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    clean: true,
    treeshake: false,
    // `__dirname` in the ESM build too (the binder runs that build): where the templates and
    // `versions.json` are found. Without it the ESM build fell back to `process.argv[1]`, which is
    // `node_modules/.bin/` when npm links the bin, and found no template.
    shims: true,
    async onSuccess() {
        await cp('./templates', './distribution/templates', { recursive: true });
        // the versions the generated manifest asks for: the workspace's siblings (the kit, the engine, the server)
        const version = async (relative: string) => JSON.parse(await readFile(resolve(relative), 'utf8')).version;
        await writeFile('./distribution/versions.json', JSON.stringify({
            kit: await version('../../plurid-web/plurid-works/plurid-kit/package.json'),
            react: await version('../../plurid-web/plurid-works/plurid-react/package.json'),
            server: await version('../../plurid-web/plurid-works/plurid-react-server/package.json'),
            generator: JSON.parse(await readFile(resolve('./package.json'), 'utf8')).version,
        }, null, 4));
    },
});
