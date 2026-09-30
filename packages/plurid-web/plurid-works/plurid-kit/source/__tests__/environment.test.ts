// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    // #endregion libraries


    // #region internal
    import {
        loadEnvironment,
    } from '../cli/environment';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE MOST SPECIFIC FILE WINS (2026-09-29). dotenv never overwrites a key that is already set, and the
 * files were loaded least specific first: `.env`'s `API_URL=http://localhost:4000` beat
 * `.env.production`'s, and `plurid build` inlined the localhost URL into the production client.
 */
describe('loadEnvironment()', () => {
    const keys = ['PLURID_ENV_API', 'PLURID_ENV_BASE', 'PLURID_ENV_LOCAL', 'PLURID_ENV_SHELL', 'PLURID_ENV_NESTED'];
    let directory: string;

    beforeEach(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-env-'));
        fs.mkdirSync(path.join(directory, 'environment'));
        for (const key of keys) {
            delete process.env[key];
        }
    });

    afterEach(() => {
        fs.rmSync(directory, { recursive: true, force: true });
        for (const key of keys) {
            delete process.env[key];
        }
    });

    const write = (file: string, lines: string[]) => fs.writeFileSync(path.join(directory, file), lines.join('\n') + '\n');

    it('.env.<mode>.local > .env.<mode> > .env.local > .env; a variable already in the environment beats every file', () => {
        write('.env', ['PLURID_ENV_API=http://localhost:4000', 'PLURID_ENV_BASE=base', 'PLURID_ENV_LOCAL=from-env', 'PLURID_ENV_SHELL=from-file']);
        write('.env.local', ['PLURID_ENV_LOCAL=from-env-local']);
        write('.env.production', ['PLURID_ENV_API=https://api.example.com']);
        write('.env.development', ['PLURID_ENV_API=http://dev.example.com']);
        process.env.PLURID_ENV_SHELL = 'from-shell';

        loadEnvironment('production', directory);

        expect(process.env.PLURID_ENV_API).toBe('https://api.example.com');
        expect(process.env.PLURID_ENV_BASE).toBe('base');
        expect(process.env.PLURID_ENV_LOCAL).toBe('from-env-local');
        expect(process.env.PLURID_ENV_SHELL).toBe('from-shell');
    });

    it('.env.<mode>.local wins over .env.<mode>, and specificity wins over the directory (environment/)', () => {
        write('.env', ['PLURID_ENV_API=root-base', 'PLURID_ENV_NESTED=root-base']);
        write('environment/.env.production', ['PLURID_ENV_API=nested-production', 'PLURID_ENV_NESTED=nested-production']);
        write('environment/.env.production.local', ['PLURID_ENV_API=nested-production-local']);

        loadEnvironment('production', directory);

        expect(process.env.PLURID_ENV_API).toBe('nested-production-local');
        expect(process.env.PLURID_ENV_NESTED).toBe('nested-production');
    });
});
// #endregion module
