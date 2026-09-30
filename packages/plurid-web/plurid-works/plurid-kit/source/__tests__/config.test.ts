// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    // #endregion libraries


    // #region internal
    import {
        loadPluridConfig,
    } from '../cli/config';
    // #endregion internal
// #endregion imports



// #region module
const temporary = () => fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-config-'));

/** Every path under `directory`, relative, sorted. */
const listing = (
    directory: string,
): string[] => {
    const entries: string[] = [];
    const walk = (current: string, prefix: string) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const relative = prefix ? prefix + '/' + entry.name : entry.name;
            entries.push(relative);
            if (entry.isDirectory()) {
                walk(path.join(current, entry.name), relative);
            }
        }
    };
    walk(directory, '');
    return entries.sort();
};

const silenced = async <T>(run: () => Promise<T>): Promise<{ value: T; written: string }> => {
    const written: string[] = [];
    const spy = jest.spyOn(process.stderr, 'write').mockImplementation((chunk: any) => {
        written.push(String(chunk));
        return true;
    });
    try {
        return { value: await run(), written: written.join('') };
    } finally {
        spy.mockRestore();
    }
};


describe('loadPluridConfig() writes nothing (2026-09-29)', () => {
    it('loads where the application directory cannot be written to (`node_modules` is not a directory here)', async () => {
        // a read-only image (`readOnlyRootFilesystem`), or a non-root user over a root-owned /app: the
        // config was bundled into `node_modules/.plurid-kit/`, and `plurid start` exited before the server ran
        const directory = temporary();
        try {
            fs.writeFileSync(path.join(directory, 'node_modules'), 'not a directory');
            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                "export default { serverName: 'read-only', buildDir: 'dist' };",
            );
            const before = listing(directory);

            const config = await loadPluridConfig(directory, { strict: true });

            expect(config.serverName).toBe('read-only');
            expect(config.buildDir).toBe('dist');
            expect(listing(directory)).toEqual(before);
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    it('resolves the config\'s bare imports from the application\'s own node_modules', async () => {
        const directory = temporary();
        try {
            fs.mkdirSync(path.join(directory, 'node_modules', 'plurid-kit-fixture-lib'), { recursive: true });
            fs.writeFileSync(
                path.join(directory, 'node_modules', 'plurid-kit-fixture-lib', 'index.js'),
                "module.exports = { name: 'from-the-application' };",
            );
            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                "import library from 'plurid-kit-fixture-lib';\nexport default { serverName: library.name };",
            );

            const config = await loadPluridConfig(directory, { strict: true });

            expect(config.serverName).toBe('from-the-application');
            expect(fs.existsSync(path.join(directory, 'node_modules', '.plurid-kit'))).toBe(false);
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });
});


describe('a present but broken plurid.config.ts (2026-09-29)', () => {
    it('is fatal where the artifact is made (`strict`: plurid build / start), named with its cause', async () => {
        const directory = temporary();
        try {
            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                "if (!process.env.PLURID_KIT_TEST_UNSET) { throw new Error('PUBLIC_API_URL is required'); }\nexport default { buildDir: 'dist' };",
            );
            await expect(silenced(() => loadPluridConfig(directory, { strict: true })))
                .rejects.toThrow(/could not load plurid\.config\.ts: PUBLIC_API_URL is required/);

            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                "import missing from './does-not-exist';\nexport default { serverName: missing };",
            );
            await expect(silenced(() => loadPluridConfig(directory, { strict: true })))
                .rejects.toThrow(/could not bundle plurid\.config\.ts: plurid\.config\.ts:1:\d+: Could not resolve "\.\/does-not-exist"/);
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    it('stays a loud warning and the conventions for `plurid dev` / `info` (not strict)', async () => {
        const directory = temporary();
        try {
            fs.writeFileSync(
                path.join(directory, 'plurid.config.ts'),
                "throw new Error('evaluation failed');\nexport default {};",
            );
            const { value, written } = await silenced(() => loadPluridConfig(directory));
            expect(value).toEqual({});
            expect(written).toMatch(/could not load plurid\.config\.ts: evaluation failed/);
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });
});
// #endregion module
