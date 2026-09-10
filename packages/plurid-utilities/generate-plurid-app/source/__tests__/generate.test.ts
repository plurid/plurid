jest.mock('ora', () => () => ({ start: () => ({ stopAndPersist: () => {} }) }));

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import generateKitApplication, {
    renderTemplate,
    listGenerated,
    managerCommands,
    stamp,
} from '../process/kit';
import {
    resolveVersions,
    resolveTemplateDirectory,
} from '../process/kit/versions';
import {
    TEMPLATE,
} from '../data/constants';



const temporary = () => fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-generate-app-'));

describe('the kit-shaped generation', () => {
    it('finds the template and the workspace versions from the source tree (a stale build would show here)', () => {
        const template = resolveTemplateDirectory(TEMPLATE);
        expect(fs.existsSync(path.join(template, 'plurid.config.ts'))).toBe(true);
        const versions = resolveVersions();
        const workspace = (relative: string) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '..', '..', relative), 'utf8')).version;
        expect(versions.kit).toBe(workspace('plurid-web/plurid-works/plurid-kit/package.json'));
        expect(versions.react).toBe(workspace('plurid-web/plurid-works/plurid-react/package.json'));
        expect(versions.server).toBe(workspace('plurid-web/plurid-works/plurid-react-server/package.json'));
    });

    it('writes a deterministic kit-shaped application: the config, the two entries, the routes / shell / planes, the manifest with the scripts, the tsconfig', async () => {
        const base = temporary();
        const directory = path.join(base, 'My Site');
        fs.mkdirSync(directory);
        await renderTemplate({ directory, name: 'my-site', manager: 'pNPM' }, { kit: '0.0.0-5', react: '0.0.0-38', server: '0.0.0-19' }, resolveTemplateDirectory(TEMPLATE));
        // the listing is byte-sorted (README before package.json), the same on every machine; the
        // gitignore ships as `gitignore` (npm pack strips a dotfile) and is restored on render
        expect(listGenerated(directory)).toEqual([
            '.env.example',
            '.gitignore',
            'README.md',
            'package.json',
            'plurid.config.ts',
            'source/client/index.tsx',
            'source/public/favicon.ico',
            'source/public/manifest.json',
            'source/public/robots.txt',
            'source/server/index.ts',
            'source/server/preserves/index.ts',
            'source/shared/planes/index.tsx',
            'source/shared/routes/index.tsx',
            'source/shared/shell/index.tsx',
            'tsconfig.json',
        ]);
        const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
        expect(manifest.name).toBe('my-site');
        expect(manifest.scripts).toEqual({ dev: 'plurid dev --watch', build: 'plurid build', start: 'plurid start', check: 'tsc --noEmit', test: 'echo "no tests yet"' });
        expect(manifest.dependencies['@plurid/plurid-kit']).toBe('0.0.0-5');
        expect(manifest.dependencies['@plurid/plurid-react']).toBe('0.0.0-38');
        expect(manifest.dependencies['@plurid/plurid-react-server']).toBe('0.0.0-19');
        expect(Object.keys(manifest.devDependencies)).toEqual(['@types/react', '@types/react-dom', 'typescript']);
        // nothing of the old shape
        for (const gone of ['webpack', 'rollup', 'react-scripts', 'nodemon']) {
            expect(JSON.stringify(manifest)).not.toContain(gone);
        }
        // the placeholders are filled everywhere
        for (const file of listGenerated(directory)) {
            if (/\.(ts|tsx|json|md)$/.test(file)) {
                expect(fs.readFileSync(path.join(directory, file), 'utf8')).not.toMatch(/__#[A-Z_]+#__/);
            }
        }
        expect(fs.readFileSync(path.join(directory, 'plurid.config.ts'), 'utf8')).toContain("serverName: 'my-site'");
        expect(fs.readFileSync(path.join(directory, 'README.md'), 'utf8')).toContain('pnpm dev');
        const tsconfig = JSON.parse(fs.readFileSync(path.join(directory, 'tsconfig.json'), 'utf8'));
        expect(tsconfig.compilerOptions.paths['~shared/*']).toEqual(['./source/shared/*']);
        expect(tsconfig.include).toEqual(['plurid.config.ts', 'source']);
        fs.rmSync(base, { recursive: true, force: true });
    });

    it('generates end to end without installing; git when asked', async () => {
        const base = temporary();
        const directory = path.join(base, 'app');
        fs.mkdirSync(directory);
        const log = jest.spyOn(console, 'log').mockImplementation(() => {});
        await generateKitApplication({ start: Date.now(), directory, name: 'app', manager: 'NPM', versioning: 'Git', install: false });
        log.mockRestore();
        expect(fs.existsSync(path.join(directory, '.git'))).toBe(true);
        expect(fs.existsSync(path.join(directory, 'package.json'))).toBe(true);
        expect(fs.existsSync(path.join(directory, 'node_modules'))).toBe(false);
        fs.rmSync(base, { recursive: true, force: true });
    });

    it('the managers spell their commands; the stamp fills only known keys', () => {
        expect(managerCommands({ manager: 'NPM' })).toEqual({ install: ['npm', ['install', '--no-audit', '--no-fund']], run: 'npm run' });
        expect(managerCommands({ manager: 'Yarn' }).run).toBe('yarn');
        expect(stamp('a __#X#__ __#Y#__', { X: '1' })).toBe('a 1 __#Y#__');
    });
});
